import { supabase } from "@/integrations/supabase/client";

/**
 * Referência ao registro afetado. Sem isso o log guardava apenas módulo e uma
 * descrição em texto livre, e era impossível ver o histórico de um item
 * específico ou navegar do log até ele — dois itens de mesmo nome geravam
 * entradas indistinguíveis.
 */
interface AuditTarget {
  /** Tabela do registro (ex.: "weekly_menu_items"). */
  tabela?: string;
  /** ID do registro afetado. */
  registroId?: string | null;
}

export const useAuditLog = () => {
  const logAction = async (
    modulo: string,
    acao: string,
    descricao: string,
    target: AuditTarget = {},
  ) => {
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
        tabela: target.tabela ?? null,
        registro_id: target.registroId ?? null,
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  };

  return { logAction };
};
