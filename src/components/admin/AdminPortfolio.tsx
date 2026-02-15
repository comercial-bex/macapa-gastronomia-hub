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
import { Plus, Pencil, Trash2, Star, Image as ImageIcon, Video } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

interface Item {
  id: string; titulo: string; descricao: string | null; categoria: string;
  tipo: string; url: string | null; destaque: boolean; ordem: number; ativo: boolean;
}

const AdminPortfolio = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", categoria: "geral", tipo: "imagem", destaque: false, ativo: true, ordem: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const fetchItems = async () => {
    const { data } = await supabase.from("portfolio_items").select("*").order("ordem");
    if (data) setItems(data);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setEditing(null); setForm({ titulo: "", descricao: "", categoria: "geral", tipo: "imagem", destaque: false, ativo: true, ordem: items.length }); setFile(null); setOpen(true); };
  const openEdit = (item: Item) => { setEditing(item); setForm({ titulo: item.titulo, descricao: item.descricao || "", categoria: item.categoria, tipo: item.tipo, destaque: item.destaque, ativo: item.ativo, ordem: item.ordem }); setFile(null); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      let url = editing?.url || null;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(path);
        url = urlData.publicUrl;
      }
      const payload = { titulo: form.titulo, descricao: form.descricao || null, categoria: form.categoria, tipo: form.tipo, destaque: form.destaque, ativo: form.ativo, ordem: form.ordem, url };
      if (editing) {
        const { error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_items").insert(payload);
        if (error) throw error;
      }
      await logAction("portfolio", editing ? "editou" : "criou", `${editing ? "Editou" : "Criou"} item '${form.titulo}'`);
      toast.success(editing ? "Atualizado!" : "Criado!"); setOpen(false); fetchItems();
    } catch { toast.error("Erro ao salvar."); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir item?")) return;
    const item = items.find(i => i.id === id);
    await supabase.from("portfolio_items").delete().eq("id", id);
    await logAction("portfolio", "excluiu", `Excluiu item '${item?.titulo}'`);
    toast.success("Excluído!"); fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Portfólio</h2>
          <p className="text-muted-foreground text-sm mt-1">{items.length} itens cadastrados</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="glass-effect rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-muted">
              {item.url ? (
                item.tipo === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={item.url} alt={item.titulo} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              {/* Overlays */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                {item.destaque && (
                  <span className="px-2 py-0.5 rounded-md bg-yellow-500/90 text-white text-xs flex items-center gap-1"><Star className="h-3 w-3" /> Destaque</span>
                )}
                <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">{item.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-xs flex items-center gap-1">
                  {item.tipo === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {item.tipo}
                </span>
              </div>
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{item.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.categoria}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar" : "Novo"} Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editing?.url && (
              <div className="rounded-lg overflow-hidden border border-border aspect-video">
                {editing.tipo === "video" ? (
                  <video src={editing.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={editing.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            )}
            <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
            <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoria</Label><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></div>
              <div><Label>Tipo</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="imagem">Imagem</option><option value="video">Vídeo</option>
                </select>
              </div>
            </div>
            <div><Label>Mídia</Label><Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.destaque} onCheckedChange={(v) => setForm({ ...form, destaque: v })} /> Destaque</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /> Ativo</label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortfolio;
