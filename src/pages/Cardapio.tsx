import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, Beef, Drumstick, Shell, CookingPot, Wheat, UtensilsCrossed, Leaf, Sprout, WheatOff, Flame, AlertTriangle, Sparkles, Clock, Search, X, CheckCircle2, Share2, Link as LinkIcon, type LucideIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { useI18n } from "@/lib/i18n";

const SITE_URL = "https://restaurantemacapaba.com.br";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const DIET_TAGS_META: Record<string, { labelKey: "menu.diet_vegan" | "menu.diet_veg" | "menu.diet_gf" | "menu.diet_spicy"; icon: LucideIcon; className: string }> = {
  "vegano": { labelKey: "menu.diet_vegan", icon: Leaf, className: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  "vegetariano": { labelKey: "menu.diet_veg", icon: Sprout, className: "bg-green-500/15 text-green-200 border-green-400/30" },
  "sem-gluten": { labelKey: "menu.diet_gf", icon: WheatOff, className: "bg-amber-500/15 text-amber-200 border-amber-400/30" },
  "picante": { labelKey: "menu.diet_spicy", icon: Flame, className: "bg-red-500/15 text-red-200 border-red-400/30" },
};

// Elegant dark placeholder shown when a dish has no media yet.
// Keeps the UI honest: the site reflects exactly what is in the CMS.
const DishPlaceholder = ({ prato, dia, size = "lg", soonLabel }: { prato: string; dia?: string; size?: "sm" | "lg"; soonLabel: string }) => {
  const Icon = getDishIcon(prato);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-background overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.25),_transparent_60%)]" />
      <div className="relative flex flex-col items-center text-center px-6">
        <div className="mb-3 p-4 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]">
          <Icon className={`${size === "lg" ? "h-10 w-10" : "h-7 w-7"} text-primary`} />
        </div>
        {dia && <p className="text-primary text-[10px] font-semibold uppercase tracking-widest mb-1">{dia}</p>}
        <h4 className={`font-display ${size === "lg" ? "text-lg" : "text-sm"} font-bold text-foreground/90 leading-tight`}>{prato}</h4>
        <span className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/60">{soonLabel}</span>
      </div>
    </div>
  );
};

const getDishIcon = (name: string): LucideIcon => {
  const n = name.toLowerCase();
  if (n.includes("peixe") || n.includes("salmão") || n.includes("bacalhau")) return Fish;
  if (n.includes("camarão") || n.includes("caranguejo")) return Shell;
  if (n.includes("filé") || n.includes("costela") || n.includes("cupim") || n.includes("charque") || n.includes("pernil") || n.includes("língua") || n.includes("panceta") || n.includes("pururuca") || n.includes("calabresa")) return Beef;
  if (n.includes("frango") || n.includes("peru")) return Drumstick;
  if (n.includes("caldeirada") || n.includes("creme") || n.includes("vatapá") || n.includes("bobó") || n.includes("pirão") || n.includes("estrogonofe") || n.includes("maniçoba") || n.includes("dobradinha")) return CookingPot;
  if (n.includes("lasanha") || n.includes("escondidinho")) return Wheat;
  return UtensilsCrossed;
};

interface BeverageCategory {
  id: string;
  nome: string;
  ordem: number;
}

interface Beverage {
  id: string;
  category_id: string;
  nome: string;
  volume: string | null;
  preco: number | null;
  imagem_url?: string | null;
  descricao?: string | null;
  badge?: string | null;
  esgotado?: boolean | null;
}

interface MenuDay {
  id: string;
  dia_semana: string;
  ordem: number;
}

interface MenuItem {
  id: string;
  day_id: string;
  prato: string;
  ordem: number;
  imagem_url: string | null;
  tipo_midia: string;
  tags?: string[] | null;
  unit_id?: string | null;
  descricao?: string | null;
  badge?: string | null;
  esgotado?: boolean | null;
  disponivel_de?: string | null;
  disponivel_ate?: string | null;
}

interface Unit {
  id: string;
  nome: string;
  principal: boolean;
  ativo: boolean;
}

