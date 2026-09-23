import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Gestão do ciclo de vida do acesso administrativo.
 *
 * Antes só existia `create-admin-user`: era possível criar um usuário
 * administrativo, mas nunca listar quem tinha acesso, trocar papel, vincular
 * unidade a um gerente ou revogar o acesso de um ex-funcionário — o que só
 * dava pra fazer com SQL manual.
 *
 * Ações: list | set_role | set_unit | revoke
 *
 * Revogar remove as linhas de user_roles (o usuário perde acesso ao /admin),
 * mas preserva a conta em auth.users e o histórico em audit_logs.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_ROLES = ["admin", "editor", "gerente"] as const;
type Role = typeof VALID_ROLES[number];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

    const callerId = claimsData.claims.sub as string | undefined;
    if (!callerId) return json({ error: "Unauthorized" }, 401);

    // Mesma função de RBAC usada pelas políticas de RLS.
    const { data: callerIsAdmin, error: adminCheckError } = await anonClient.rpc("is_admin");
    if (adminCheckError || !callerIsAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /** Conta quantos admins existem, para impedir a remoção do último. */
    const countAdmins = async () => {
      const { count } = await admin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      return count ?? 0;
    };

    if (action === "list") {
      const { data: roleRows, error: rolesErr } = await admin
        .from("user_roles")
        .select("id, user_id, role, unit_id, created_at")
        .order("created_at", { ascending: true });
      if (rolesErr) return json({ error: rolesErr.message }, 500);

      const userIds = [...new Set((roleRows ?? []).map((r) => r.user_id))];

      // profiles e user_roles referenciam auth.users separadamente, sem FK
      // entre si, então o join não é possível pelo PostgREST.
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, nome, avatar_url")
        .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

      const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emailById = new Map(
        (authList?.users ?? []).map((u) => [u.id, u.email ?? ""]),
      );
      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

      const users = userIds.map((id) => ({
        user_id: id,
        email: emailById.get(id) ?? "",
        nome: profileById.get(id)?.nome ?? null,
        avatar_url: profileById.get(id)?.avatar_url ?? null,
        is_self: id === callerId,
        roles: (roleRows ?? [])
          .filter((r) => r.user_id === id)
          .map((r) => ({ id: r.id, role: r.role, unit_id: r.unit_id })),
      }));

      return json({ users, admin_count: await countAdmins() });
    }

    const targetUserId = String(body?.user_id ?? "");
    if (!targetUserId) return json({ error: "user_id é obrigatório" }, 400);

    if (action === "set_role") {
      const role = String(body?.role ?? "") as Role;
      if (!VALID_ROLES.includes(role)) return json({ error: "Papel inválido" }, 400);

      const unitId = body?.unit_id ? String(body.unit_id) : null;

      // Rebaixar a si mesmo ou remover o último admin tranca o sistema.
      if (targetUserId === callerId && role !== "admin") {
        return json({ error: "Você não pode alterar o seu próprio papel de admin." }, 400);
      }
      const { data: currentRoles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId);
      const wasAdmin = (currentRoles ?? []).some((r) => r.role === "admin");
      if (wasAdmin && role !== "admin" && (await countAdmins()) <= 1) {
        return json({ error: "Este é o último admin do sistema." }, 400);
      }

      // Um usuário tem um papel administrativo por vez: troca é substituição.
      const { error: delErr } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);
      if (delErr) return json({ error: delErr.message }, 500);

      const { error: insErr } = await admin
        .from("user_roles")
        .insert({ user_id: targetUserId, role, unit_id: role === "gerente" ? unitId : null });
      if (insErr) return json({ error: insErr.message }, 500);

      return json({ success: true });
    }

    if (action === "set_unit") {
      const unitId = body?.unit_id ? String(body.unit_id) : null;
      const { error } = await admin
        .from("user_roles")
        .update({ unit_id: unitId })
        .eq("user_id", targetUserId)
        .eq("role", "gerente");
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    if (action === "revoke") {
      if (targetUserId === callerId) {
        return json({ error: "Você não pode revogar o seu próprio acesso." }, 400);
      }
      const { data: currentRoles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId);
      const wasAdmin = (currentRoles ?? []).some((r) => r.role === "admin");
      if (wasAdmin && (await countAdmins()) <= 1) {
        return json({ error: "Este é o último admin do sistema." }, 400);
      }

      const { error } = await admin.from("user_roles").delete().eq("user_id", targetUserId);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    return json({ error: "Ação não reconhecida" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});
