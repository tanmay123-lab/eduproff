import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', verified: false, status: 'invalid', trustScore: 0, explanation: 'Invalid request.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, issuer, certificateCode } = body;

    if (!title || !issuer) {
      return new Response(
        JSON.stringify({ error: 'Title and issuer are required', verified: false, status: 'invalid', trustScore: 0, explanation: 'Title and issuer are required.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!certificateCode?.trim()) {
      return new Response(
        JSON.stringify({
          verified: false, trustScore: 10, status: 'invalid',
          explanation: 'No certificate code provided. Please enter your certificate code for verification.',
          extractedTitle: title.trim(), extractedIssuer: issuer.trim(), extractedDate: null,
          checks: [{ name: "Certificate Code Validation", passed: false, score: 10, details: 'No certificate code provided' }],
          warnings: ['No certificate code provided']
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query Supabase issued_certificates table using service role for cross-institution lookup
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const normalizedCode = certificateCode.trim();
    const { data: certRecord, error: dbError } = await serviceClient
      .from('issued_certificates')
      .select('*')
      .eq('certificate_id', normalizedCode)
      .maybeSingle();

    if (dbError) {
      console.error("Database query error:", dbError);
      return new Response(
        JSON.stringify({
          verified: false, trustScore: 0, status: 'error',
          explanation: 'Verification system error. Please try again later.',
          extractedTitle: title.trim(), extractedIssuer: issuer.trim(), extractedDate: null,
          checks: [], warnings: ['System error during verification']
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let verified: boolean;
    let trustScore: number;
    let status: string;
    let explanation: string;

    if (certRecord) {
      verified = true;
      trustScore = 95;
      status = 'verified';
      explanation = `Certificate ID "${normalizedCode}" exists in institution records. Student: ${certRecord.student_name}, Course: ${certRecord.course_name}.`;
    } else {
      verified = false;
      trustScore = 10;
      status = 'invalid';
      explanation = `Certificate ID "${normalizedCode}" not found in institutional database.`;
    }

    const result = {
      verified,
      trustScore,
      status,
      explanation,
      extractedTitle: title.trim(),
      extractedIssuer: issuer.trim(),
      extractedDate: certRecord?.issue_date || null,
      checks: [
        {
          name: "Certificate Code Validation",
          passed: verified,
          score: trustScore,
          details: verified
            ? `Valid certificate code: ${normalizedCode}`
            : 'Certificate code not found in registry'
        }
      ],
      warnings: verified ? [] : ['Certificate code could not be verified']
    };

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
        status: 'error',
        explanation: "Verification system error."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
