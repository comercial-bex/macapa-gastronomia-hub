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
  unit_id: string | null; categoria_id: string | null;
}

interface Categoria { id: string; nome: string; ordem: number }

const AdminPortfolio = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<{ id: string; nome: string }[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  /** content_categories pode não existir ainda (migration não aplicada). */
  const [dominioDisponivel, setDominioDisponivel] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", categoria: "geral", categoria_id: "", tipo: "imagem", destaque: false, ativo: true, ordem: 0, unit_id: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const fetchItems = async () => {
    const [p, u, c] = await Promise.all([
      supabase.from("portfolio_items").select("*").order("ordem"),
      supabase.from("units").select("id, nome").eq("ativo", true),
      supabase.from("content_categories")
        .select("id, nome, ordem").eq("escopo", "portfolio").eq("ativo", true).order("ordem"),
    ]);
    if (p.data) setItems(p.data as unknown as Item[]);
    if (u.data) setUnits(u.data);
    setDominioDisponivel(!c.error);
    if (c.data) setCategorias(c.data as Categoria[]);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setEditing(null); setForm({ titulo: "", descricao: "", categoria: "geral", categoria_id: categorias[0]?.id ?? "", tipo: "imagem", destaque: false, ativo: true, ordem: items.length, unit_id: "" }); setFile(null); setNovaCategoria(""); setOpen(true); };
  const openEdit = (item: Item) => {
    setEditing(item);
    // Itens antigos podem ter só o texto: casa pelo nome para não perder o vínculo.
    const match = item.categoria_id ?? categorias.find((c) => c.nome === item.categoria)?.id ?? "";
    setForm({ titulo: item.titulo, descricao: item.descricao || "", categoria: item.categoria, categoria_id: match, tipo: item.tipo, destaque: item.destaque, ativo: item.ativo, ordem: item.ordem, unit_id: item.unit_id || "" });
    setFile(null); setNovaCategoria(""); setOpen(true);
  };

  /** Cria categoria no domínio e já seleciona. Substitui o campo de texto livre,
   *  que gerava filtro-fantasma na página pública a cada typo. */
  const addCategoria = async () => {
    const nome = novaCategoria.trim();
    if (!nome) return;
    const existente = categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase());
    if (existente) {
      setForm((f) => ({ ...f, categoria_id: existente.id }));
      setNovaCategoria("");
      toast.info("Essa categoria já existe — selecionada.");
      return;
    }
    const { data, error } = await supabase.from("content_categories")
      .insert({ escopo: "portfolio", nome, ordem: categorias.length })
      .select("id, nome, ordem").single();
    if (error) { toast.error("Não foi possível criar a categoria."); return; }
    setCategorias((cs) => [...cs, data as Categoria]);
    setForm((f) => ({ ...f, categoria_id: (data as Categoria).id }));
    setNovaCategoria("");
    await logAction("portfolio", "criou", `Criou categoria '${nome}'`, { tabela: "content_categories", registroId: (data as Categoria).id });
    toast.success("Categoria criada.");
  };

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
      // Escrita paralela: categoria_id é a fonte de verdade, o texto segue
      // preenchido enquanto a página pública ainda lê a coluna legada.
      const cat = categorias.find((c) => c.id === form.categoria_id);
      const payload: Record<string, unknown> = {
        titulo: form.titulo, descricao: form.descricao || null,
        categoria: cat?.nome ?? form.categoria,
        tipo: form.tipo, destaque: form.destaque, ativo: form.ativo,
        ordem: form.ordem, url, unit_id: form.unit_id || null,
      };
      // Só envia categoria_id se o domínio carregou — num banco onde a
      // migration ainda não rodou a coluna não existe, e mandá-la faria o
      // PostgREST recusar o save inteiro com 400 em vez de só ignorar.
      if (dominioDisponivel) payload.categoria_id = form.categoria_id || null;
      if (editing) {
        const { error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_items").insert(payload);
        if (error) throw error;
      }
      await logAction("portfolio", editing ? "editou" : "criou", `${editing ? "Editou" : "Criou"} item '${form.titulo}'`, { tabela: "portfolio_items", registroId: editing?.id });
      toast.success(editing ? "Atualizado!" : "Criado!"); setOpen(false); fetchItems();
    } catch { toast.error("Erro ao salvar."); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir item?")) return;
    const item = items.find(i => i.id === id);
    await supabase.from("portfolio_items").delete().eq("id", id);
    await logAction("portfolio", "excluiu", `Excluiu item '${item?.titulo}'`, { tabela: "portfolio_items", registroId: id });
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
              <div>
                <Label>Categoria</Label>
                {dominioDisponivel ? (
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.categoria_id}
                    onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                  >
                    {categorias.length === 0 && <option value="">Nenhuma categoria cadastrada</option>}
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  />
                )}
                <div className={`flex gap-2 mt-2 ${dominioDisponivel ? "" : "hidden"}`}>
                  <Input
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Nova categoria"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategoria(); } }}
                  />
                  <Button type="button" variant="outline" onClick={addCategoria} disabled={!novaCategoria.trim()}>
                    Adicionar
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {dominioDisponivel
                    ? "Lista compartilhada entre os itens — evita filtro duplicado no site."
                    : "Texto livre: a lista compartilhada aparece após a migration de categorias."}
                </p>
              </div>
              <div><Label>Tipo</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="imagem">Imagem</option><option value="video">Vídeo</option>
                </select>
              </div>
            </div>
            <div><Label>Mídia</Label><Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Unidade</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
                  <option value="">Todas</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
            </div>
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
