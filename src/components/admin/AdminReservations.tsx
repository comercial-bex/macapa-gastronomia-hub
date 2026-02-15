import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Calendar, Clock, Users } from "lucide-react";

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
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">Reservas</h2>
        <p className="text-muted-foreground text-sm mt-1">{reservations.length} reservas registradas</p>
      </div>

      <div className="space-y-3">
        {reservations.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{r.nome}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.data).toLocaleDateString("pt-BR")}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.horario}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">{r.pessoas} pessoa{r.pessoas > 1 ? "s" : ""}</Badge>
              <Button size="icon" variant="ghost" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button>
            </div>
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
