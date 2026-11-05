// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AdminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("delete_user"),
    target_user_id: z.string().uuid("Invalid target user ID"),
  }),
  z.object({
    action: z.literal("mark_certificate"),
    certificate_id: z.string().uuid("Invalid certificate ID"),
    status: z.enum(["pending", "verified", "failed", "invalid"]),
    message: z.string().optional(),
  }),
]);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the caller's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role
    const { data: roleRecord, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRecord) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Administrator privileges required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parseResult = AdminActionSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parseResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = parseResult.data;

    if (payload.action === "delete_user") {
      // 1. Delete user from auth.users via Supabase Admin API
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(payload.target_user_id);
      if (deleteAuthError) {
        console.error("Failed to delete auth user:", deleteAuthError);
        return new Response(
          JSON.stringify({ error: `Failed to remove user account: ${deleteAuthError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Cascade cleanup from public tables (in case ON DELETE CASCADE is omitted on any foreign keys)
      await supabaseAdmin.from("profiles").delete().eq("user_id", payload.target_user_id);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", payload.target_user_id);
      await supabaseAdmin.from("certificates").delete().eq("user_id", payload.target_user_id);

      // 3. Log admin action
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "delete_user",
        target_id: payload.target_user_id,
        target_type: "user",
        details: { executed_by: user.email },
      });

      return new Response(
        JSON.stringify({ success: true, message: "User deleted completely from auth and database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (payload.action === "mark_certificate") {
      const { data: cert, error: updateCertError } = await supabaseAdmin
        .from("certificates")
        .update({
          verification_status: payload.status,
          verification_message: payload.message || `Status set to ${payload.status} by administrator`,
        })
        .eq("id", payload.certificate_id)
        .select()
        .single();

      if (updateCertError) {
        return new Response(
          JSON.stringify({ error: updateCertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log admin action
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "mark_certificate",
        target_id: payload.certificate_id,
        target_type: "certificate",
        details: { status: payload.status, message: payload.message },
      });

      return new Response(
        JSON.stringify({ success: true, data: cert }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin action execution error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
