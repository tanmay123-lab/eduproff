import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Keep the retired route explicit so deploying this version replaces the old handler.
serve((req) => {
  const headers = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  return new Response(JSON.stringify({ error: "Account roles are assigned at registration" }), {
    status: 410,
    headers: { ...headers, "Content-Type": "application/json" },
  });
});
