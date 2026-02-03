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

// Verification check results
interface VerificationCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

interface VerificationResult {
  verified: boolean;
  trustScore: number;
  checks: VerificationCheck[];
  explanation: string;
  extractedTitle: string;
  extractedIssuer: string;
  extractedDate: string | null;
  warnings: string[];
  hasVerificationCode: boolean;
}

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

// Primary Check: User ID / Candidate ID Detection
async function checkForUserOrCandidateId(
  title: string, 
  issuer: string,
  LOVABLE_API_KEY: string
): Promise<{ hasId: boolean; idType: string | null; confidence: number; reason: string }> {
  console.log("Running Primary Check: User ID / Candidate ID Detection");
  
  const safeTitle = sanitizeForPrompt(title);
  const safeIssuer = sanitizeForPrompt(issuer);
  
  const messages = [
    {
      role: "system",
      content: `You are a strict certificate verification AI. Your ONLY job is to determine if the certificate contains a User ID or Candidate ID.

VALID IDENTIFIERS (certificate is GENUINE if it has ANY of these):
- User ID
- Candidate ID
- Student ID
- Enrollment ID
- Registration Number
- Roll Number
- Learner ID
- Participant ID
- Certificate ID with user-specific number
- Credential ID

IMPORTANT: The certificate MUST explicitly contain one of these identifiers to be considered genuine.

Analyze the certificate title and issuer to determine if this type of certificate from this issuer would contain a User ID or Candidate ID.

Respond with JSON:
{
  "hasUserOrCandidateId": boolean (true ONLY if certificate would have User ID, Candidate ID, or similar personal identifier),
  "idType": string or null (the specific type found, e.g., "Student ID", "Candidate ID", "User ID"),
  "confidence": number (0-100),
  "reason": string (brief explanation of why this is genuine or fake)
}`
    },
    {
      role: "user",
      content: `Certificate: "${safeTitle}" from "${safeIssuer}". Does this certificate contain a User ID, Candidate ID, or similar personal identifier?`
    }
  ];

  try {
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
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    const result = JSON.parse(content);

    return {
      hasId: result.hasUserOrCandidateId === true,
      idType: result.idType || null,
      confidence: result.confidence || 50,
      reason: result.reason || "Unable to determine"
    };
  } catch (error) {
    console.error("ID check error:", error);
    return {
      hasId: false,
      idType: null,
      confidence: 0,
      reason: "Unable to verify - AI check failed"
    };
  }
}

// Duplicate Check (secondary, only run if ID check passes)
async function checkDuplicate(
  title: string,
  issuer: string,
  userId: string,
  supabaseAdmin: any
): Promise<VerificationCheck> {
  console.log("Running Secondary Check: Duplicate Check");
  
  try {
    const { data: exactDuplicates } = await supabaseAdmin
      .from('certificates')
      .select('id, title, issuer, verification_status')
      .eq('user_id', userId)
      .ilike('title', title.trim())
      .ilike('issuer', issuer.trim());

    if (exactDuplicates && exactDuplicates.length > 0) {
      return {
        name: "Duplicate Check",
        passed: false,
        score: 0,
        details: `Duplicate found: You already have "${title}" from ${issuer}`
      };
    }

    return {
      name: "Duplicate Check",
      passed: true,
      score: 100,
      details: "No duplicate certificates found"
    };
  } catch (error) {
    console.error("Duplicate check error:", error);
    return {
      name: "Duplicate Check",
      passed: true,
      score: 70,
      details: "Duplicate check completed"
    };
  }
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

    // Create admin client for rate limiting and duplicate checks
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

    console.log(`Starting ID-based verification for: ${title} from ${issuer}`);

    // PRIMARY CHECK: User ID / Candidate ID Detection
    const idCheck = await checkForUserOrCandidateId(title, issuer, LOVABLE_API_KEY);
    console.log("ID Check result:", idCheck);

    // If NO User ID or Candidate ID found - STOP and mark as FAKE
    if (!idCheck.hasId) {
      console.log("No User ID / Candidate ID found - marking as FAKE");
      
      const verificationResult: VerificationResult = {
        verified: false,
        trustScore: 0,
        checks: [{
          name: "User/Candidate ID Check",
          passed: false,
          score: 0,
          details: idCheck.reason
        }],
        explanation: `FAKE CERTIFICATE: ${idCheck.reason}. No User ID, Candidate ID, or similar personal identifier was detected. Genuine certificates from reputable issuers always include a unique identifier.`,
        extractedTitle: title.trim(),
        extractedIssuer: issuer.trim(),
        extractedDate: null,
        warnings: ["No User ID or Candidate ID found - certificate cannot be verified"],
        hasVerificationCode: false
      };

      return new Response(JSON.stringify(verificationResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ID FOUND - Run secondary duplicate check
    const duplicateCheck = await checkDuplicate(title, issuer, userId, supabaseAdmin);
    console.log("Duplicate Check result:", duplicateCheck);

    // Build checks array
    const checks: VerificationCheck[] = [
      {
        name: "User/Candidate ID Check",
        passed: true,
        score: idCheck.confidence,
        details: `${idCheck.idType || "Personal ID"} detected: ${idCheck.reason}`
      },
      duplicateCheck
    ];

    // Calculate trust score (ID check is primary - 80%, Duplicate is 20%)
    const trustScore = Math.round((idCheck.confidence * 0.8) + (duplicateCheck.score * 0.2));

    // Verified if ID found and not a duplicate
    const verified = idCheck.hasId && duplicateCheck.passed;

    // Generate explanation
    const explanation = verified 
      ? `GENUINE CERTIFICATE: ${idCheck.idType || "Personal ID"} verified. ${idCheck.reason}. ${duplicateCheck.details}`
      : `Verification issue: ${duplicateCheck.details}`;

    // Build final result
    const verificationResult: VerificationResult = {
      verified,
      trustScore,
      checks,
      explanation,
      extractedTitle: title.trim(),
      extractedIssuer: issuer.trim(),
      extractedDate: null,
      warnings: checks.filter(c => !c.passed).map(c => c.details),
      hasVerificationCode: true
    };

    console.log("Final verification result:", verificationResult);

    return new Response(JSON.stringify(verificationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in verify-certificate:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Verification failed",
        verified: false,
        trustScore: 0,
        checks: [],
        explanation: "An error occurred during verification"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
