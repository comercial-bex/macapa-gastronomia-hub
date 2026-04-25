import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Users } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminUnits = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nome: "", endereco: "", telefone: "", horarios: "", maps_url: "", principal: false, ativo: true, imagem_url: "", capacidade_por_horario: "" });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const { data } = await supabase.from("units").select("*");
    if (data) setUnits(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      let imagem_url = form.imagem_url;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("units").upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("units").getPublicUrl(path);
        imagem_url = urlData.publicUrl;
      }

      const payload = {
        nome: form.nome,
        endereco: form.endereco,
        telefone: form.telefone || null,
        horarios: form.horarios || null,
        maps_url: form.maps_url || null,
        principal: form.principal,
        ativo: form.ativo,
        imagem_url: imagem_url || null,
        capacidade_por_horario: form.capacidade_por_horario ? parseInt(form.capacidade_por_horario) : null,
      };

      if (editing) {
        await supabase.from("units").update(payload as any).eq("id", editing.id);
      } else {
        await supabase.from("units").insert(payload as any);
      }
      await logAction("unidades", editing ? "editou" : "criou", `${editing ? "Editou" : "Criou"} unidade '${form.nome}'`);
      toast.success("Salvo!"); setOpen(false); setImageFile(null); setImagePreview(""); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const unit = units.find(u => u.id === id);
    await supabase.from("units").delete().eq("id", id);
    await logAction("unidades", "excluiu", `Excluiu unidade '${unit?.nome}'`);
    toast.success("Excluído!"); fetchData();
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({ nome: u.nome, endereco: u.endereco, telefone: u.telefone || "", horarios: u.horarios || "", maps_url: u.maps_url || "", principal: u.principal, ativo: u.ativo, imagem_url: u.imagem_url || "", capacidade_por_horario: u.capacidade_por_horario?.toString() || "" });
    setImagePreview(u.imagem_url || "");
    setImageFile(null);
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ nome: "", endereco: "", telefone: "", horarios: "", maps_url: "", principal: false, ativo: true, imagem_url: "", capacidade_por_horario: "40" });
    setImagePreview("");
    setImageFile(null);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Unidades</h2>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <div className="space-y-3">
        {units.map((u) => (
          <div key={u.id} className="glass-effect rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {u.imagem_url && (
                <img src={u.imagem_url} alt={u.nome} className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div>
                <p className="font-medium">{u.nome} {u.principal && <span className="text-primary text-xs">⭐ Principal</span>}</p>
                <p className="text-xs text-muted-foreground">{u.endereco}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(u.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar" : "Nova"} Unidade</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div><Label>Horários</Label><Input value={form.horarios} onChange={(e) => setForm({ ...form, horarios: e.target.value })} /></div>
            </div>
            <div><Label>Link Google Maps</Label><Input value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} /></div>

            <div>
              <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Capacidade por horário</Label>
              <Input
                type="number"
                min="1"
                max="500"
                placeholder="Ex: 40 (deixe vazio para ilimitado)"
                value={form.capacidade_por_horario}
                onChange={(e) => setForm({ ...form, capacidade_por_horario: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Total de pessoas que podem reservar o mesmo horário. O sistema bloqueará novas reservas que ultrapassem este limite.</p>
            </div>

            {/* Image upload */}
            <div>
              <Label>Imagem da Unidade</Label>
              {imagePreview ? (
                <div className="relative mt-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button type="button" className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors" onClick={() => { setImageFile(null); setImagePreview(""); setForm({ ...form, imagem_url: "" }); }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-lg p-4 hover:border-primary">
                  <Upload className="h-4 w-4" />
                  Selecionar imagem
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>

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
