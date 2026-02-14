import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";

const AdminApplications = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [a, j] = await Promise.all([
        supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("job_positions").select("id, titulo"),
      ]);
      if (a.data) setApps(a.data);
      if (j.data) setJobs(j.data);
    };
    fetchData();
  }, []);

  const getJobTitle = (id: string | null) => jobs.find((j) => j.id === id)?.titulo || "—";

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Candidaturas</h2>

      <div className="space-y-3">
        {apps.map((app) => (
          <div key={app.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{app.nome}</p>
              <p className="text-xs text-muted-foreground">{getJobTitle(app.vaga_id)} · {new Date(app.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => setSelected(app)}><Eye className="h-4 w-4" /></Button>
              {app.curriculo_url && (
                <a href={app.curriculo_url} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                </a>
              )}
            </div>
          </div>
        ))}
        {apps.length === 0 && <p className="text-muted-foreground py-12 text-center">Nenhuma candidatura.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-md">
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
