import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Clock } from "lucide-react";

const moduloLabels: Record<string, string> = {
  portfolio: "Portfólio",
  cardapio: "Cardápio",
  bebidas: "Bebidas",
  vagas: "Vagas",
  candidaturas: "Candidaturas",
  reservas: "Reservas",
  configuracoes: "Configurações",
  unidades: "Unidades",
  perfil: "Perfil",
};

const acaoColors: Record<string, string> = {
  criou: "bg-green-500/10 text-green-400 border-green-500/20",
  editou: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  excluiu: "bg-red-500/10 text-red-400 border-red-500/20",
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterModulo, setFilterModulo] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase.from("audit_logs") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLogs(data);
    };
    fetch();
  }, []);

  const filtered = filterModulo ? logs.filter((l: any) => l.modulo === filterModulo) : logs;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-2">Histórico de Alterações</h2>
      <p className="text-muted-foreground text-sm mb-6">Acompanhe todas as ações realizadas no painel.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterModulo("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!filterModulo ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          Todos
        </button>
        {Object.entries(moduloLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterModulo(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterModulo === key ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((log: any) => (
          <div key={log.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{log.user_nome || "Admin"}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${acaoColors[log.acao] || "border-border text-muted-foreground"}`}>
                  {log.acao}
                </span>
                <span className="text-xs text-muted-foreground">{moduloLabels[log.modulo] || log.modulo}</span>
              </div>
              {log.descricao && <p className="text-sm text-muted-foreground mt-1 truncate">{log.descricao}</p>}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-12">Nenhum registro encontrado.</p>}
      </div>
    </div>
  );
};

export default AdminAuditLog;
