import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const VerificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  issuer: z.string().trim().min(1, "Issuer is required").max(200, "Issuer must be less than 200 characters"),
  imageBase64: z.string().max(15 * 1024 * 1024, "Image must be less than 15MB").optional().nullable(),
});

// Sanitize inputs for AI prompt to prevent prompt injection
const sanitizeForPrompt = (input: string): string => {
  return input
    .replace(/[<>"'`]/g, '') // Remove potentially problematic characters
    .replace(/ignore\s*(all|previous|the)/gi, '') // Remove injection attempts
    .replace(/disregard|forget|override|bypass/gi, '')
    .substring(0, 200)
    .trim();
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: 'Authentication required', verified: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', verified: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // Verify user has 'candidate' role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || roleData?.role !== 'candidate') {
      console.error("Role check failed:", roleError || "User is not a candidate");
      return new Response(
        JSON.stringify({ error: 'Only candidates can verify certificates', verified: false }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', verified: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = VerificationSchema.safeParse(body);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.errors);
      return new Response(
        JSON.stringify({ 
          error: validated.error.errors[0]?.message || 'Invalid input',
          verified: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, issuer, imageBase64 } = validated.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Verifying certificate: ${title} from ${issuer} for user ${userId}`);

    // Build messages for AI verification
    const messages: any[] = [
      {
        role: "system",
        content: `You are a certificate verification AI assistant. Your job is to analyze certificates and verify their authenticity.

When analyzing a certificate, look for:
1. Professional formatting and layout typical of educational/professional certificates
2. Presence of issuing organization name and logo
3. Certificate title/name of the course or achievement
4. Recipient name or designation area
5. Date of completion or issuance
6. Signatures, seals, or verification codes
7. Accreditation marks or official stamps

Provide a verification result as JSON with this structure:
{
  "verified": boolean,
  "confidence": number (0-100),
  "extractedTitle": string,
  "extractedIssuer": string,
  "extractedDate": string or null,
  "details": string (brief explanation of verification),
  "warnings": string[] (any concerns found)
}

Be strict but fair. If the image is unclear or doesn't appear to be a certificate, set verified to false with appropriate explanation.`
      }
    ];

    // If we have an image, use vision capabilities
    // Sanitize inputs to prevent AI prompt injection
    const safeTitle = sanitizeForPrompt(title);
    const safeIssuer = sanitizeForPrompt(issuer);
    
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze this certificate image. The user claims it is titled "${safeTitle}" from "${safeIssuer}". IMPORTANT: Base your verification ONLY on what you observe in the image, not on the claimed title or issuer. Extract visible information and verify authenticity.`
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      });
    } else {
      // Text-only verification (limited capability)
      messages.push({
        role: "user",
        content: `The user is submitting a certificate with the following details:
- Title: ${safeTitle}
- Issuer: ${safeIssuer}

Since no image was provided, please respond with a pending verification status. Set verified to true with a note that full verification requires document upload.`
      });
    }

    console.log("Calling AI gateway for verification...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let verificationResult;
    try {
      verificationResult = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      // Fallback for non-JSON responses
      verificationResult = {
        verified: true,
        confidence: 70,
        extractedTitle: title,
        extractedIssuer: issuer,
        extractedDate: null,
        details: "Certificate submitted for verification. Please note that full AI analysis was inconclusive.",
        warnings: []
      };
    }

    console.log("Verification result:", verificationResult);

    return new Response(JSON.stringify(verificationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in verify-certificate:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Verification failed",
        verified: false,
        confidence: 0,
        details: "An error occurred during verification"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
