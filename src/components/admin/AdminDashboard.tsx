import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CalendarDays, Users, Image, Wine, Briefcase, MapPin, UtensilsCrossed, ClipboardList, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatCard {
  label: string;
  value: number;
  subtitle?: string;
  icon: typeof CalendarDays;
  color: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  novo: { label: "Novos", color: "bg-blue-500/10 text-blue-500" },
  verificado: { label: "Verificados", color: "bg-yellow-500/10 text-yellow-500" },
  apto: { label: "Aptos", color: "bg-green-500/10 text-green-500" },
  nao_apto: { label: "Não Aptos", color: "bg-orange-500/10 text-orange-500" },
  contratado: { label: "Contratados", color: "bg-emerald-600/10 text-emerald-600" },
  descartado: { label: "Descartados", color: "bg-red-500/10 text-red-500" },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [appByStatus, setAppByStatus] = useState<Record<string, number>>({});
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [res, apps, portfolio, menu, bevCats, bevs, jobs, units, logs] = await Promise.all([
        supabase.from("reservations").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("status"),
        supabase.from("portfolio_items").select("ativo, destaque"),
        supabase.from("weekly_menu_items").select("id", { count: "exact", head: true }),
        supabase.from("beverage_categories").select("id", { count: "exact", head: true }),
        supabase.from("beverages").select("id", { count: "exact", head: true }),
        supabase.from("job_positions").select("ativa"),
        supabase.from("units").select("ativo"),
        (supabase.from("audit_logs") as any).select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const statusCounts: Record<string, number> = {};
      (apps.data || []).forEach((a: any) => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });
      setAppByStatus(statusCounts);

      const portfolioData = portfolio.data || [];
      const jobsData = jobs.data || [];
      const unitsData = units.data || [];

      setStats([
        { label: "Reservas", value: res.count || 0, icon: CalendarDays, color: "text-blue-500", subtitle: "Total registrado" },
        { label: "Candidaturas", value: (apps.data || []).length, icon: Users, color: "text-purple-500", subtitle: `${statusCounts["novo"] || 0} novos` },
        { label: "Portfólio", value: portfolioData.length, icon: Image, color: "text-pink-500", subtitle: `${portfolioData.filter(p => p.ativo).length} ativos · ${portfolioData.filter(p => p.destaque).length} destaques` },
        { label: "Cardápio", value: menu.count || 0, icon: UtensilsCrossed, color: "text-orange-500", subtitle: "Pratos cadastrados" },
        { label: "Bebidas", value: bevs.count || 0, icon: Wine, color: "text-amber-500", subtitle: `${bevCats.count || 0} categorias` },
        { label: "Vagas", value: jobsData.length, icon: Briefcase, color: "text-green-500", subtitle: `${jobsData.filter(j => j.ativa).length} ativas` },
        { label: "Unidades", value: unitsData.length, icon: MapPin, color: "text-teal-500", subtitle: `${unitsData.filter(u => u.ativo).length} ativas` },
      ]);

      setRecentLogs(logs.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-muted-foreground py-12 text-center">Carregando dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            {stat.subtitle && <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>}
          </motion.div>
        ))}
      </div>

      {/* Candidaturas by status */}
      {Object.keys(appByStatus).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5 mb-10"
        >
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Candidaturas por Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusLabels).map(([key, { label, color }]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge className={`${color} border-0 text-sm px-3 py-1`}>
                  {label}: {appByStatus[key] || 0}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> Últimas Alterações
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.user_nome}</span>{" "}
                    <span className="text-muted-foreground">{log.acao}</span>{" "}
                    <span className="text-muted-foreground">em</span>{" "}
                    <Badge variant="outline" className="text-xs">{log.modulo}</Badge>
                  </p>
                  {log.descricao && <p className="text-xs text-muted-foreground mt-0.5">{log.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
