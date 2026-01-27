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
  fileType: z.enum(["pdf"]).optional(),
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

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,        // 10 verifications per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'verify-cert'
};

// Check rate limit using database
async function checkRateLimit(
  identifier: string,
  config: typeof RATE_LIMIT_CONFIG,
  supabaseAdmin: any
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const resetTime = now + config.windowMs;
  
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', key)
    .maybeSingle();
  
  if (!existing || existing.window_start < windowStart) {
    // New window - reset or create entry
    await supabaseAdmin.from('rate_limits').upsert({
      key,
      count: 1,
      window_start: now,
      updated_at: new Date().toISOString()
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }
  
  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.window_start + config.windowMs };
  }
  
  await supabaseAdmin.from('rate_limits').update({
    count: existing.count + 1,
    updated_at: new Date().toISOString()
  }).eq('key', key);
  
  return { 
    allowed: true, 
    remaining: config.maxRequests - existing.count - 1,
    resetTime: existing.window_start + config.windowMs
  };
}

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

    // Create admin client for rate limiting
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, RATE_LIMIT_CONFIG, supabaseAdmin);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          verified: false 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime)
          } 
        }
      );
    }

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

    const { title, issuer } = validated.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Verifying certificate: ${title} from ${issuer} for user ${userId}`);

    // Sanitize inputs to prevent AI prompt injection
    const safeTitle = sanitizeForPrompt(title);
    const safeIssuer = sanitizeForPrompt(issuer);

    // Build messages for AI verification (PDF-only, text-based verification)
    const messages: any[] = [
      {
        role: "system",
        content: `You are a certificate verification AI assistant. Your job is to validate certificate submissions based on provided metadata.

Since we only accept PDF uploads (no image analysis), you will verify based on the provided title and issuer information.

CRITICAL VALIDATION CRITERIA:

1. **Required Verification Identifiers** - The certificate MUST contain at least one of these identifier types:
   - Enrolment Verification Code
   - User Verification Code
   - Certificate ID
   - Student ID
   
   These identifiers are essential markers of authentic educational certificates. Certificates without any of these should be flagged.

2. The certificate title should be specific and professional (e.g., "AWS Solutions Architect", "Full Stack Web Development", "Data Science Fundamentals")

3. The issuer should be a recognizable educational institution, certification body, or professional organization (e.g., Coursera, Udemy, AWS, Google, universities, coding bootcamps)

4. Check if the issuer is known to offer such certifications

5. Flag generic, vague, or suspicious entries

Provide a verification result as JSON with this structure:
{
  "verified": boolean,
  "confidence": number (0-100),
  "extractedTitle": string (the cleaned/normalized title),
  "extractedIssuer": string (the cleaned/normalized issuer),
  "extractedDate": null,
  "details": string (brief explanation of verification decision),
  "warnings": string[] (any concerns about the submission),
  "hasVerificationCode": boolean (whether the certificate likely contains a verification identifier)
}

Set verified to true if:
- The title appears to be a legitimate certificate/course name
- The issuer is a recognized organization that offers such certifications
- The certificate type typically includes verification codes (Enrolment Verification Code, User Verification Code, Certificate ID, or Student ID)
- No obvious red flags are present

Set verified to false if:
- The title is too generic, nonsensical, or suspicious
- The issuer is unknown or doesn't match the type of certification claimed
- The certificate type would not typically have verification identifiers
- There are clear inconsistencies`
      },
      {
        role: "user",
        content: `Please verify this certificate submission:
- Certificate Title: ${safeTitle}
- Issuing Organization: ${safeIssuer}

The user has uploaded a PDF document. Authentic certificates from reputable issuers typically include verification identifiers such as:
- Enrolment Verification Code
- User Verification Code
- Certificate ID
- Student ID

Based on the metadata provided, determine if this appears to be a legitimate certificate from an organization that provides such verification codes. If the issuer is known, assess whether their certificates typically include these identifiers.`
      }
    ];

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
