import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, ChevronRight, UserCheck, UserX, CheckCircle2, XCircle, FileSearch, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

const STATUSES = [
  { key: "novo", label: "Novos", icon: UserPlus, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { key: "verificado", label: "Verificados", icon: FileSearch, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { key: "apto", label: "Aptos", icon: UserCheck, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { key: "nao_apto", label: "Não Aptos", icon: UserX, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { key: "contratado", label: "Contratados", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { key: "descartado", label: "Descartados", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const AdminApplications = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("novo");
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [a, j] = await Promise.all([
      supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("job_positions").select("id, titulo"),
    ]);
    if (a.data) setApps(a.data);
    if (j.data) setJobs(j.data);
  };

  useEffect(() => { fetchData(); }, []);

  const getJobTitle = (id: string | null) => jobs.find((j) => j.id === id)?.titulo || "—";

  const moveStatus = async (app: any, newStatus: string) => {
    await supabase.from("job_applications").update({ status: newStatus } as any).eq("id", app.id);
    logAction("candidaturas", "editou", `Moveu ${app.nome} para "${STATUSES.find(s => s.key === newStatus)?.label}"`);
    toast.success("Status atualizado!");
    fetchData();
  };

  const getNextStatuses = (current: string) => STATUSES.filter(s => s.key !== current);
  const currentStatus = STATUSES.find(s => s.key === activeTab)!;
  const filteredApps = apps.filter((a: any) => (a.status || "novo") === activeTab);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-2">Candidaturas</h2>
      <p className="text-muted-foreground text-sm mb-6">Gerencie o pipeline de seleção dos candidatos.</p>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => {
          const count = apps.filter((a: any) => (a.status || "novo") === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                activeTab === s.key ? s.color + " border" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filteredApps.map((app) => (
          <div key={app.id} className="glass-effect rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{app.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getJobTitle(app.vaga_id)} · {new Date(app.created_at).toLocaleDateString("pt-BR")}
                </p>
                {app.telefone && <p className="text-xs text-muted-foreground">{app.telefone}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => setSelected(app)}><Eye className="h-4 w-4" /></Button>
                {app.curriculo_url && (
                  <a href={app.curriculo_url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
            </div>
            {/* Quick actions */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
              {getNextStatuses(activeTab).map((s) => (
                <button
                  key={s.key}
                  onClick={() => moveStatus(app, s.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors hover:opacity-80 ${s.color}`}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                  <ChevronRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <currentStatus.icon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma candidatura em "{currentStatus.label}".</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass-effect max-w-md">
          <DialogHeader><DialogTitle className="font-display">Candidatura</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Nome:</span> {selected.nome}</div>
              <div><span className="text-muted-foreground">Vaga:</span> {getJobTitle(selected.vaga_id)}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {selected.telefone}</div>
              <div><span className="text-muted-foreground">E-mail:</span> {selected.email}</div>
              <div><span className="text-muted-foreground">Experiência:</span> {selected.experiencia || "—"}</div>
              <div><span className="text-muted-foreground">Disponibilidade:</span> {selected.disponibilidade || "—"}</div>
              <div><span className="text-muted-foreground">Observações:</span> {selected.observacoes || "—"}</div>
              <div><span className="text-muted-foreground">Data:</span> {new Date(selected.created_at).toLocaleString("pt-BR")}</div>
              {selected.curriculo_url && (
                <a href={selected.curriculo_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 mt-2"><Download className="h-4 w-4" /> Baixar Currículo</Button>
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;
