import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
      if (editingCat) {
        await supabase.from("beverage_categories").update(catForm).eq("id", editingCat.id);
      } else {
        await supabase.from("beverage_categories").insert(catForm);
      }
      toast.success("Salvo!"); setCatOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const saveBev = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...bevForm, preco: bevForm.preco ? parseFloat(bevForm.preco) : null, volume: bevForm.volume || null };
      if (editingBev) {
        await supabase.from("beverages").update(payload).eq("id", editingBev.id);
      } else {
        await supabase.from("beverages").insert(payload);
      }
      toast.success("Salvo!"); setBevOpen(false); fetchData();
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const deleteBev = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("beverages").delete().eq("id", id);
    toast.success("Excluído!"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Bebidas</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingCat(null); setCatForm({ nome: "", ordem: categories.length, ativo: true }); setCatOpen(true); }}>+ Categoria</Button>
          <Button className="bg-primary text-primary-foreground" onClick={() => { setEditingBev(null); setBevForm({ category_id: categories[0]?.id || "", nome: "", volume: "", preco: "", ativo: true, ordem: 0 }); setBevOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Bebida
          </Button>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-display text-lg font-bold text-primary">{cat.nome}</h3>
            <Button size="icon" variant="ghost" onClick={() => { setEditingCat(cat); setCatForm({ nome: cat.nome, ordem: cat.ordem, ativo: cat.ativo }); setCatOpen(true); }}><Pencil className="h-3 w-3" /></Button>
          </div>
          <div className="space-y-2">
            {beverages.filter((b) => b.category_id === cat.id).map((bev) => (
              <div key={bev.id} className="bg-card border border-border rounded-md p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{bev.nome}</span>
                  {bev.volume && <span className="text-muted-foreground text-xs ml-2">({bev.volume})</span>}
                  {bev.preco && <span className="text-primary text-sm ml-3">R$ {Number(bev.preco).toFixed(2)}</span>}
                  {!bev.ativo && <span className="text-xs text-muted-foreground ml-2">(inativo)</span>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingBev(bev); setBevForm({ category_id: bev.category_id, nome: bev.nome, volume: bev.volume || "", preco: bev.preco?.toString() || "", ativo: bev.ativo, ordem: bev.ordem }); setBevOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteBev(bev.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-display">{editingCat ? "Editar" : "Nova"} Categoria</DialogTitle></DialogHeader>
          <form onSubmit={saveCat} className="space-y-4">
            <div><Label>Nome</Label><Input value={catForm.nome} onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })} required /></div>
            <div><Label>Ordem</Label><Input type="number" value={catForm.ordem} onChange={(e) => setCatForm({ ...catForm, ordem: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={catForm.ativo} onCheckedChange={(v) => setCatForm({ ...catForm, ativo: v })} /> Ativa</label>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={bevOpen} onOpenChange={setBevOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
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
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBeverages;
