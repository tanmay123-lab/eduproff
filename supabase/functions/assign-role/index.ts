import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const RoleSchema = z.object({
  requestedRole: z.enum(["candidate", "recruiter"], {
    errorMap: () => ({ message: "Invalid role. Must be 'candidate' or 'recruiter'" }),
  }),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Processing role assignment for user: ${userId}`);

    // Parse and validate the request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = RoleSchema.safeParse(body);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.errors);
      return new Response(
        JSON.stringify({ error: validated.error.errors[0]?.message || 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { requestedRole } = validated.data;

    // Use service role to update the role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user already has a role (should be assigned by trigger)
    const { data: existingRole, error: fetchError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = row not found, which is acceptable
      console.error("Error fetching existing role:", fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing role' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingRole) {
      // Update existing role (trigger-assigned 'candidate' to user-selected role)
      const { error: updateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: requestedRole })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating role:", updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Updated role for user ${userId} from ${existingRole.role} to ${requestedRole}`);
    } else {
      // Insert new role (should rarely happen since trigger creates it)
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: requestedRole });

      if (insertError) {
        console.error("Error inserting role:", insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to assign role' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Inserted role ${requestedRole} for user ${userId}`);
    }

    return new Response(
      JSON.stringify({ success: true, role: requestedRole }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in assign-role:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Role assignment failed' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
