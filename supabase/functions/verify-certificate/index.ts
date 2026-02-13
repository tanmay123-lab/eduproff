import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default valid codes (fallback if none provided by client)
const DEFAULT_VALID_CODES = [
  "EDU-2025-001",
  "EDU-2025-002", 
  "EDU-2025-003",
];

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

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', verified: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, issuer, certificateCode, validCodes } = body;

    // Validate required fields
    if (!title || !issuer) {
      return new Response(
        JSON.stringify({ error: 'Title and issuer are required', verified: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying certificate: ${title} from ${issuer}, code: ${certificateCode || 'not provided'}`);

    // Use validCodes from institution context if provided, otherwise fall back to defaults
    const registryCodes = (Array.isArray(validCodes) && validCodes.length > 0) ? validCodes.map((c: string) => c.toUpperCase()) : DEFAULT_VALID_CODES;
    const normalizedCode = certificateCode?.trim().toUpperCase() || '';
    const isValidCode = registryCodes.includes(normalizedCode);

    let verified: boolean;
    let trustScore: number;
    let status: 'verified' | 'invalid';
    let explanation: string;

    if (isValidCode) {
      verified = true;
      trustScore = 95;
      status = 'verified';
      explanation = `Certificate code ${normalizedCode} has been verified successfully. This is a valid credential.`;
    } else {
      verified = false;
      trustScore = 20;
      status = 'invalid';
      explanation = certificateCode 
        ? `Certificate code "${certificateCode}" could not be verified. Please check the code and try again.`
        : 'No certificate code provided. Please enter your certificate code for verification.';
    }

    const result = {
      verified,
      trustScore,
      status,
      explanation,
      extractedTitle: title.trim(),
      extractedIssuer: issuer.trim(),
      extractedDate: null,
      checks: [
        {
          name: "Certificate Code Validation",
          passed: isValidCode,
          score: isValidCode ? 95 : 20,
          details: isValidCode 
            ? `Valid certificate code: ${normalizedCode}` 
            : 'Certificate code not found in registry'
        }
      ],
      warnings: isValidCode ? [] : ['Certificate code could not be verified']
    };

    console.log("Verification result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in verify-certificate:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Verification failed",
        verified: false,
        trustScore: 0,
        status: 'invalid',
        explanation: "An error occurred during verification"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
