import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { AppRole } from "@/lib/adminAuth";

interface ManagedRole {
  id: string;
  role: AppRole;
  unit_id: string | null;
}

interface ManagedUser {
  user_id: string;
  email: string;
  nome: string | null;
  is_self: boolean;
  roles: ManagedRole[];
}

interface Unit {
  id: string;
  nome: string;
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  editor: "Editor",
  gerente: "Gerente",
};

const ROLE_HINT: Record<AppRole, string> = {
  admin: "Acesso total, incluindo unidades, vagas, histórico e usuários.",
  editor: "Conteúdo: portfólio, bebidas, cardápio, traduções e configurações.",
  gerente: "Reservas e candidaturas — restrito à unidade vinculada.",
};

/**
 * Gestão do acesso administrativo.
 *
 * Fecha o ciclo de vida que existia só pela metade: antes era possível criar
 * um usuário administrativo (em Configurações), mas não havia tela para ver
 * quem tinha acesso, trocar papel, vincular a unidade de um gerente ou
 * revogar o acesso de quem saiu.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<ManagedUser | null>(null);
  const { logAction } = useAuditLog();

  const call = useCallback(
    async <T,>(payload: Record<string, unknown>): Promise<T> => {
      const { data, error } = await supabase.functions.invoke("manage-user-role", {
        body: payload,
      });
      if (error) throw new Error(error.message);
      const result = (data ?? {}) as { error?: string };
      if (result.error) throw new Error(result.error);
      return result as T;
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, unitsRes] = await Promise.all([
        call<{ users?: ManagedUser[] }>({ action: "list" }),
        supabase.from("units").select("id,nome").order("principal", { ascending: false }),
      ]);
      setUsers(result.users ?? []);
      setUnits(unitsRes.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (user: ManagedUser, role: AppRole) => {
    setBusyId(user.user_id);
    try {
      const currentUnit = user.roles.find((r) => r.role === "gerente")?.unit_id ?? null;
      await call<{ success: boolean }>({
        action: "set_role",
        user_id: user.user_id,
        role,
        unit_id: role === "gerente" ? currentUnit : null,
      });
      await logAction(
        "usuarios",
        "editou",
        `Alterou papel de ${user.email || user.nome || user.user_id} para ${ROLE_LABEL[role]}`,
        { tabela: "user_roles", registroId: user.user_id },
      );
      toast.success("Papel atualizado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao alterar o papel.");
    } finally {
      setBusyId(null);
    }
  };

  const changeUnit = async (user: ManagedUser, unitId: string) => {
    setBusyId(user.user_id);
    try {
      await call<{ success: boolean }>({ action: "set_unit", user_id: user.user_id, unit_id: unitId || null });
      const unitName = units.find((u) => u.id === unitId)?.nome ?? "todas as unidades";
      await logAction(
        "usuarios",
        "editou",
        `Vinculou ${user.email || user.user_id} a ${unitName}`,
        { tabela: "user_roles", registroId: user.user_id },
      );
      toast.success("Unidade atualizada.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao alterar a unidade.");
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async () => {
    if (!pendingRevoke) return;
    const user = pendingRevoke;
    setPendingRevoke(null);
    setBusyId(user.user_id);
    try {
      await call<{ success: boolean }>({ action: "revoke", user_id: user.user_id });
      await logAction(
        "usuarios",
        "excluiu",
        `Revogou o acesso administrativo de ${user.email || user.nome || user.user_id}`,
        { tabela: "user_roles", registroId: user.user_id },
      );
      toast.success("Acesso revogado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao revogar o acesso.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando usuários...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primary" /> Usuários e Permissões
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quem tem acesso ao painel. Para criar um novo usuário, use Configurações.
        </p>
      </div>

      {users.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum usuário administrativo encontrado.</p>
      )}

      <div className="space-y-3">
        {users.map((user) => {
          const role = user.roles[0]?.role;
          const gerenteUnit = user.roles.find((r) => r.role === "gerente")?.unit_id ?? "";
          const busy = busyId === user.user_id;

          return (
            <div key={user.user_id} className="glass-effect rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium flex items-center gap-2">
                    {user.nome || user.email || user.user_id}
                    {user.is_self && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        você
                      </span>
                    )}
                  </p>
                  {user.email && user.nome && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                  {role && (
                    <p className="mt-1 text-[11px] text-muted-foreground">{ROLE_HINT[role]}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Papel</Label>
                    <select
                      className="mt-1 block h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                      value={role ?? ""}
                      disabled={busy}
                      onChange={(e) => changeRole(user, e.target.value as AppRole)}
                    >
                      {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {role === "gerente" && (
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Unidade</Label>
                      <select
                        className="mt-1 block h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                        value={gerenteUnit}
                        disabled={busy}
                        onChange={(e) => changeUnit(user, e.target.value)}
                      >
                        <option value="">Todas as unidades</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy || user.is_self}
                    onClick={() => setPendingRevoke(user)}
                    title={user.is_self ? "Você não pode revogar o seu próprio acesso" : "Revogar acesso"}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.is_self ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <ShieldOff className="h-4 w-4" />
                    )}
                    <span className="ml-2">Revogar</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!pendingRevoke} onOpenChange={(o) => !o && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar acesso administrativo?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevoke?.email || pendingRevoke?.nome} perde o acesso ao painel
              imediatamente. A conta de login e o histórico de auditoria são preservados —
              você pode conceder acesso novamente depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={revoke}>Revogar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
