import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// UUID validation schema
const CertificateIdSchema = z.object({
  certificateId: z.string().uuid("Invalid certificate ID format"),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = CertificateIdSchema.safeParse(body);
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Invalid certificate ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { certificateId } = validated.data;
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
