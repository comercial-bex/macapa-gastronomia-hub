import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, ImageOff, Clock, Calendar, MapPin, Users } from "lucide-react";

interface HealthCheck {
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
  icon: typeof Activity;
}

const SiteHealth = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [score, setScore] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const [menu, portfolio, units, reservations, beverages, applications] = await Promise.all([
        supabase.from("weekly_menu_items").select("id, imagem_url, unit_id, ativo"),
        supabase.from("portfolio_items").select("id, url, ativo"),
        supabase.from("units").select("id, ativo, horarios, telefone, imagem_url"),
        supabase.from("reservations").select("id, status, created_at").eq("status", "pendente"),
        supabase.from("beverages").select("id, preco, ativo"),
        supabase.from("job_applications").select("id, unit_id"),
      ]);

      const menuItems = menu.data || [];
      const menuSemFoto = menuItems.filter((i: any) => i.ativo && !i.imagem_url).length;
      const menuSemUnit = menuItems.filter((i: any) => i.ativo && !i.unit_id).length;

      const portfolioItems = portfolio.data || [];
      const portfolioInativo = portfolioItems.filter((p: any) => !p.url).length;

      const unitsData = units.data || [];
      const unitsSemHorario = unitsData.filter((u: any) => u.ativo && !u.horarios).length;
      const unitsSemFoto = unitsData.filter((u: any) => u.ativo && !u.imagem_url).length;

      const reservasPendentes = (reservations.data || []).length;
      const bebidasSemPreco = (beverages.data || []).filter((b: any) => b.ativo && !b.preco).length;
      const candidaturasSemUnidade = (applications.data || []).filter((a: any) => !a.unit_id).length;

      const result: HealthCheck[] = [
        {
          label: "Pratos sem foto",
          status: menuSemFoto === 0 ? "ok" : menuSemFoto > 10 ? "error" : "warn",
          detail: menuSemFoto === 0 ? "Todos os pratos têm mídia" : `${menuSemFoto} prato(s) sem foto`,
          icon: ImageOff,
        },
        {
          label: "Pratos sem unidade",
          status: menuSemUnit === 0 ? "ok" : "warn",
          detail: menuSemUnit === 0 ? "Todos vinculados" : `${menuSemUnit} disponíveis em todas as unidades`,
          icon: MapPin,
        },
        {
          label: "Unidades sem horário",
          status: unitsSemHorario === 0 ? "ok" : "error",
          detail: unitsSemHorario === 0 ? "Horários completos" : `${unitsSemHorario} unidade(s) sem horário`,
          icon: Clock,
        },
        {
          label: "Unidades sem foto",
          status: unitsSemFoto === 0 ? "ok" : "warn",
          detail: unitsSemFoto === 0 ? "Todas com imagem" : `${unitsSemFoto} unidade(s) sem foto`,
          icon: ImageOff,
        },
        {
          label: "Reservas pendentes",
          status: reservasPendentes === 0 ? "ok" : reservasPendentes > 5 ? "error" : "warn",
          detail: reservasPendentes === 0 ? "Tudo em dia" : `${reservasPendentes} aguardando confirmação`,
          icon: Calendar,
        },
        {
          label: "Bebidas sem preço",
          status: bebidasSemPreco === 0 ? "ok" : "warn",
          detail: bebidasSemPreco === 0 ? "Preços completos" : `${bebidasSemPreco} sem preço`,
          icon: AlertTriangle,
        },
        {
          label: "Candidaturas sem unidade",
          status: candidaturasSemUnidade === 0 ? "ok" : candidaturasSemUnidade > 5 ? "error" : "warn",
          detail: candidaturasSemUnidade === 0 ? "Todas relacionadas" : `${candidaturasSemUnidade} sem unidade preferencial`,
          icon: Users,
        },
      ];

      const okCount = result.filter((r) => r.status === "ok").length;
      const warnCount = result.filter((r) => r.status === "warn").length;
      setScore(Math.round(((okCount + warnCount * 0.5) / result.length) * 100));
      setChecks(result);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) return null;

  const scoreColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-effect rounded-xl p-5 mb-10"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Saúde do Conteúdo
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}%</span>
          <span className="text-xs text-muted-foreground">qualidade</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {checks.map((c) => {
          const colors = {
            ok: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            warn: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
            error: "bg-red-500/10 text-red-500 border-red-500/20",
          };
          const Icon = c.status === "ok" ? CheckCircle2 : c.icon;
          return (
            <div key={c.label} className={`rounded-lg p-3 border ${colors[c.status]}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{c.label}</span>
              </div>
              <p className="text-xs opacity-80 ml-6">{c.detail}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SiteHealth;