import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const AdminReservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
      if (data) setReservations(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Reservas</h2>

      <div className="space-y-3">
        {reservations.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{r.nome}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.data).toLocaleDateString("pt-BR")} às {r.horario} · {r.pessoas} pessoa{r.pessoas > 1 ? "s" : ""}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button>
          </div>
        ))}
        {reservations.length === 0 && <p className="text-muted-foreground py-12 text-center">Nenhuma reserva.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Reserva</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Nome:</span> {selected.nome}</div>
              <div><span className="text-muted-foreground">Telefone:</span> {selected.telefone}</div>
              <div><span className="text-muted-foreground">Data:</span> {new Date(selected.data).toLocaleDateString("pt-BR")}</div>
              <div><span className="text-muted-foreground">Horário:</span> {selected.horario}</div>
              <div><span className="text-muted-foreground">Pessoas:</span> {selected.pessoas}</div>
              <div><span className="text-muted-foreground">Observações:</span> {selected.observacoes || "—"}</div>
              <div><span className="text-muted-foreground">Enviado em:</span> {new Date(selected.created_at).toLocaleString("pt-BR")}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
