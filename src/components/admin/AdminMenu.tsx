import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const AdminMenu = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [newPrato, setNewPrato] = useState("");

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

          <div className="space-y-2">
            {dayItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-md p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Switch checked={item.ativo} onCheckedChange={() => toggleActive(item.id, item.ativo)} />
                  <span className={!item.ativo ? "text-muted-foreground line-through" : ""}>{item.prato}</span>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
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
