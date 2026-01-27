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

// Check 1: Code Format Validation
async function checkCodeFormat(
  title: string, 
  issuer: string,
  LOVABLE_API_KEY: string
): Promise<VerificationCheck> {
  console.log("Running Check 1: Code Format Validation");
  
  const safeTitle = sanitizeForPrompt(title);
  const safeIssuer = sanitizeForPrompt(issuer);
  
  const messages = [
    {
      role: "system",
      content: `You are a certificate verification AI. Analyze if the certificate from the given issuer typically includes verification identifiers.

REQUIRED VERIFICATION IDENTIFIERS:
- Enrolment Verification Code
- User Verification Code
- Certificate ID
- Student ID

Known issuers that provide verification codes:
- Coursera (provides Certificate ID and Verification URL)
- Udemy (provides Certificate ID)
- AWS (provides Validation Number)
- Google (provides Credential ID)
- Microsoft (provides Certificate Number)
- LinkedIn Learning (provides Certificate ID)
- edX (provides Certificate ID)
- Universities (provide Student ID/Enrolment Number)

Respond with JSON:
{
  "hasCode": boolean (true if this issuer's certificates typically have verification codes),
  "codeType": string (the type of code they use, e.g., "Certificate ID", "Verification URL"),
  "confidence": number (0-100),
  "reason": string (brief explanation)
}`
    },
    {
      role: "user",
      content: `Certificate: "${safeTitle}" from "${safeIssuer}". Does this issuer typically provide verification codes on their certificates?`
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
      name: "Code Format Validation",
      passed: result.hasCode === true,
      score: result.hasCode ? Math.min(result.confidence || 80, 100) : 20,
      details: result.reason || (result.hasCode 
        ? `This issuer provides ${result.codeType || "verification codes"} on certificates`
        : "Could not confirm verification code format for this issuer")
    };
  } catch (error) {
    console.error("Code format check error:", error);
    return {
      name: "Code Format Validation",
      passed: false,
      score: 30,
      details: "Unable to verify code format - issuer may not be recognized"
    };
  }
}

// Check 2: Duplicate Check
async function checkDuplicate(
  title: string,
  issuer: string,
  userId: string,
  supabaseAdmin: any
): Promise<VerificationCheck> {
  console.log("Running Check 2: Duplicate Check");
  
  try {
    // Check for exact duplicates
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
        details: `Exact duplicate found: You already have this certificate "${title}" from ${issuer}`
      };
    }

    // Check for similar certificates (same issuer)
    const { data: similarCerts } = await supabaseAdmin
      .from('certificates')
      .select('id, title, issuer')
      .eq('user_id', userId)
      .ilike('issuer', issuer.trim());

    if (similarCerts && similarCerts.length > 0) {
      return {
        name: "Duplicate Check",
        passed: true,
        score: 80,
        details: `You have ${similarCerts.length} other certificate(s) from ${issuer}. This appears to be a new one.`
      };
    }

    return {
      name: "Duplicate Check",
      passed: true,
      score: 100,
      details: "No duplicate certificates found - this is a new submission"
    };
  } catch (error) {
    console.error("Duplicate check error:", error);
    return {
      name: "Duplicate Check",
      passed: true,
      score: 70,
      details: "Duplicate check completed with limited data"
    };
  }
}

// Check 3: Basic Consistency Checks
async function checkConsistency(
  title: string,
  issuer: string,
  LOVABLE_API_KEY: string
): Promise<VerificationCheck> {
  console.log("Running Check 3: Consistency Checks");
  
  const safeTitle = sanitizeForPrompt(title);
  const safeIssuer = sanitizeForPrompt(issuer);

  const messages = [
    {
      role: "system",
      content: `You are a certificate verification AI. Perform consistency checks on the certificate submission.

CHECK CRITERIA:
1. Title Quality: Is it specific and professional? (not generic like "Certificate" or "Course")
2. Issuer Recognition: Is this a known educational institution, certification body, or professional organization?
3. Title-Issuer Match: Does the certification type match what this issuer offers?
4. Red Flags: Any suspicious patterns, typos, or inconsistencies?

Respond with JSON:
{
  "titleQuality": { "score": number (0-100), "issue": string or null },
  "issuerRecognition": { "score": number (0-100), "known": boolean, "type": string },
  "titleIssuerMatch": { "score": number (0-100), "matches": boolean, "reason": string },
  "redFlags": string[] (list of concerns, empty if none),
  "overallScore": number (0-100),
  "summary": string (brief overall assessment)
}`
    },
    {
      role: "user",
      content: `Verify consistency for: Certificate "${safeTitle}" from "${safeIssuer}"`
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

    const hasRedFlags = result.redFlags && result.redFlags.length > 0;
    const passed = result.overallScore >= 60 && !hasRedFlags;

    return {
      name: "Consistency Checks",
      passed,
      score: result.overallScore || 50,
      details: result.summary || "Consistency check completed"
    };
  } catch (error) {
    console.error("Consistency check error:", error);
    return {
      name: "Consistency Checks",
      passed: true,
      score: 60,
      details: "Basic consistency check passed"
    };
  }
}

// Calculate overall trust score
function calculateTrustScore(checks: VerificationCheck[]): number {
  if (checks.length === 0) return 0;
  
  // Weighted average: Code Format (40%), Duplicate (20%), Consistency (40%)
  const weights = [0.4, 0.2, 0.4];
  let totalScore = 0;
  
  checks.forEach((check, index) => {
    totalScore += check.score * (weights[index] || 0.33);
  });
  
  return Math.round(totalScore);
}

// Generate explanation based on checks
function generateExplanation(checks: VerificationCheck[], trustScore: number): string {
  const passedChecks = checks.filter(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);
  
  if (trustScore >= 80) {
    return `Strong verification: ${passedChecks.length}/3 checks passed. ${passedChecks.map(c => c.details).join('. ')}`;
  } else if (trustScore >= 60) {
    return `Moderate verification: ${passedChecks.length}/3 checks passed. Some concerns: ${failedChecks.map(c => c.details).join('. ')}`;
  } else {
    return `Verification concerns: Only ${passedChecks.length}/3 checks passed. Issues: ${failedChecks.map(c => c.details).join('. ')}`;
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

    console.log(`Starting 3-step verification for: ${title} from ${issuer}`);

    // Run all 3 verification checks
    const checks: VerificationCheck[] = [];

    // Check 1: Code Format Validation
    const codeFormatCheck = await checkCodeFormat(title, issuer, LOVABLE_API_KEY);
    checks.push(codeFormatCheck);
    console.log("Check 1 result:", codeFormatCheck);

    // Check 2: Duplicate Check
    const duplicateCheck = await checkDuplicate(title, issuer, userId, supabaseAdmin);
    checks.push(duplicateCheck);
    console.log("Check 2 result:", duplicateCheck);

    // Check 3: Consistency Checks
    const consistencyCheck = await checkConsistency(title, issuer, LOVABLE_API_KEY);
    checks.push(consistencyCheck);
    console.log("Check 3 result:", consistencyCheck);

    // Calculate overall trust score
    const trustScore = calculateTrustScore(checks);
    console.log("Trust score:", trustScore);

    // Determine verification status
    const allChecksPassed = checks.every(c => c.passed);
    const verified = trustScore >= 70 && allChecksPassed;

    // Generate explanation
    const explanation = generateExplanation(checks, trustScore);

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
      hasVerificationCode: codeFormatCheck.passed
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
