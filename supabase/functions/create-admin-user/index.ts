import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const callerId = claimsData.claims.sub;

    // Check if caller is admin via the same RBAC function used by RLS.
    const { data: callerIsAdmin, error: adminCheckError } = await anonClient.rpc("is_admin");
    if (adminCheckError || !callerIsAdmin || !callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { email, password, nome, role = "admin", unit_id = null } = await req.json();
    if (!["admin", "editor", "gerente"].includes(role)) {
      return new Response(JSON.stringify({ error: "Papel administrativo inválido" }), { status: 400, headers: corsHeaders });
    }
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), { status: 400, headers: corsHeaders });
    }

    // Use service role to create user
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: corsHeaders });
    }

    // Persist the display name on the profile and the canonical RBAC role in user_roles.
    if (nome) {
      await adminClient.from("profiles").update({ nome }).eq("id", newUser.user.id);
    }
    await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
      unit_id,
    });

    return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders });
  }
});
