import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image, Video, X, UtensilsCrossed, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";

const CATEGORIAS = ["entrada", "principal", "acompanhamento", "sobremesa"] as const;

const AdminMenu = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [newPrato, setNewPrato] = useState("");
  const [newCategoria, setNewCategoria] = useState<string>("principal");
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [uploading, setUploading] = useState<string | null>(null);
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [d, i, u] = await Promise.all([
      supabase.from("weekly_menu_days").select("*").order("ordem"),
      supabase.from("weekly_menu_items").select("*").order("ordem"),
      supabase.from("units").select("id, nome").eq("ativo", true),
    ]);
    if (d.data) { setDays(d.data); if (!activeDay && d.data.length) setActiveDay(d.data[0].id); }
    if (i.data) setItems(i.data);
    if (u.data) setUnits(u.data);
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = async () => {
    if (!newPrato.trim() || !activeDay) return;
    const dayItems = items.filter((i) => i.day_id === activeDay);
    await supabase.from("weekly_menu_items").insert({
      day_id: activeDay,
      prato: newPrato.trim(),
      ordem: dayItems.length,
      ativo: true,
      categoria: newCategoria,
      unit_id: newUnitId || null,
    } as any);
    const dayName = days.find(d => d.id === activeDay)?.dia_semana;
    await logAction("cardapio", "criou", `Adicionou prato '${newPrato.trim()}' em ${dayName}`);
    setNewPrato("");
    toast.success("Adicionado!");
    fetchData();
  };

  const updateCategoria = async (id: string, categoria: string) => {
    await supabase.from("weekly_menu_items").update({ categoria } as any).eq("id", id);
    fetchData();
  };

  const updateUnit = async (id: string, unit_id: string | null) => {
    await supabase.from("weekly_menu_items").update({ unit_id } as any).eq("id", id);
    fetchData();
  };

  const toggleActive = async (id: string, ativo: boolean) => {
    await supabase.from("weekly_menu_items").update({ ativo: !ativo }).eq("id", id);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    await supabase.from("weekly_menu_items").delete().eq("id", id);
    await logAction("cardapio", "excluiu", `Removeu prato '${item?.prato}'`);
    toast.success("Removido!");
    fetchData();
  };

  const uploadMedia = async (itemId: string, file: File) => {
    setUploading(itemId);
    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const path = `${itemId}.${ext}`;
    await supabase.storage.from("menu-items").remove([path]);
    const { error: uploadError } = await supabase.storage.from("menu-items").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erro no upload: " + uploadError.message); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from("menu-items").getPublicUrl(path);
    await supabase.from("weekly_menu_items").update({ imagem_url: urlData.publicUrl, tipo_midia: isVideo ? "video" : "imagem" }).eq("id", itemId);
    const item = items.find(i => i.id === itemId);
    await logAction("cardapio", "editou", `Upload de mídia para '${item?.prato}'`);
    toast.success("Mídia adicionada!");
    setUploading(null);
    fetchData();
  };

  const removeMedia = async (itemId: string, url: string) => {
    const parts = url.split("/menu-items/");
    if (parts[1]) await supabase.storage.from("menu-items").remove([parts[1]]);
    await supabase.from("weekly_menu_items").update({ imagem_url: null, tipo_midia: "imagem" }).eq("id", itemId);
    const item = items.find(i => i.id === itemId);
    await logAction("cardapio", "editou", `Removeu mídia de '${item?.prato}'`);
    toast.success("Mídia removida!");
    fetchData();
  };

  const dayItems = items.filter((i) => i.day_id === activeDay);
  const activeDayName = days.find((d) => d.id === activeDay)?.dia_semana;
  const semFoto = items.filter((i) => !i.imagem_url).length;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-2">Cardápio da Semana</h2>
      <p className="text-muted-foreground text-sm mb-3">Gerencie os pratos, fotos, categoria e unidade de cada dia.</p>

      {semFoto > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm flex items-center gap-2">
          <Image className="h-4 w-4" />
          <strong>{semFoto}</strong> de {items.length} pratos ainda estão sem foto. Pratos sem foto não convertem.
        </div>
      )}

      {/* Day tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {days.map((day) => {
          const count = items.filter((i) => i.day_id === day.id).length;
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                activeDay === day.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {day.dia_semana}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {activeDay && (
        <div>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input value={newPrato} onChange={(e) => setNewPrato(e.target.value)} placeholder="Nome do prato" onKeyDown={(e) => e.key === "Enter" && addItem()} className="flex-1" />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={newUnitId} onChange={(e) => setNewUnitId(e.target.value)}>
              <option value="">Todas unidades</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
            <Button onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {dayItems.map((item) => (
              <div key={item.id} className="glass-effect rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Media preview */}
                <div className="relative aspect-[16/10] bg-muted">
                  {item.imagem_url ? (
                    <>
                      {item.tipo_midia === "video" ? (
                        <video src={item.imagem_url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.imagem_url} alt={item.prato} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeMedia(item.id, item.imagem_url)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-destructive-foreground" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1">
                        {item.tipo_midia === "video" ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                        {item.tipo_midia === "video" ? "Vídeo" : "Foto"}
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
                      <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {uploading === item.id ? "Enviando..." : "Adicionar mídia"}
                      </span>
                      <input type="file" accept="image/*,video/*" className="hidden" disabled={uploading === item.id}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(item.id, f); }} />
                    </label>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Switch checked={item.ativo} onCheckedChange={() => toggleActive(item.id, item.ativo)} />
                      <span className={`text-sm font-medium truncate ${!item.ativo ? "text-muted-foreground line-through" : ""}`}>{item.prato}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <select className="text-xs bg-muted rounded px-1.5 py-0.5 border border-border" value={item.categoria || "principal"} onChange={(e) => updateCategoria(item.id, e.target.value)}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <MapPin className="h-3 w-3 text-muted-foreground ml-1" />
                    <select className="text-xs bg-muted rounded px-1.5 py-0.5 border border-border" value={item.unit_id || ""} onChange={(e) => updateUnit(item.id, e.target.value || null)}>
                      <option value="">Todas</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {dayItems.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum prato cadastrado para {activeDayName}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
