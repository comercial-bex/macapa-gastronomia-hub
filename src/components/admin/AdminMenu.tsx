import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image, Video, X, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminMenu = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [newPrato, setNewPrato] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const { logAction } = useAuditLog();

  const fetchData = async () => {
    const [d, i] = await Promise.all([
      supabase.from("weekly_menu_days").select("*").order("ordem"),
      supabase.from("weekly_menu_items").select("*").order("ordem"),
    ]);
    if (d.data) { setDays(d.data); if (!activeDay && d.data.length) setActiveDay(d.data[0].id); }
    if (i.data) setItems(i.data);
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = async () => {
    if (!newPrato.trim() || !activeDay) return;
    const dayItems = items.filter((i) => i.day_id === activeDay);
    await supabase.from("weekly_menu_items").insert({ day_id: activeDay, prato: newPrato.trim(), ordem: dayItems.length, ativo: true });
    const dayName = days.find(d => d.id === activeDay)?.dia_semana;
    await logAction("cardapio", "criou", `Adicionou prato '${newPrato.trim()}' em ${dayName}`);
    setNewPrato("");
    toast.success("Adicionado!");
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

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-2">Cardápio da Semana</h2>
      <p className="text-muted-foreground text-sm mb-6">Gerencie os pratos e mídias de cada dia.</p>

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
          <div className="flex gap-2 mb-6">
            <Input value={newPrato} onChange={(e) => setNewPrato(e.target.value)} placeholder="Nome do prato" onKeyDown={(e) => e.key === "Enter" && addItem()} className="flex-1" />
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
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Switch checked={item.ativo} onCheckedChange={() => toggleActive(item.id, item.ativo)} />
                    <span className={`text-sm font-medium truncate ${!item.ativo ? "text-muted-foreground line-through" : ""}`}>{item.prato}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
