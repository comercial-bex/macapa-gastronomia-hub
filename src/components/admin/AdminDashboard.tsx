import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Users, Image, Wine, Briefcase, MapPin, UtensilsCrossed, ClipboardList, TrendingUp, Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subMonths, subWeeks, startOfMonth, startOfWeek, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import SiteHealth from "./SiteHealth";
import MenuInsights from "./MenuInsights";

interface StatCard {
  label: string;
  value: number;
  subtitle?: string;
  icon: typeof CalendarDays;
  color: string;
}

type Period = "week" | "month" | "quarter";

const periodLabels: Record<Period, string> = {
  week: "Semana",
  month: "Mês",
  quarter: "Trimestre",
};

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
  const [reservationsChart, setReservationsChart] = useState<{ name: string; total: number }[]>([]);
  const [applicationsChart, setApplicationsChart] = useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [notifications, setNotifications] = useState<{ id: string; type: string; name: string; time: Date }[]>([]);

  const buildChartData = useCallback((resData: any[], appsData: any[], p: Period) => {
    const now = new Date();

    if (p === "week") {
      const start = subDays(now, 6);
      const days = eachDayOfInterval({ start, end: now });
      const resChart = days.map(d => {
        const key = format(d, "yyyy-MM-dd");
        const count = resData.filter(r => r.created_at?.startsWith(key)).length;
        return { name: format(d, "EEE", { locale: ptBR }), total: count };
      });
      const appsChart = days.map(d => {
        const key = format(d, "yyyy-MM-dd");
        const count = appsData.filter(a => a.created_at?.startsWith(key)).length;
        return { name: format(d, "EEE", { locale: ptBR }), total: count };
      });
      setReservationsChart(resChart);
      setApplicationsChart(appsChart);
    } else if (p === "month") {
      const start = subMonths(now, 5);
      const months = eachMonthOfInterval({ start: startOfMonth(start), end: now });
      const resChart = months.map(m => {
        const key = format(m, "yyyy-MM");
        const count = resData.filter(r => r.created_at?.startsWith(key)).length;
        return { name: format(m, "MMM", { locale: ptBR }), total: count };
      });
      const appsChart = months.map(m => {
        const key = format(m, "yyyy-MM");
        const count = appsData.filter(a => a.created_at?.startsWith(key)).length;
        return { name: format(m, "MMM", { locale: ptBR }), total: count };
      });
      setReservationsChart(resChart);
      setApplicationsChart(appsChart);
    } else {
      // quarter = last 12 weeks
      const start = subWeeks(now, 11);
      const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 });
      const resChart = weeks.map(w => {
        const weekStart = format(w, "yyyy-MM-dd");
        const weekEnd = format(subDays(new Date(w.getTime() + 7 * 86400000), 1), "yyyy-MM-dd");
        const count = resData.filter(r => r.created_at >= weekStart && r.created_at <= weekEnd + "T23:59:59").length;
        return { name: format(w, "dd/MM", { locale: ptBR }), total: count };
      });
      const appsChart = weeks.map(w => {
        const weekStart = format(w, "yyyy-MM-dd");
        const weekEnd = format(subDays(new Date(w.getTime() + 7 * 86400000), 1), "yyyy-MM-dd");
        const count = appsData.filter(a => a.created_at >= weekStart && a.created_at <= weekEnd + "T23:59:59").length;
        return { name: format(w, "dd/MM", { locale: ptBR }), total: count };
      });
      setReservationsChart(resChart);
      setApplicationsChart(appsChart);
    }
  }, []);

  const [rawResData, setRawResData] = useState<any[]>([]);
  const [rawAppsData, setRawAppsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const twelveWeeksAgo = subWeeks(new Date(), 12);

      const [res, apps, portfolio, menu, bevCats, bevs, jobs, units, logs, resAll, appsAll] = await Promise.all([
        supabase.from("reservations").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("status"),
        supabase.from("portfolio_items").select("ativo, destaque"),
        supabase.from("weekly_menu_items").select("id", { count: "exact", head: true }),
        supabase.from("beverage_categories").select("id", { count: "exact", head: true }),
        supabase.from("beverages").select("id", { count: "exact", head: true }),
        supabase.from("job_positions").select("ativa"),
        supabase.from("units").select("ativo"),
        (supabase.from("audit_logs") as any).select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("reservations").select("created_at").gte("created_at", twelveWeeksAgo.toISOString()),
        supabase.from("job_applications").select("created_at").gte("created_at", twelveWeeksAgo.toISOString()),
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

      setRawResData(resAll.data || []);
      setRawAppsData(appsAll.data || []);
      buildChartData(resAll.data || [], appsAll.data || [], period);

      setRecentLogs(logs.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Rebuild charts when period changes
  useEffect(() => {
    if (!loading) {
      buildChartData(rawResData, rawAppsData, period);
    }
  }, [period, loading, rawResData, rawAppsData, buildChartData]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          const r = payload.new as any;
          const notif = { id: r.id, type: "reserva", name: r.nome, time: new Date() };
          setNotifications(prev => [notif, ...prev].slice(0, 10));
          toast.info(`Nova reserva de ${r.nome}`, {
            description: `${r.pessoas} pessoa(s) · ${r.data} às ${r.horario}`,
            icon: <CalendarDays className="h-4 w-4" />,
          });
          // Refresh stats
          setStats(prev => prev.map(s => s.label === "Reservas" ? { ...s, value: s.value + 1 } : s));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_applications" },
        (payload) => {
          const a = payload.new as any;
          const notif = { id: a.id, type: "candidatura", name: a.nome, time: new Date() };
          setNotifications(prev => [notif, ...prev].slice(0, 10));
          toast.info(`Nova candidatura de ${a.nome}`, {
            description: a.email,
            icon: <Users className="h-4 w-4" />,
          });
          // Refresh stats
          setStats(prev => prev.map(s => s.label === "Candidaturas" ? { ...s, value: s.value + 1 } : s));
          setAppByStatus(prev => ({ ...prev, novo: (prev["novo"] || 0) + 1 }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="text-muted-foreground py-12 text-center">Carregando dashboard...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" /> Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
        </div>

        {/* Realtime notification indicator */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
          >
            <Bell className="h-4 w-4 animate-pulse" />
            <span>{notifications.length} nova(s)</span>
          </motion.div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="glass-effect rounded-xl p-4 hover:shadow-md transition-shadow"
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

      {/* Site Health */}
      <SiteHealth />

      {/* Menu insights */}
      <MenuInsights />

      {/* Period filter + Charts */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground font-medium">Período:</span>
        {(["week", "month", "quarter"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-5"
        >
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" /> Reservas
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reservationsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-effect rounded-xl p-5"
        >
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Candidaturas
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applicationsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Bar dataKey="total" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Realtime notifications feed */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-5 mb-10"
          >
            <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notificações em Tempo Real
            </h2>
            <div className="space-y-2">
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.type === "reserva" ? "bg-blue-500" : "bg-purple-500"}`} />
                  <span className="font-medium">{n.name}</span>
                  <Badge variant="outline" className="text-xs">{n.type === "reserva" ? "Reserva" : "Candidatura"}</Badge>
                  <span className="text-muted-foreground text-xs ml-auto">{format(n.time, "HH:mm")}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidaturas by status */}
      {Object.keys(appByStatus).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-xl p-5 mb-10"
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
        className="glass-effect rounded-xl p-5"
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
