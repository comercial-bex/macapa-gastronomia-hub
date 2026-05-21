import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wine, ImagePlus, X } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminBeverages = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [beverages, setBeverages] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [bevOpen, setBevOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingBev, setEditingBev] = useState<any>(null);
  const [catForm, setCatForm] = useState({ nome: "", ordem: 0, ativo: true });
  const [bevForm, setBevForm] = useState({ category_id: "", nome: "", volume: "", preco: "", ativo: true, ordem: 0 });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [c, b] = await Promise.all([
      supabase.from("beverage_categories").select("*").order("ordem"),
      supabase.from("beverages").select("*").order("ordem"),
    ]);
    if (c.data) setCategories(c.data);
    if (b.data) setBeverages(b.data);
  };

  useEffect(() => { fetchData(); }, []);

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingCat) { await supabase.from("beverage_categories").update(catForm).eq("id", editingCat.id); }
      else { await supabase.from("beverage_categories").insert(catForm); }
      await logAction("bebidas", editingCat ? "editou" : "criou", `${editingCat ? "Editou" : "Criou"} categoria '${catForm.nome}'`);
      toast.success("Salvo!"); setCatOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const saveBev = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...bevForm, preco: bevForm.preco ? parseFloat(bevForm.preco) : null, volume: bevForm.volume || null };
      if (editingBev) { await supabase.from("beverages").update(payload).eq("id", editingBev.id); }
      else { await supabase.from("beverages").insert(payload); }
      await logAction("bebidas", editingBev ? "editou" : "criou", `${editingBev ? "Editou" : "Criou"} bebida '${bevForm.nome}'`);
      toast.success("Salvo!"); setBevOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const deleteBev = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const bev = beverages.find(b => b.id === id);
    await supabase.from("beverages").delete().eq("id", id);
    await logAction("bebidas", "excluiu", `Excluiu bebida '${bev?.nome}'`);
    toast.success("Excluído!"); fetchData();
  };

  const uploadImage = async (bevId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Envie apenas arquivos de imagem.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem acima de 10 MB. Reduza o tamanho.");
      return;
    }
    setUploading(bevId);
    try {
      // Remove qualquer arquivo anterior deste id, em qualquer extensão.
      const { data: existing } = await supabase.storage.from("beverages").list("", { search: bevId });
      const toRemove = (existing || []).filter((f) => f.name.startsWith(`${bevId}.`)).map((f) => f.name);
      if (toRemove.length) await supabase.storage.from("beverages").remove(toRemove);

      // Padroniza o caminho. Mantém a extensão real (jpg/png/webp).
      const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const ext = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt) ? rawExt : "jpg";
      const path = `${bevId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("beverages")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) {
        toast.error("Falha no upload: " + upErr.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("beverages").getPublicUrl(path);
      const busted = `${urlData.publicUrl}?v=${Date.now()}`;

      const { error: updErr } = await supabase
        .from("beverages")
        .update({ imagem_url: busted })
        .eq("id", bevId);
      if (updErr) {
        toast.error("Imagem subiu mas não vinculou ao item: " + updErr.message);
        return;
      }

      await logAction("bebidas", "editou", `Atualizou imagem de bebida`);
      toast.success("Imagem enviada!");
      await fetchData();
    } catch (e: any) {
      toast.error("Erro inesperado: " + (e?.message || "tente novamente"));
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (bevId: string, url: string | null) => {
    if (!url) return;
    const parts = url.split("/beverages/");
    if (parts[1]) {
      const path = parts[1].split("?")[0];
      await supabase.storage.from("beverages").remove([path]);
    }
    await supabase.from("beverages").update({ imagem_url: null }).eq("id", bevId);
    toast.success("Imagem removida"); fetchData();
  };

  const totalComFoto = beverages.filter((b) => b.imagem_url).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Bebidas</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {categories.length} categorias · {beverages.length} itens · {totalComFoto}/{beverages.length} com foto
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingCat(null); setCatForm({ nome: "", ordem: categories.length, ativo: true }); setCatOpen(true); }}>+ Categoria</Button>
          <Button onClick={() => { setEditingBev(null); setBevForm({ category_id: categories[0]?.id || "", nome: "", volume: "", preco: "", ativo: true, ordem: 0 }); setBevOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Bebida
          </Button>
        </div>
      </div>

      {categories.map((cat) => {
        const catBevs = beverages.filter((b) => b.category_id === cat.id);
        return (
          <div key={cat.id} className="mb-8">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border">
              <Wine className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold">{cat.nome}</h3>
              <Badge variant={cat.ativo ? "default" : "secondary"} className="text-xs">{cat.ativo ? "Ativa" : "Inativa"}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{catBevs.length} itens</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCat(cat); setCatForm({ nome: cat.nome, ordem: cat.ordem, ativo: cat.ativo }); setCatOpen(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {catBevs.map((bev) => (
                <div key={bev.id} className="glass-effect rounded-lg p-3 flex justify-between items-center hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {bev.imagem_url ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        <img src={bev.imagem_url} alt={bev.nome} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(bev.id, bev.imagem_url)}
                          className="absolute top-0 right-0 bg-destructive/90 text-destructive-foreground rounded-bl-md p-0.5"
                          title="Remover imagem"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="h-12 w-12 rounded-md border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/50 flex-shrink-0" title="Adicionar imagem">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading === bev.id}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(bev.id, f); }}
                        />
                      </label>
                    )}
                    <span className={`font-medium text-sm ${!bev.ativo ? "text-muted-foreground line-through" : ""}`}>{bev.nome}</span>
                    {bev.volume && <span className="text-muted-foreground text-xs">({bev.volume})</span>}
                    {!bev.ativo && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {bev.preco && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-sm font-semibold">
                        R$ {Number(bev.preco).toFixed(2)}
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingBev(bev); setBevForm({ category_id: bev.category_id, nome: bev.nome, volume: bev.volume || "", preco: bev.preco?.toString() || "", ativo: bev.ativo, ordem: bev.ordem }); setBevOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteBev(bev.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
         <DialogContent className="glass-effect max-w-sm">
          <DialogHeader><DialogTitle className="font-display">{editingCat ? "Editar" : "Nova"} Categoria</DialogTitle></DialogHeader>
          <form onSubmit={saveCat} className="space-y-4">
            <div><Label>Nome</Label><Input value={catForm.nome} onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })} required /></div>
            <div><Label>Ordem</Label><Input type="number" value={catForm.ordem} onChange={(e) => setCatForm({ ...catForm, ordem: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={catForm.ativo} onCheckedChange={(v) => setCatForm({ ...catForm, ativo: v })} /> Ativa</label>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={bevOpen} onOpenChange={setBevOpen}>
        <DialogContent className="glass-effect max-w-sm">
          <DialogHeader><DialogTitle className="font-display">{editingBev ? "Editar" : "Nova"} Bebida</DialogTitle></DialogHeader>
          <form onSubmit={saveBev} className="space-y-4">
            <div><Label>Categoria</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={bevForm.category_id} onChange={(e) => setBevForm({ ...bevForm, category_id: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div><Label>Nome</Label><Input value={bevForm.nome} onChange={(e) => setBevForm({ ...bevForm, nome: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Volume</Label><Input value={bevForm.volume} onChange={(e) => setBevForm({ ...bevForm, volume: e.target.value })} placeholder="350ml" /></div>
              <div><Label>Preço</Label><Input value={bevForm.preco} onChange={(e) => setBevForm({ ...bevForm, preco: e.target.value })} placeholder="5.00" /></div>
            </div>
            <div><Label>Ordem</Label><Input type="number" value={bevForm.ordem} onChange={(e) => setBevForm({ ...bevForm, ordem: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={bevForm.ativo} onCheckedChange={(v) => setBevForm({ ...bevForm, ativo: v })} /> Ativo</label>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBeverages;
