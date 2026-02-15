import { supabase } from "@/integrations/supabase/client";

export const useAuditLog = () => {
  const logAction = async (modulo: string, acao: string, descricao: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", session.user.id)
        .single();

      await (supabase.from("audit_logs") as any).insert({
        user_id: session.user.id,
        user_nome: profile?.nome || session.user.email || "Admin",
        acao,
        modulo,
        descricao,
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  };

  return { logAction };
};
