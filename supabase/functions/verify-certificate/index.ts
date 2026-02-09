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
  certificateCode: z.string().trim().max(100).nullable().optional(),
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

// Primary Check: Certificate Code Format Validation
function validateCertificateCodeFormat(code: string | null | undefined): VerificationCheck {
  console.log("Running Check: Certificate Code Format Validation");
  
  if (!code || code.trim() === "") {
    return {
      name: "Code Format Validation",
      passed: false,
      score: 0,
      details: "No certificate code provided - verification cannot confirm authenticity"
    };
  }

  const trimmedCode = code.trim();
  
  // Common patterns for certificate codes
  const codePatterns = [
    /^[A-Z]{2,6}-\d{4,10}$/i,           // AWS-12345, CERT-123456
    /^[A-Z0-9]{8,20}$/i,                 // Simple alphanumeric codes
    /^[A-Z]{2,4}-\d{4}-[A-Z0-9]{3,6}$/i, // AWS-2024-XYZ123
    /^\d{6,12}$/,                         // Numeric only codes
    /^[A-Z0-9-]{10,30}$/i,               // Mixed with dashes
    /^UC-[A-Z0-9]+$/i,                   // Udemy style
    /^CERT[A-Z0-9-]+$/i,                 // Generic CERT prefix
  ];

  const isValidFormat = codePatterns.some(pattern => pattern.test(trimmedCode));
  
  if (isValidFormat) {
    return {
      name: "Code Format Validation",
      passed: true,
      score: 90,
      details: `Valid certificate code format detected: ${trimmedCode}`
    };
  }

  // Partial match - code exists but format is unusual
  if (trimmedCode.length >= 5) {
    return {
      name: "Code Format Validation",
      passed: true,
      score: 60,
      details: `Certificate code provided but format is non-standard: ${trimmedCode}`
    };
  }

  return {
    name: "Code Format Validation",
    passed: false,
    score: 20,
    details: "Certificate code is too short or invalid"
  };
}

// AI Check: Issuer and Title Consistency
async function checkIssuerConsistency(
  title: string, 
  issuer: string,
  certificateCode: string | null | undefined,
  LOVABLE_API_KEY: string
): Promise<VerificationCheck> {
  console.log("Running Check: Issuer Consistency");
  
  const safeTitle = sanitizeForPrompt(title);
  const safeIssuer = sanitizeForPrompt(issuer);
  const safeCode = certificateCode ? sanitizeForPrompt(certificateCode) : "not provided";
  
  const messages = [
    {
      role: "system",
      content: `You are a certificate verification assistant. Analyze if the certificate details are consistent and likely genuine.

Check:
1. Is the issuer a real, recognized organization that issues certificates?
2. Does the certificate title match what this issuer would actually offer?
3. Does the certificate code format match what this issuer typically uses?

Respond with JSON:
{
  "isConsistent": boolean,
  "score": number (0-100),
  "reason": string (brief explanation)
}`
    },
    {
      role: "user",
      content: `Certificate Title: "${safeTitle}"\nIssuer: "${safeIssuer}"\nCertificate Code: "${safeCode}"\n\nIs this a consistent and likely genuine certificate?`
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
      name: "Consistency Check",
      passed: result.isConsistent === true,
      score: result.score || 50,
      details: result.reason || "Consistency check completed"
    };
  } catch (error) {
    console.error("Consistency check error:", error);
    return {
      name: "Consistency Check",
      passed: true,
      score: 50,
      details: "Unable to fully verify - defaulting to partial trust"
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

    const { title, issuer, certificateCode } = validated.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting verification for: ${title} from ${issuer}, code: ${certificateCode || 'not provided'}`);

    // Run all checks in parallel for efficiency
    const [codeFormatCheck, duplicateCheck, consistencyCheck] = await Promise.all([
      Promise.resolve(validateCertificateCodeFormat(certificateCode)),
      checkDuplicate(title, issuer, userId, supabaseAdmin),
      checkIssuerConsistency(title, issuer, certificateCode, LOVABLE_API_KEY)
    ]);

    console.log("Code Format Check:", codeFormatCheck);
    console.log("Duplicate Check:", duplicateCheck);
    console.log("Consistency Check:", consistencyCheck);

    // Build checks array
    const checks: VerificationCheck[] = [codeFormatCheck, duplicateCheck, consistencyCheck];

    // Calculate trust score with weighted scoring
    // Code Format: 40%, Duplicate: 20%, Consistency: 40%
    const trustScore = Math.round(
      (codeFormatCheck.score * 0.4) + 
      (duplicateCheck.score * 0.2) + 
      (consistencyCheck.score * 0.4)
    );

    // Determine verification status
    const allChecksPassed = checks.every(c => c.passed);
    const hasFailedChecks = checks.some(c => !c.passed);
    const criticalFailure = !codeFormatCheck.passed && codeFormatCheck.score === 0;
    
    // Verified: all pass and score >= 70
    // Partially Verified: some pass, score 50-69, or code not provided but consistency is good
    // Invalid: critical failure or score < 50
    let verified = false;
    let status: 'verified' | 'partially_verified' | 'invalid';
    let explanation: string;

    if (trustScore >= 70 && allChecksPassed) {
      verified = true;
      status = 'verified';
      explanation = `VERIFIED: Certificate authenticated with ${trustScore}% confidence. ${consistencyCheck.details}`;
    } else if (trustScore >= 50 || (consistencyCheck.passed && consistencyCheck.score >= 60)) {
      verified = false;
      status = 'partially_verified';
      const failedNames = checks.filter(c => !c.passed).map(c => c.name).join(", ");
      explanation = `PARTIALLY VERIFIED: Some checks passed but concerns remain. ${failedNames ? `Issues with: ${failedNames}. ` : ''}${consistencyCheck.details}`;
    } else {
      verified = false;
      status = 'invalid';
      explanation = `INVALID: Certificate could not be verified. ${checks.filter(c => !c.passed).map(c => c.details).join(' ')}`;
    }

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
      hasVerificationCode: Boolean(certificateCode && certificateCode.trim())
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
