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
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ status: "not_found", trust_score: 0, message: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { certificate_id } = body;

    if (!certificate_id?.trim()) {
      return new Response(
        JSON.stringify({ status: "not_found", trust_score: 0, message: "Certificate ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const normalizedCode = certificate_id.trim();
    const { data: certRecord, error: dbError } = await serviceClient
      .from('issued_certificates')
      .select('*')
      .eq('certificate_id', normalizedCode)
      .maybeSingle();

    if (dbError) {
      console.error("Database query error:", dbError);
      return new Response(
        JSON.stringify({ status: "error", trust_score: 0, message: "Verification system error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (certRecord) {
      return new Response(
        JSON.stringify({
          status: "verified",
          trust_score: 100,
          message: "Certificate Verified Successfully",
          student_name: certRecord.student_name,
          course_name: certRecord.course_name,
          issue_date: certRecord.issue_date,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: "not_found", trust_score: 0, message: "Certificate Not Found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-certificate:", error);
    return new Response(
      JSON.stringify({ status: "error", trust_score: 0, message: "Verification system error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
