import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Calendar, Clock, Users, MessageCircle, CheckCircle2, XCircle, AlertCircle, Trophy, Hourglass, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

type Status = "pendente" | "confirmada" | "cancelada" | "no_show" | "concluida";

const STATUS_CFG: Record<Status, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pendente:   { label: "Pendentes",   icon: Hourglass,    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  confirmada: { label: "Confirmadas", icon: CheckCircle2, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  concluida:  { label: "Concluídas",  icon: Trophy,       color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelada:  { label: "Canceladas",  icon: XCircle,      color: "bg-red-500/10 text-red-400 border-red-500/20" },
  no_show:    { label: "No-show",     icon: AlertCircle,  color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
};

const STATUSES: Status[] = ["pendente", "confirmada", "concluida", "cancelada", "no_show"];

const AdminReservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [activeTab, setActiveTab] = useState<Status>("pendente");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [r, u] = await Promise.all([
      supabase.from("reservations").select("*").order("data", { ascending: true }),
      supabase.from("units").select("id, nome"),
    ]);
    if (r.data) setReservations(r.data);
    if (u.data) setUnits(u.data);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: Status, name: string) => {
    const { error } = await supabase.from("reservations").update({ status } as any).eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); return; }
    await logAction("reservas", "editou", `Moveu reserva de ${name} para "${STATUS_CFG[status].label}"`);
    toast.success("Status atualizado!");
    fetchData();
  };

  const updateUnit = async (id: string, unit_id: string | null, name: string) => {
    const { error } = await supabase.from("reservations").update({ unit_id } as any).eq("id", id);
    if (error) { toast.error("Erro."); return; }
    await logAction("reservas", "editou", `Vinculou reserva de ${name} a unidade`);
    toast.success("Unidade vinculada!");
    fetchData();
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase.from("reservations").update({ observacoes_internas: internalNotes } as any).eq("id", selected.id);
    if (error) { toast.error("Erro."); return; }
    await logAction("reservas", "editou", `Atualizou observações internas de ${selected.nome}`);
    toast.success("Observações salvas!");
    setSelected({ ...selected, observacoes_internas: internalNotes });
    fetchData();
  };

  const openWhatsApp = (r: any) => {
    const phone = r.telefone.replace(/\D/g, "");
    const dataFmt = new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR");
    const msg = `Olá ${r.nome}! Sua reserva no Restaurante Macapaba para ${dataFmt} às ${r.horario} (${r.pessoas} pessoa${r.pessoas > 1 ? "s" : ""}) está *confirmada*. Te esperamos! 🍽️`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Filtros
  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
    return reservations.filter((r) => {
      if ((r.status || "pendente") !== activeTab) return false;
      if (dateFilter === "today") {
        const d = new Date(r.data + "T00:00:00");
        return d.getTime() === today.getTime();
      }
      if (dateFilter === "week") {
        const d = new Date(r.data + "T00:00:00");
        return d >= today && d <= weekEnd;
      }
      return true;
    });
  }, [reservations, activeTab, dateFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    reservations.forEach((r) => { const s = r.status || "pendente"; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [reservations]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">Reservas</h2>
        <p className="text-muted-foreground text-sm mt-1">{reservations.length} reservas no total · gerencie status, vincule unidade e notifique clientes.</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((s) => {
          const cfg = STATUS_CFG[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                activeTab === s ? cfg.color + " border" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {cfg.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background text-xs">{counts[s] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-muted-foreground font-medium">Período:</span>
        {([
          { k: "all", label: "Todas" },
          { k: "today", label: "Hoje" },
          { k: "week", label: "Próx. 7 dias" },
        ] as const).map((f) => (
          <button
            key={f.k}
            onClick={() => setDateFilter(f.k)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              dateFilter === f.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const unitName = units.find((u) => u.id === r.unit_id)?.nome;
          return (
            <div key={r.id} className="glass-effect rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.nome}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.horario}</span>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{r.pessoas}p</Badge>
                      {unitName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {unitName}</span>}
                    </div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => { setSelected(r); setInternalNotes(r.observacoes_internas || ""); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                {STATUSES.filter((s) => s !== activeTab).map((s) => {
                  const cfg = STATUS_CFG[s];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus(r.id, s, r.nome)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors hover:opacity-80 ${cfg.color}`}
                    >
                      <Icon className="h-3 w-3" /> {cfg.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => openWhatsApp(r)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:opacity-80 transition-opacity ml-auto"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma reserva em "{STATUS_CFG[activeTab].label}".</p>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass-effect max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Detalhes da Reserva</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Nome:</span> {selected.nome}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {selected.telefone}</div>
              <div><span className="text-muted-foreground">Data:</span> {new Date(selected.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
              <div><span className="text-muted-foreground">Horário:</span> {selected.horario}</div>
              <div><span className="text-muted-foreground">Pessoas:</span> {selected.pessoas}</div>
              <div><span className="text-muted-foreground">Observações do cliente:</span> {selected.observacoes || "—"}</div>
              <div><span className="text-muted-foreground">Enviado em:</span> {new Date(selected.created_at).toLocaleString("pt-BR")}</div>

              <div className="pt-3 border-t border-border">
                <label className="text-xs text-muted-foreground font-medium block mb-1">Vincular à unidade</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selected.unit_id || ""}
                  onChange={(e) => updateUnit(selected.id, e.target.value || null, selected.nome)}
                >
                  <option value="">— sem unidade —</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>

              <div className="pt-3 border-t border-border">
                <label className="text-xs text-muted-foreground font-medium block mb-1">Observações internas (não vai para o cliente)</label>
                <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} placeholder="Anotações da equipe..." />
                <Button size="sm" className="mt-2 w-full" onClick={saveNotes}>Salvar observações</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
