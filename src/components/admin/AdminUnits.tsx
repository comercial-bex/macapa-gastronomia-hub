import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminUnits = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nome: "", endereco: "", telefone: "", horarios: "", maps_url: "", principal: false, ativo: true });
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const { data } = await supabase.from("units").select("*");
    if (data) setUnits(data);
  };

  useEffect(() => { fetchData(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, telefone: form.telefone || null, horarios: form.horarios || null, maps_url: form.maps_url || null };
      if (editing) {
        await supabase.from("units").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("units").insert(payload);
      }
      await logAction("unidades", editing ? "editou" : "criou", `${editing ? "Editou" : "Criou"} unidade '${form.nome}'`);
      toast.success("Salvo!"); setOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const unit = units.find(u => u.id === id);
    await supabase.from("units").delete().eq("id", id);
    await logAction("unidades", "excluiu", `Excluiu unidade '${unit?.nome}'`);
    toast.success("Excluído!"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Unidades</h2>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={() => { setEditing(null); setForm({ nome: "", endereco: "", telefone: "", horarios: "", maps_url: "", principal: false, ativo: true }); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <div className="space-y-3">
        {units.map((u) => (
          <div key={u.id} className="glass-effect rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{u.nome} {u.principal && <span className="text-primary text-xs">⭐ Principal</span>}</p>
              <p className="text-xs text-muted-foreground">{u.endereco}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(u); setForm({ nome: u.nome, endereco: u.endereco, telefone: u.telefone || "", horarios: u.horarios || "", maps_url: u.maps_url || "", principal: u.principal, ativo: u.ativo }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(u.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar" : "Nova"} Unidade</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div><Label>Horários</Label><Input value={form.horarios} onChange={(e) => setForm({ ...form, horarios: e.target.value })} /></div>
            </div>
            <div><Label>Link Google Maps</Label><Input value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.principal} onCheckedChange={(v) => setForm({ ...form, principal: v })} /> Principal</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /> Ativa</label>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUnits;
