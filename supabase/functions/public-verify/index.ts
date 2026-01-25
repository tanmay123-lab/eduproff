import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateId } = await req.json();

    if (!certificateId) {
      return new Response(
        JSON.stringify({ error: "Certificate ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Public verification request for certificate: ${certificateId}`);

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch only public-safe certificate info
    const { data: certificate, error } = await supabaseAdmin
      .from("certificates")
      .select("id, title, issuer, verification_status, issue_date, created_at")
      .eq("id", certificateId)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to verify certificate" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!certificate) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: "No certificate found with this ID" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Certificate found: ${certificate.title} - Status: ${certificate.verification_status}`);

    return new Response(
      JSON.stringify({
        found: true,
        certificate: {
          id: certificate.id,
          title: certificate.title,
          issuer: certificate.issuer,
          status: certificate.verification_status,
          issueDate: certificate.issue_date,
          verifiedAt: certificate.created_at,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in public-verify:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
