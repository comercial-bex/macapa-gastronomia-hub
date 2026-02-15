import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", ativa: true, ordem: 0 });
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [j, a] = await Promise.all([
      supabase.from("job_positions").select("*").order("ordem"),
      supabase.from("job_applications").select("vaga_id"),
    ]);
    if (j.data) setJobs(j.data);
    if (a.data) {
      const counts: Record<string, number> = {};
      a.data.forEach((app: any) => { if (app.vaga_id) counts[app.vaga_id] = (counts[app.vaga_id] || 0) + 1; });
      setAppCounts(counts);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, descricao: form.descricao || null };
      if (editing) { await supabase.from("job_positions").update(payload).eq("id", editing.id); }
      else { await supabase.from("job_positions").insert(payload); }
      await logAction("vagas", editing ? "editou" : "criou", `${editing ? "Editou" : "Criou"} vaga '${form.titulo}'`);
      toast.success("Salvo!"); setOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const job = jobs.find(j => j.id === id);
    await supabase.from("job_positions").delete().eq("id", id);
    await logAction("vagas", "excluiu", `Excluiu vaga '${job?.titulo}'`);
    toast.success("Excluído!"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Vagas</h2>
          <p className="text-muted-foreground text-sm mt-1">{jobs.filter(j => j.ativa).length} ativas · {jobs.filter(j => !j.ativa).length} inativas</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditing(null); setForm({ titulo: "", descricao: "", ativa: true, ordem: jobs.length }); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{job.titulo}</p>
                <Badge variant={job.ativa ? "default" : "secondary"} className="text-xs">{job.ativa ? "Ativa" : "Inativa"}</Badge>
              </div>
              {job.descricao && <p className="text-xs text-muted-foreground mt-1">{job.descricao}</p>}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {appCounts[job.id] > 0 && (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1">
                  <Users className="h-3 w-3" /> {appCounts[job.id]}
                </Badge>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(job); setForm({ titulo: job.titulo, descricao: job.descricao || "", ativa: job.ativa, ordem: job.ordem }); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(job.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar" : "Nova"} Vaga</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
            <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.ativa} onCheckedChange={(v) => setForm({ ...form, ativa: v })} /> Ativa</label>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