const Cardapio = () => {
  const { t, tDish, tCategory, tDay, locale } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const diaParam = searchParams.get("dia");
  const pratoParam = searchParams.get("prato");
  const [tab, setTab] = useState(diaParam ? "semana" : "bebidas");
  const [categories, setCategories] = useState<BeverageCategory[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [days, setDays] = useState<MenuDay[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeDay, setActiveDay] = useState<string>("");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnit, setActiveUnit] = useState<string>("all");
  const [queryBev, setQueryBev] = useState("");
  const [querySemana, setQuerySemana] = useState("");
  const [activeDiet, setActiveDiet] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Is dish available right now based on its window?
  const isAvailableNow = (item: MenuItem) => {
    if (!item.disponivel_de && !item.disponivel_ate) return null; // no window set
    const cur = now.getHours() * 60 + now.getMinutes();
    const parse = (t?: string | null) => {
      if (!t) return null;
      const [h, m] = t.split(":");
      return Number(h) * 60 + Number(m || 0);
    };
    const from = parse(item.disponivel_de) ?? -Infinity;
    const to = parse(item.disponivel_ate) ?? Infinity;
    return cur >= from && cur <= to;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [catsRes, bevsRes, daysRes, itemsRes, unitsRes] = await Promise.all([
        supabase.from("beverage_categories").select("*").eq("ativo", true).order("ordem"),
        supabase.from("beverages").select("*").eq("ativo", true).eq("esgotado", false).order("ordem"),
        supabase.from("weekly_menu_days").select("*").eq("ativo", true).order("ordem"),
        supabase.from("weekly_menu_items").select("*").eq("ativo", true).eq("esgotado", false).order("ordem"),
        supabase.from("units").select("id,nome,principal,ativo").eq("ativo", true).order("principal", { ascending: false }),
      ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (bevsRes.data) setBeverages(bevsRes.data);
      if (daysRes.data) {
        setDays(daysRes.data);
        const target = diaParam ? daysRes.data.find((d) => d.dia_semana === diaParam) : daysRes.data[0];
        if (target) setActiveDay(target.id);
      }
      if (itemsRes.data) setMenuItems(itemsRes.data);
      if (unitsRes.data) setUnits(unitsRes.data as Unit[]);
    };
    fetchData();
  }, [diaParam]);

  // Refetch in the background whenever an admin changes menu/beverage data.
  useRealtimeRefresh(
    ["weekly_menu_items", "beverages", "beverage_categories", "weekly_menu_days"],
    () => {
      (async () => {
        const [catsRes, bevsRes, daysRes, itemsRes] = await Promise.all([
          supabase.from("beverage_categories").select("*").eq("ativo", true).order("ordem"),
          supabase.from("beverages").select("*").eq("ativo", true).eq("esgotado", false).order("ordem"),
          supabase.from("weekly_menu_days").select("*").eq("ativo", true).order("ordem"),
          supabase.from("weekly_menu_items").select("*").eq("ativo", true).eq("esgotado", false).order("ordem"),
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (bevsRes.data) setBeverages(bevsRes.data);
        if (daysRes.data) setDays(daysRes.data);
        if (itemsRes.data) setMenuItems(itemsRes.data);
      })();
    },
  );

  useEffect(() => {
    setSelectedItemIndex(0);
  }, [activeDay, activeUnit, querySemana, activeDiet]);

  const dayItemsAll = menuItems.filter(
    (item) =>
      item.day_id === activeDay &&
      (activeUnit === "all" || !item.unit_id || item.unit_id === activeUnit),
  );
  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const qSem = normalize(querySemana.trim());
  const selectedItems = dayItemsAll.filter((item) => {
    if (activeDiet && !(item.tags || []).includes(activeDiet)) return false;
    if (qSem) {
      const hay = normalize(`${item.prato} ${item.descricao || ""}`);
      if (!hay.includes(qSem)) return false;
    }
    return true;
  });

  // Diet chip availability for current day
  const dietCounts = useMemo(() => {
    const c: Record<string, number> = {};
    dayItemsAll.forEach((i) => (i.tags || []).forEach((t) => { c[t] = (c[t] || 0) + 1; }));
    return c;
  }, [dayItemsAll]);

  // Bebidas filtered
  const qBev = normalize(queryBev.trim());
  const filteredBeverages = qBev
    ? beverages.filter((b) => {
        const hay = normalize(`${b.nome} ${b.volume || ""} ${b.descricao || ""}`);
        return hay.includes(qBev);
      })
    : beverages;

  // Keyboard navigation on dish list
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tab !== "semana" || selectedItems.length === 0) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedItemIndex((i) => Math.min(selectedItems.length - 1, i + 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedItemIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, selectedItems.length]);

  // Deep-link: select dish by ?prato=slug once the list is loaded.
  useEffect(() => {
    if (!pratoParam || selectedItems.length === 0) return;
    const idx = selectedItems.findIndex((i) => slugify(i.prato) === pratoParam);
    if (idx >= 0) setSelectedItemIndex(idx);
  }, [pratoParam, selectedItems]);

  // Note: URL is not auto-synced with current selection to avoid update loops
  // with the fetch effect (which depends on `diaParam`). Share buttons build
  // the full shareable URL on demand.

  // Share current dish via Web Share API, with WhatsApp + copy-link fallbacks.
  const shareCurrent = async () => {
    const item = selectedItems[selectedItemIndex];
    const day = days.find((d) => d.id === activeDay);
    if (!item || !day) return;
    const url = `${SITE_URL}/cardapio?dia=${encodeURIComponent(day.dia_semana)}&prato=${slugify(item.prato)}`;
    const text = t("menu.share_text", { dish: tDish(item.prato), day: tDay(day.dia_semana) });
    try {
      if (navigator.share) {
        await navigator.share({ title: item.prato, text, url });
        return;
      }
    } catch { /* user dismissed */ }
    try {
      await navigator.clipboard.writeText(url);
      // Lightweight toast via alert-ish, but Cardapio doesn't import sonner here; use console + browser.
      window.dispatchEvent(new CustomEvent("macapaba:copied", { detail: url }));
      alert(t("menu.copied"));
    } catch {
      window.open(url, "_blank");
    }
  };

  const shareWhatsApp = () => {
    const item = selectedItems[selectedItemIndex];
    const day = days.find((d) => d.id === activeDay);
    if (!item || !day) return;
    const url = `${SITE_URL}/cardapio?dia=${encodeURIComponent(day.dia_semana)}&prato=${slugify(item.prato)}`;
    const text = `🍽️ ${t("menu.share_text", { dish: `*${tDish(item.prato)}*`, day: tDay(day.dia_semana) })}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  // ===== Structured data (JSON-LD Menu) =====
  const menuJsonLd = useMemo(() => {
    if (days.length === 0 || menuItems.length === 0) return undefined;
    const sections = days.map((d) => ({
      "@type": "MenuSection",
      name: tDay(d.dia_semana),
      hasMenuItem: menuItems
        .filter((i) => i.day_id === d.id)
        .map((i) => ({
          "@type": "MenuItem",
          name: tDish(i.prato),
          ...(i.descricao ? { description: i.descricao } : {}),
          ...(i.imagem_url && i.tipo_midia !== "video" ? { image: i.imagem_url } : {}),
        })),
    }));
    return {
      "@context": "https://schema.org",
      "@type": "Menu",
      name: `${t("menu.title")} — Restaurante Macapaba`,
      inLanguage: locale,
      hasMenuSection: sections,
    };
  }, [days, menuItems, locale]);

  const currentItem = selectedItems[selectedItemIndex];
  const currentDay = days.find((d) => d.id === activeDay);
  const dynamicTitle = tab === "semana" && currentItem && currentDay
    ? `${tDish(currentItem.prato)} — ${tDay(currentDay.dia_semana)} | Restaurante Macapaba`
    : t("seo.menu_title");
  const dynamicDesc = tab === "semana" && currentItem
    ? (currentItem.descricao ||
        t("menu.share_text", {
          dish: tDish(currentItem.prato),
          day: currentDay ? tDay(currentDay.dia_semana) : "",
        }))
    : t("seo.menu_desc");
  const dynamicImage = tab === "semana" && currentItem?.imagem_url && currentItem.tipo_midia !== "video"
    ? currentItem.imagem_url
    : undefined;

  return (
    <Layout>
      <SEO
        title={dynamicTitle}
        description={dynamicDesc}
        image={dynamicImage}
        jsonLd={menuJsonLd}
      />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t("menu.eyebrow")}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">{t("menu.title")}</h1>
            </div>
          </ScrollReveal>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-secondary mb-8">
              <TabsTrigger value="bebidas" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("menu.tab_drinks")}
              </TabsTrigger>
              <TabsTrigger value="semana" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("menu.tab_week")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bebidas">
              {/* Search + category quick-jump */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    value={queryBev}
                    onChange={(e) => setQueryBev(e.target.value)}
                    placeholder={t("menu.search_drink")}
                    aria-label={t("menu.search_drink_aria")}
                    className="pl-9 pr-9 bg-secondary/40 border-border"
                  />
                  {queryBev && (
                    <button
                      type="button"
                      onClick={() => setQueryBev("")}
                      aria-label={t("menu.clear_search")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {!queryBev && categories.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const count = beverages.filter((b) => b.category_id === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <a
                          key={cat.id}
                          href={`#cat-${cat.id}`}
                          className="px-2.5 py-1 rounded-full text-xs border border-border bg-secondary/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          {tCategory(cat.nome)} <span className="opacity-60">({count})</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              {categories.map((cat) => {
                const items = filteredBeverages.filter((b) => b.category_id === cat.id);
                if (items.length === 0) return null;
                return (
                  <ScrollReveal key={cat.id}>
                    <div id={`cat-${cat.id}`} className="mb-10 scroll-mt-24">
                      <h2 className="font-display text-2xl font-bold mb-4 text-primary">{tCategory(cat.nome)}</h2>
                      <ScrollReveal stagger className="space-y-0">
                        {items.map((bev) => (
                          <StaggerItem key={bev.id}>
                            <motion.div
                              className="flex justify-between items-center gap-3 py-3 border-b border-border/50 hover:bg-secondary/50 px-2 rounded transition-colors"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {bev.imagem_url && (
                                  <img
                                    src={bev.imagem_url}
                                    alt={tDish(bev.nome)}
                                    loading="lazy"
                                    className="h-12 w-12 rounded-md object-cover flex-shrink-0 border border-border/40"
                                  />
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium ${bev.esgotado ? "line-through text-muted-foreground" : ""}`}>{tDish(bev.nome)}</span>
                                    {bev.volume && <span className="text-muted-foreground text-sm">({bev.volume})</span>}
                                    {bev.esgotado && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-400/30">
                                        <AlertTriangle className="h-3 w-3" /> {t("menu.sold_out")}
                                      </span>
                                    )}
                                    {bev.badge && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                                        <Sparkles className="h-3 w-3" /> {bev.badge}
                                      </span>
                                    )}
                                  </div>
                                  {bev.descricao && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{bev.descricao}</p>
                                  )}
                                </div>
                              </div>
                              {bev.preco !== null && (
                                <span className="text-primary font-semibold flex-shrink-0">
                                  R$ {Number(bev.preco).toFixed(2).replace(".", ",")}
                                </span>
                              )}
                            </motion.div>
                          </StaggerItem>
                        ))}
                      </ScrollReveal>
                    </div>
                  </ScrollReveal>
                );
              })}
              {categories.length === 0 && (
                <p className="text-center text-muted-foreground py-12">{t("menu.no_drinks")}</p>
              )}
              {categories.length > 0 && qBev && filteredBeverages.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {t("menu.no_results_for")} "<span className="text-foreground">{queryBev}</span>".
                </p>
              )}
            </TabsContent>

            <TabsContent value="semana">
              {units.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">{t("menu.unit")}</span>
                  <Button
                    variant={activeUnit === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveUnit("all")}
                    className={activeUnit === "all" ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                  >
                    {t("menu.all")}
                  </Button>
                  {units.map((u) => (
                    <Button
                      key={u.id}
                      variant={activeUnit === u.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveUnit(u.id)}
                      className={activeUnit === u.id ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                    >
                      {u.nome}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-8">
                {days.map((day) => (
                  <Button
                    key={day.id}
                    variant={activeDay === day.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveDay(day.id)}
                    className={activeDay === day.id ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                  >
                    {tDay(day.dia_semana, true)}
                  </Button>
                ))}
              </div>

              {/* Search + diet chips */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    type="search"
                    value={querySemana}
                    onChange={(e) => setQuerySemana(e.target.value)}
                    placeholder={t("menu.search_dish")}
                    aria-label={t("menu.search_dish_aria")}
                    className="pl-9 pr-9 bg-secondary/40 border-border"
                  />
                  {querySemana && (
                    <button
                      type="button"
                      onClick={() => setQuerySemana("")}
                      aria-label={t("menu.clear_search")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {Object.keys(DIET_TAGS_META).some((k) => dietCounts[k]) && (
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("menu.diet_aria")}>
                    {Object.entries(DIET_TAGS_META).map(([key, meta]) => {
                      const count = dietCounts[key] || 0;
                      if (count === 0) return null;
                      const active = activeDiet === key;
                      const Icon = meta.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveDiet(active ? null : key)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                            active ? meta.className : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-3 w-3" /> {t(meta.labelKey)}
                          <span className="opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  {selectedItems.length > 0 ? (
                    <>
                      <div className="md:hidden flex justify-center">
                        <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/40">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedItems[selectedItemIndex]?.id || selectedItemIndex}
                              initial={{ opacity: 0, x: 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -30 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="absolute inset-0"
                            >
                              {(() => {
                                const item = selectedItems[selectedItemIndex];
                                if (!item) return null;
                                const currentDay = days.find((d) => d.id === activeDay);
                                if (!item.imagem_url) {
                                  return <DishPlaceholder prato={tDish(item.prato)} dia={currentDay ? tDay(currentDay.dia_semana) : undefined} size="lg" soonLabel={t("menu.photo_soon")} />;
                                }
                                return (
                                  <>
                                    {item.tipo_midia === 'video' ? (
                                      <video src={item.imagem_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={item.imagem_url} alt={tDish(item.prato)} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                      <div className="flex items-start justify-between gap-2">
                                        <h2 className="font-display text-xl font-bold text-white">{tDish(item.prato)}</h2>
                                        <div className="flex gap-1 shrink-0">
                                        <button onClick={shareWhatsApp} aria-label={t("menu.share_wa")} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"><Share2 className="h-3.5 w-3.5" /></button>
                                        <button onClick={shareCurrent} aria-label={t("menu.share_link")} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"><LinkIcon className="h-3.5 w-3.5" /></button>
                                        </div>
                                      </div>
                                      {item.descricao && <p className="text-white/85 text-xs mt-1 line-clamp-3">{item.descricao}</p>}
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {item.esgotado && (
                                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/80 text-white border border-red-300/40">
                                            <AlertTriangle className="h-3 w-3" /> {t("menu.sold_out_today")}
                                          </span>
                                        )}
                                        {item.badge && (
                                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground border border-primary/30">
                                            <Sparkles className="h-3 w-3" /> {item.badge}
                                          </span>
                                        )}
                                        {(item.disponivel_de || item.disponivel_ate) && (
                                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20">
                                            <Clock className="h-3 w-3" />
                                            {(item.disponivel_de || "").slice(0,5)}{item.disponivel_ate ? `–${item.disponivel_ate.slice(0,5)}` : ""}
                                          </span>
                                        )}
                                        {isAvailableNow(item) === true && !item.esgotado && (
                                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/80 text-white border border-emerald-300/40">
                                            <CheckCircle2 className="h-3 w-3" /> {t("menu.now")}
                                          </span>
                                        )}
                                      </div>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {item.tags.map((tag) => {
                                            const meta = DIET_TAGS_META[tag];
                                            if (!meta) return null;
                                            const Icon = meta.icon;
                                            return (
                                              <span key={tag} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${meta.className}`}>
                                                <Icon className="h-2.5 w-2.5" />
                                                {t(meta.labelKey)}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="font-display text-2xl font-bold mb-6">
                          {(() => { const d = days.find((x) => x.id === activeDay); return d ? tDay(d.dia_semana) : ""; })()}
                        </h2>
                        <div className="space-y-1">
                          {selectedItems.map((item, index) => {
                            const DishIcon = getDishIcon(item.prato);
                            const isActive = index === selectedItemIndex;
                            const avail = isAvailableNow(item);
                            return (
                              <button
                                key={item.id}
                                onClick={() => setSelectedItemIndex(index)}
                                aria-current={isActive ? "true" : undefined}
                                aria-label={`${tDish(item.prato)}${item.esgotado ? ` ${t("menu.sold_out_paren")}` : ""}`}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                                  isActive
                                    ? "bg-primary/10 border-l-4 border-primary shadow-sm"
                                    : "hover:bg-secondary/80 border-l-4 border-transparent"
                                }`}
                              >
                                <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-300 ${
                                  isActive ? "bg-primary/20" : "bg-secondary"
                                }`}>
                                  <DishIcon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-medium transition-colors duration-300 block ${item.esgotado ? "line-through opacity-70" : ""} ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                    {tDish(item.prato)}
                                  </span>
                                  {item.descricao && (
                                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-2">{item.descricao}</p>
                                  )}
                                  {(item.esgotado || item.badge) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.esgotado && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-400/30">
                                          <AlertTriangle className="h-2.5 w-2.5" /> {t("menu.sold_out")}
                                        </span>
                                      )}
                                      {item.badge && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                                          <Sparkles className="h-2.5 w-2.5" /> {item.badge}
                                        </span>
                                      )}
                                      {avail === true && !item.esgotado && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                                          <CheckCircle2 className="h-2.5 w-2.5" /> {t("menu.available_now")}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.tags.map((tag) => {
                                        const meta = DIET_TAGS_META[tag];
                                        if (!meta) return null;
                                        const Icon = meta.icon;
                                        return (
                                          <span key={tag} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${meta.className}`}>
                                            <Icon className="h-2.5 w-2.5" />
                                            {t(meta.labelKey)}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-muted-foreground text-sm italic mt-8">{t("menu.disclaimer")}</p>
                      </div>

                      <div className="hidden md:flex items-start justify-center flex-shrink-0">
                        <div className="relative w-[300px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/40">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedItems[selectedItemIndex]?.id || selectedItemIndex}
                              initial={{ opacity: 0, x: 40 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -40 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="absolute inset-0"
                            >
                              {(() => {
                                const item = selectedItems[selectedItemIndex];
                                if (!item) return null;
                                const currentDay = days.find((d) => d.id === activeDay);
                                if (!item.imagem_url) {
                                  return <DishPlaceholder prato={tDish(item.prato)} dia={currentDay ? tDay(currentDay.dia_semana) : undefined} size="lg" soonLabel={t("menu.photo_soon")} />;
                                }
                                return (
                                  <>
                                    {item.tipo_midia === 'video' ? (
                                      <video src={item.imagem_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={item.imagem_url} alt={tDish(item.prato)} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                      <div className="flex items-start justify-between gap-2">
                                        <h2 className="font-display text-2xl font-bold text-white">{tDish(item.prato)}</h2>
                                        <div className="flex gap-1.5 shrink-0">
                                        <button onClick={shareWhatsApp} aria-label={t("menu.share_wa")} className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"><Share2 className="h-4 w-4" /></button>
                                        <button onClick={shareCurrent} aria-label={t("menu.share_link")} className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"><LinkIcon className="h-4 w-4" /></button>
                                        </div>
                                      </div>
                                      {item.descricao && <p className="text-white/85 text-sm mt-1 line-clamp-3">{item.descricao}</p>}
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {item.esgotado && (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-500/80 text-white border border-red-300/40">
                                            <AlertTriangle className="h-3 w-3" /> {t("menu.sold_out_today")}
                                          </span>
                                        )}
                                        {item.badge && (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground border border-primary/30">
                                            <Sparkles className="h-3 w-3" /> {item.badge}
                                          </span>
                                        )}
                                        {(item.disponivel_de || item.disponivel_ate) && (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20">
                                            <Clock className="h-3 w-3" />
                                            {(item.disponivel_de || "").slice(0,5)}{item.disponivel_ate ? `–${item.disponivel_ate.slice(0,5)}` : ""}
                                          </span>
                                        )}
                                        {isAvailableNow(item) === true && !item.esgotado && (
                                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/80 text-white border border-emerald-300/40">
                                            <CheckCircle2 className="h-3 w-3" /> {t("menu.available_now")}
                                          </span>
                                        )}
                                      </div>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {item.tags.map((tag) => {
                                            const meta = DIET_TAGS_META[tag];
                                            if (!meta) return null;
                                            const Icon = meta.icon;
                                            return (
                                              <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.className}`}>
                                                <Icon className="h-3 w-3" />
                                                {t(meta.labelKey)}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full text-center py-8 text-muted-foreground">
                      {dayItemsAll.length === 0 ? (
                        <p>{t("menu.no_dishes_day")}</p>
                      ) : (
                        <div className="space-y-3">
                          <p>{t("menu.no_dishes_filter")}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setQuerySemana(""); setActiveDiet(null); }}
                          >
                            {t("menu.clear_filters")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Cardapio;
