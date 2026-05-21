import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wine, ImagePlus, X, AlertTriangle, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Aceita "5", "5.00", "5,00", "R$ 5,00", " R$1.234,56 ".
const parseBRPrice = (raw: string): number | null => {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.,-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

// Sortable wrapper for one beverage row with a drag handle on the left.
const SortableBevRow = ({ bev, children }: { bev: any; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: bev.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-effect rounded-lg p-3 flex justify-between items-center hover:shadow-sm transition-shadow gap-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 -ml-1"
        title="Arrastar para reordenar"
        aria-label="Arrastar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 flex justify-between items-center gap-2 min-w-0">
        {children}
      </div>
    </div>
  );
};

const AdminBeverages = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [beverages, setBeverages] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [bevOpen, setBevOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingBev, setEditingBev] = useState<any>(null);
  const [catForm, setCatForm] = useState({ nome: "", ordem: 0, ativo: true });
  const [bevForm, setBevForm] = useState<{
    category_id: string; nome: string; volume: string; preco: string; ativo: boolean; ordem: number;
    descricao: string; badge: string; esgotado: boolean; alergenos: string;
  }>({ category_id: "", nome: "", volume: "", preco: "", ativo: true, ordem: 0, descricao: "", badge: "", esgotado: false, alergenos: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { logAction } = useAuditLog();
  const [pendingDelete, setPendingDelete] = useState<{ kind: "bev" | "cat"; id: string; nome: string; childCount?: number } | null>(null);
  const [filter, setFilter] = useState<"todos" | "sem-foto" | "esgotados" | "novos">("todos");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = async () => {
    const [c, b] = await Promise.all([
      supabase.from("beverage_categories").select("*").order("ordem"),
      supabase.from("beverages").select("*").order("ordem"),
    ]);
    if (c.data) setCategories(c.data);
    if (b.data) setBeverages(b.data);
  };

  useEffect(() => { fetchData(); }, []);

  useRealtimeRefresh(["beverages", "beverage_categories"], fetchData);

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
      const preco = bevForm.preco ? parseBRPrice(bevForm.preco) : null;
      if (bevForm.preco && preco === null) { toast.error("Preço inválido. Use 5,00 ou 5.00"); setLoading(false); return; }
      const alergenosArr = bevForm.alergenos
        ? bevForm.alergenos.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const payload: any = {
        category_id: bevForm.category_id,
        nome: bevForm.nome,
        volume: bevForm.volume || null,
        preco,
        ativo: bevForm.ativo,
        ordem: bevForm.ordem,
        descricao: bevForm.descricao || null,
        badge: bevForm.badge || null,
        esgotado: bevForm.esgotado,
        alergenos: alergenosArr,
      };
      const { error } = editingBev
        ? await supabase.from("beverages").update(payload).eq("id", editingBev.id)
        : await supabase.from("beverages").insert(payload);
      if (error) { toast.error("Erro ao salvar: " + error.message); setLoading(false); return; }
      await logAction("bebidas", editingBev ? "editou" : "criou", `${editingBev ? "Editou" : "Criou"} bebida '${bevForm.nome}'`);
      toast.success("Salvo!"); setBevOpen(false); fetchData();
    } catch (e: any) { toast.error("Erro: " + (e?.message || "inesperado")); } finally { setLoading(false); }
  };

  const confirmDeleteBev = (id: string) => {
    const bev = beverages.find(b => b.id === id);
    if (bev) setPendingDelete({ kind: "bev", id, nome: bev.nome });
  };

  const confirmDeleteCat = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const childCount = beverages.filter(b => b.category_id === id).length;
    setPendingDelete({ kind: "cat", id, nome: cat.nome, childCount });
  };

  const runPendingDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "bev") {
      const bev = beverages.find(b => b.id === pendingDelete.id);
      if (bev?.imagem_url) {
        const parts = bev.imagem_url.split("/beverages/");
        if (parts[1]) await supabase.storage.from("beverages").remove([parts[1].split("?")[0]]);
      }
      const { error } = await supabase.from("beverages").delete().eq("id", pendingDelete.id);
      if (error) { toast.error("Falha: " + error.message); return; }
      await logAction("bebidas", "excluiu", `Excluiu bebida '${pendingDelete.nome}'`);
    } else {
      // Desvincula bebidas (FK SET NULL já faria, mas garantimos UX clara).
      const { error } = await supabase.from("beverage_categories").delete().eq("id", pendingDelete.id);
      if (error) { toast.error("Falha: " + error.message); return; }
      await logAction("bebidas", "excluiu", `Excluiu categoria '${pendingDelete.nome}'`);
    }
    toast.success("Excluído!");
    setPendingDelete(null);
    fetchData();
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
  const totalSemFoto = beverages.length - totalComFoto;
  const totalEsgotados = beverages.filter((b) => b.esgotado).length;
  const totalNovos = beverages.filter((b) => b.badge === "novo" || b.badge === "destaque").length;

  const passesFilter = (b: any) => {
    if (filter === "sem-foto") return !b.imagem_url;
    if (filter === "esgotados") return !!b.esgotado;
    if (filter === "novos") return b.badge === "novo" || b.badge === "destaque";
    return true;
  };

  const reorderCategory = async (catId: string, oldIndex: number, newIndex: number) => {
    const catBevs = beverages.filter((b) => b.category_id === catId).sort((a, b) => a.ordem - b.ordem);
    const reordered = arrayMove(catBevs, oldIndex, newIndex);
    const map = new Map(reordered.map((b, i) => [b.id, i]));
    setBeverages((prev) => prev.map((b) => map.has(b.id) ? { ...b, ordem: map.get(b.id)! } : b));
    const results = await Promise.all(reordered.map((b, i) => supabase.from("beverages").update({ ordem: i }).eq("id", b.id)));
    if (results.some((r) => r.error)) { toast.error("Falha ao reordenar."); fetchData(); }
  };

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
          <Button onClick={() => { setEditingBev(null); setBevForm({ category_id: categories[0]?.id || "", nome: "", volume: "", preco: "", ativo: true, ordem: 0, descricao: "", badge: "", esgotado: false, alergenos: "" }); setBevOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Bebida
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { key: "todos", label: `Todas (${beverages.length})` },
          { key: "sem-foto", label: `Sem foto (${totalSemFoto})` },
          { key: "esgotados", label: `Esgotadas (${totalEsgotados})` },
          { key: "novos", label: `Novas / Destaque (${totalNovos})` },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key as any)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              filter === f.key
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-[11px] text-muted-foreground/70 ml-auto">Arraste ⠿ para reordenar dentro de cada categoria.</span>
      </div>

      {categories.map((cat) => {
        const catBevsAll = beverages.filter((b) => b.category_id === cat.id).sort((a, b) => a.ordem - b.ordem);
        const catBevs = catBevsAll.filter(passesFilter);
        if (filter !== "todos" && catBevs.length === 0) return null;
        return (
          <div key={cat.id} className="mb-8">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border">
              <Wine className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold">{cat.nome}</h3>
              <Badge variant={cat.ativo ? "default" : "secondary"} className="text-xs">{cat.ativo ? "Ativa" : "Inativa"}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{catBevs.length}{filter !== "todos" ? `/${catBevsAll.length}` : ""} itens</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCat(cat); setCatForm({ nome: cat.nome, ordem: cat.ordem, ativo: cat.ativo }); setCatOpen(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Excluir categoria" onClick={() => confirmDeleteCat(cat.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e: DragEndEvent) => {
                if (!e.over || e.active.id === e.over.id) return;
                const oldIdx = catBevsAll.findIndex((b) => b.id === e.active.id);
                const newIdx = catBevsAll.findIndex((b) => b.id === e.over!.id);
                if (oldIdx !== -1 && newIdx !== -1) reorderCategory(cat.id, oldIdx, newIdx);
              }}
            >
              <SortableContext items={catBevs.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {catBevs.map((bev) => (
                    <SortableBevRow key={bev.id} bev={bev}>
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
                    {bev.esgotado && (
                      <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" /> Esgotado</Badge>
                    )}
                    {bev.badge && (
                      <Badge className="text-[10px] gap-1 bg-primary/15 text-primary border-primary/30"><Sparkles className="h-3 w-3" /> {bev.badge}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {bev.preco && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-sm font-semibold">
                        R$ {Number(bev.preco).toFixed(2)}
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingBev(bev); setBevForm({ category_id: bev.category_id, nome: bev.nome, volume: bev.volume || "", preco: bev.preco?.toString() || "", ativo: bev.ativo, ordem: bev.ordem, descricao: bev.descricao || "", badge: bev.badge || "", esgotado: !!bev.esgotado, alergenos: (bev.alergenos || []).join(", ") }); setBevOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => confirmDeleteBev(bev.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                    </SortableBevRow>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
        <DialogContent className="glass-effect max-w-md max-h-[85vh] overflow-y-auto">
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
            <div><Label>Descrição curta</Label>
              <Textarea rows={2} maxLength={200} value={bevForm.descricao} onChange={(e) => setBevForm({ ...bevForm, descricao: e.target.value })} placeholder="Ex: Cerveja artesanal local, lúpulo cítrico." />
              <p className="text-[11px] text-muted-foreground mt-1">Aparece no site (máx. 200 caracteres).</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Badge</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={bevForm.badge} onChange={(e) => setBevForm({ ...bevForm, badge: e.target.value })}>
                  <option value="">Nenhuma</option>
                  <option value="novo">Novo</option>
                  <option value="destaque">Destaque</option>
                  <option value="promocao">Promoção</option>
                </select>
              </div>
              <div><Label>Ordem</Label><Input type="number" value={bevForm.ordem} onChange={(e) => setBevForm({ ...bevForm, ordem: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Alérgenos</Label>
              <Input value={bevForm.alergenos} onChange={(e) => setBevForm({ ...bevForm, alergenos: e.target.value })} placeholder="Ex: glúten, lactose" />
              <p className="text-[11px] text-muted-foreground mt-1">Separados por vírgula.</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={bevForm.ativo} onCheckedChange={(v) => setBevForm({ ...bevForm, ativo: v })} /> Ativo</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={bevForm.esgotado} onCheckedChange={(v) => setBevForm({ ...bevForm, esgotado: v })} /> Esgotado hoje</label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Salvando..." : "Salvar"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "cat" ? "Excluir categoria?" : "Excluir bebida?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "cat"
                ? <>A categoria "{pendingDelete?.nome}" será removida.{pendingDelete?.childCount ? ` ${pendingDelete.childCount} bebida(s) ficarão sem categoria.` : ""}</>
                : <>"{pendingDelete?.nome}" será removida permanentemente.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={runPendingDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBeverages;
