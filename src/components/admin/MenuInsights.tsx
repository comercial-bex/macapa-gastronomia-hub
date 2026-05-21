import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, AlertTriangle, Sparkles, TrendingUp, Wine, UtensilsCrossed } from "lucide-react";

/**
 * Lightweight "insights" panel for the admin dashboard: coverage of photos
 * per day, sold-out alerts, badge usage, and beverage health. Reads directly
 * from the public tables so it stays in sync with the CMS without extra
 * tracking infra (no analytics events needed).
 */
const MenuInsights = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [beverages, setBeverages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, i, b] = await Promise.all([
        supabase.from("weekly_menu_days").select("*").order("ordem"),
        supabase.from("weekly_menu_items").select("*"),
        supabase.from("beverages").select("*"),
      ]);
      setDays(d.data || []);
      setItems(i.data || []);
      setBeverages(b.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 mb-6 animate-pulse">
        <div className="h-4 w-40 bg-muted rounded mb-3" />
        <div className="h-24 bg-muted/60 rounded" />
      </div>
    );
  }

  const totalItems = items.length;
  const totalComFoto = items.filter((i) => i.imagem_url).length;
  const totalEsgotados = items.filter((i) => i.esgotado).length;
  const totalDestaques = items.filter((i) => i.badge === "novo" || i.badge === "destaque").length;
  const fotoPct = totalItems ? Math.round((totalComFoto / totalItems) * 100) : 0;

  // Coverage per day
  const coverage = days.map((d) => {
    const dayItems = items.filter((i) => i.day_id === d.id);
    const comFoto = dayItems.filter((i) => i.imagem_url).length;
    const pct = dayItems.length ? Math.round((comFoto / dayItems.length) * 100) : 0;
    return { day: d.dia_semana, total: dayItems.length, comFoto, pct, ativo: d.ativo !== false };
  });

  // Beverage health
  const bevTotal = beverages.length;
  const bevComFoto = beverages.filter((b) => b.imagem_url).length;
  const bevEsgotados = beverages.filter((b) => b.esgotado).length;
  const bevPct = bevTotal ? Math.round((bevComFoto / bevTotal) * 100) : 0;

  return (
    <div className="glass-effect rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">Insights do cardápio</h3>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi icon={UtensilsCrossed} label="Pratos cadastrados" value={totalItems} tone="text-foreground" />
        <Kpi icon={ImageIcon} label={`Cobertura de foto (${fotoPct}%)`} value={`${totalComFoto}/${totalItems}`} tone={fotoPct >= 80 ? "text-emerald-500" : fotoPct >= 50 ? "text-amber-500" : "text-destructive"} />
        <Kpi icon={AlertTriangle} label="Esgotados hoje" value={totalEsgotados} tone={totalEsgotados > 0 ? "text-destructive" : "text-muted-foreground"} />
        <Kpi icon={Sparkles} label="Destaques ativos" value={totalDestaques} tone={totalDestaques > 0 ? "text-primary" : "text-muted-foreground"} />
      </div>

      {/* Coverage by day */}
      <div className="space-y-2 mb-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cobertura de fotos por dia</p>
        {coverage.map((c) => (
          <div key={c.day} className="flex items-center gap-3">
            <span className={`w-24 text-sm ${c.ativo ? "text-foreground" : "text-muted-foreground line-through"}`}>{c.day}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${c.pct >= 80 ? "bg-emerald-500" : c.pct >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                style={{ width: `${c.pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-20 text-right">{c.comFoto}/{c.total} ({c.pct}%)</span>
          </div>
        ))}
        {coverage.length === 0 && <p className="text-xs text-muted-foreground">Nenhum dia configurado.</p>}
      </div>

      {/* Beverages */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
        <Wine className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Bebidas</p>
          <p className="text-xs text-muted-foreground">
            {bevTotal} itens · {bevComFoto} com foto ({bevPct}%) · {bevEsgotados} esgotados
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(totalItems > 0 && fotoPct < 50) || coverage.some((c) => c.total === 0 && c.ativo) ? (
        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs space-y-1">
          {totalItems > 0 && fotoPct < 50 && <p>⚠️ Menos da metade dos pratos tem foto. Pratos sem imagem perdem conversão.</p>}
          {coverage.filter((c) => c.total === 0 && c.ativo).map((c) => (
            <p key={c.day}>⚠️ <strong>{c.day}</strong> está ativo no site mas não tem nenhum prato.</p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Kpi = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone: string }) => (
  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 flex items-center gap-2.5">
    <Icon className={`h-4 w-4 ${tone}`} />
    <div className="min-w-0">
      <div className={`text-base font-semibold leading-tight ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
    </div>
  </div>
);

export default MenuInsights;