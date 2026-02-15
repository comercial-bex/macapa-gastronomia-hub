import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image, Video, X } from "lucide-react";

const AdminMenu = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [newPrato, setNewPrato] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

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
    setNewPrato("");
    toast.success("Adicionado!");
    fetchData();
  };

  const toggleActive = async (id: string, ativo: boolean) => {
    await supabase.from("weekly_menu_items").update({ ativo: !ativo }).eq("id", id);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("weekly_menu_items").delete().eq("id", id);
    toast.success("Removido!");
    fetchData();
  };

  const uploadMedia = async (itemId: string, file: File) => {
    setUploading(itemId);
    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const path = `${itemId}.${ext}`;

    // Remove old file if exists
    await supabase.storage.from("menu-items").remove([path]);

    const { error: uploadError } = await supabase.storage.from("menu-items").upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Erro no upload: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("menu-items").getPublicUrl(path);

    await supabase.from("weekly_menu_items").update({
      imagem_url: urlData.publicUrl,
      tipo_midia: isVideo ? "video" : "imagem",
    }).eq("id", itemId);

    toast.success("Mídia adicionada!");
    setUploading(null);
    fetchData();
  };

  const removeMedia = async (itemId: string, url: string) => {
    // Extract filename from URL
    const parts = url.split("/menu-items/");
    if (parts[1]) {
      await supabase.storage.from("menu-items").remove([parts[1]]);
    }
    await supabase.from("weekly_menu_items").update({ imagem_url: null, tipo_midia: "imagem" }).eq("id", itemId);
    toast.success("Mídia removida!");
    fetchData();
  };

  const dayItems = items.filter((i) => i.day_id === activeDay);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Cardápio da Semana</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {days.map((day) => (
          <Button
            key={day.id}
            variant={activeDay === day.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveDay(day.id)}
            className={activeDay === day.id ? "bg-primary text-primary-foreground" : ""}
          >
            {day.dia_semana.slice(0, 3)}
          </Button>
        ))}
      </div>

      {activeDay && (
        <div>
          <h3 className="font-display text-lg font-bold mb-4">{days.find((d) => d.id === activeDay)?.dia_semana}</h3>

          <div className="flex gap-2 mb-6">
            <Input value={newPrato} onChange={(e) => setNewPrato(e.target.value)} placeholder="Nome do prato" onKeyDown={(e) => e.key === "Enter" && addItem()} />
            <Button onClick={addItem} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></Button>
          </div>

          <div className="space-y-3">
            {dayItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-md p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Switch checked={item.ativo} onCheckedChange={() => toggleActive(item.id, item.ativo)} />
                    <span className={!item.ativo ? "text-muted-foreground line-through" : ""}>{item.prato}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>

                {/* Media section */}
                {item.imagem_url ? (
                  <div className="relative rounded-md overflow-hidden border border-border">
                    {item.tipo_midia === "video" ? (
                      <video src={item.imagem_url} className="w-full h-32 object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={item.imagem_url} alt={item.prato} className="w-full h-32 object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(item.id, item.imagem_url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-destructive-foreground" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/60 text-white text-xs flex items-center gap-1">
                      {item.tipo_midia === "video" ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                      {item.tipo_midia === "video" ? "Vídeo" : "Foto"}
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading === item.id ? "Enviando..." : "Adicionar foto/vídeo"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      disabled={uploading === item.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadMedia(item.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {dayItems.length === 0 && <p className="text-muted-foreground text-sm py-6">Nenhum prato cadastrado.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
