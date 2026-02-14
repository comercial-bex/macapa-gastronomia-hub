import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", ativa: true, ordem: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("job_positions").select("*").order("ordem");
    if (data) setJobs(data);
  };

  useEffect(() => { fetchData(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, descricao: form.descricao || null };
      if (editing) {
        await supabase.from("job_positions").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("job_positions").insert(payload);
      }
      toast.success("Salvo!"); setOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("job_positions").delete().eq("id", id);
    toast.success("Excluído!"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Vagas</h2>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={() => { setEditing(null); setForm({ titulo: "", descricao: "", ativa: true, ordem: jobs.length }); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{job.titulo} {!job.ativa && <span className="text-xs text-muted-foreground">(inativa)</span>}</p>
              {job.descricao && <p className="text-xs text-muted-foreground mt-1">{job.descricao}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(job); setForm({ titulo: job.titulo, descricao: job.descricao || "", ativa: job.ativa, ordem: job.ordem }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(job.id)}><Trash2 className="h-4 w-4" /></Button>
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
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
