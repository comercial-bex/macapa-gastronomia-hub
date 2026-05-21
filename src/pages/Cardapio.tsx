import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, Beef, Drumstick, Shell, CookingPot, Wheat, UtensilsCrossed, Play, Leaf, Sprout, WheatOff, Flame, AlertTriangle, Sparkles, Clock, type LucideIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

const DIET_TAGS_META: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  "vegano": { label: "Vegano", icon: Leaf, className: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  "vegetariano": { label: "Vegetariano", icon: Sprout, className: "bg-green-500/15 text-green-200 border-green-400/30" },
  "sem-gluten": { label: "Sem glúten", icon: WheatOff, className: "bg-amber-500/15 text-amber-200 border-amber-400/30" },
  "picante": { label: "Picante", icon: Flame, className: "bg-red-500/15 text-red-200 border-red-400/30" },
};

// Elegant dark placeholder shown when a dish has no media yet.
// Keeps the UI honest: the site reflects exactly what is in the CMS.
const DishPlaceholder = ({ prato, dia, size = "lg" }: { prato: string; dia?: string; size?: "sm" | "lg" }) => {
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
        <span className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/60">Foto em breve</span>
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
  const [searchParams] = useSearchParams();
  const diaParam = searchParams.get("dia");
  const [tab, setTab] = useState(diaParam ? "semana" : "bebidas");
  const [categories, setCategories] = useState<BeverageCategory[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [days, setDays] = useState<MenuDay[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeDay, setActiveDay] = useState<string>("");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnit, setActiveUnit] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      const [catsRes, bevsRes, daysRes, itemsRes, unitsRes] = await Promise.all([
        supabase.from("beverage_categories").select("*").eq("ativo", true).order("ordem"),
        supabase.from("beverages").select("*").eq("ativo", true).order("ordem"),
        supabase.from("weekly_menu_days").select("*").order("ordem"),
        supabase.from("weekly_menu_items").select("*").eq("ativo", true).order("ordem"),
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
          supabase.from("beverages").select("*").eq("ativo", true).order("ordem"),
          supabase.from("weekly_menu_days").select("*").order("ordem"),
          supabase.from("weekly_menu_items").select("*").eq("ativo", true).order("ordem"),
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
  }, [activeDay, activeUnit]);

  const selectedItems = menuItems.filter(
    (item) =>
      item.day_id === activeDay &&
      (activeUnit === "all" || !item.unit_id || item.unit_id === activeUnit),
  );

  return (
    <Layout>
      <SEO
        title="Cardápio — Restaurante Macapaba | Macapá-AP"
        description="Confira o cardápio do Restaurante Macapaba: pratos da semana, especialidades amazônicas e seleção de bebidas em Macapá-AP."
      />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Sabores</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Cardápio</h1>
            </div>
          </ScrollReveal>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full bg-secondary mb-8">
              <TabsTrigger value="bebidas" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Bebidas
              </TabsTrigger>
              <TabsTrigger value="semana" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Cardápio da Semana
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bebidas">
              {categories.map((cat) => {
                const items = beverages.filter((b) => b.category_id === cat.id);
                if (items.length === 0) return null;
                return (
                  <ScrollReveal key={cat.id}>
                    <div className="mb-10">
                      <h2 className="font-display text-2xl font-bold mb-4 text-primary">{cat.nome}</h2>
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
                                    alt={bev.nome}
                                    loading="lazy"
                                    className="h-12 w-12 rounded-md object-cover flex-shrink-0 border border-border/40"
                                  />
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium ${bev.esgotado ? "line-through text-muted-foreground" : ""}`}>{bev.nome}</span>
                                    {bev.volume && <span className="text-muted-foreground text-sm">({bev.volume})</span>}
                                    {bev.esgotado && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-400/30">
                                        <AlertTriangle className="h-3 w-3" /> Esgotado
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
                <p className="text-center text-muted-foreground py-12">Nenhuma bebida cadastrada.</p>
              )}
            </TabsContent>

            <TabsContent value="semana">
              {units.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">Unidade:</span>
                  <Button
                    variant={activeUnit === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveUnit("all")}
                    className={activeUnit === "all" ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                  >
                    Todas
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
                    {day.dia_semana.slice(0, 3)}
                  </Button>
                ))}
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
                                  return <DishPlaceholder prato={item.prato} dia={currentDay?.dia_semana} size="lg" />;
                                }
                                return (
                                  <>
                                    {item.tipo_midia === 'video' ? (
                                      <video src={item.imagem_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={item.imagem_url} alt={item.prato} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">{currentDay?.dia_semana}</p>
                                      <h2 className="font-display text-xl font-bold text-white">{item.prato}</h2>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {item.tags.map((t) => {
                                            const meta = DIET_TAGS_META[t];
                                            if (!meta) return null;
                                            const Icon = meta.icon;
                                            return (
                                              <span key={t} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${meta.className}`}>
                                                <Icon className="h-2.5 w-2.5" />
                                                {meta.label}
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
                          {days.find((d) => d.id === activeDay)?.dia_semana}
                        </h2>
                        <div className="space-y-1">
                          {selectedItems.map((item, index) => {
                            const DishIcon = getDishIcon(item.prato);
                            const isActive = index === selectedItemIndex;
                            return (
                              <button
                                key={item.id}
                                onClick={() => setSelectedItemIndex(index)}
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
                                  <span className={`text-sm font-medium transition-colors duration-300 block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                    {item.prato}
                                  </span>
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.tags.map((t) => {
                                        const meta = DIET_TAGS_META[t];
                                        if (!meta) return null;
                                        const Icon = meta.icon;
                                        return (
                                          <span key={t} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${meta.className}`}>
                                            <Icon className="h-2.5 w-2.5" />
                                            {meta.label}
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
                        <p className="text-muted-foreground text-sm italic mt-8">* O cardápio pode variar.</p>
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
                                  return <DishPlaceholder prato={item.prato} dia={currentDay?.dia_semana} size="lg" />;
                                }
                                return (
                                  <>
                                    {item.tipo_midia === 'video' ? (
                                      <video src={item.imagem_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={item.imagem_url} alt={item.prato} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">{currentDay?.dia_semana}</p>
                                      <h2 className="font-display text-2xl font-bold text-white">{item.prato}</h2>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {item.tags.map((t) => {
                                            const meta = DIET_TAGS_META[t];
                                            if (!meta) return null;
                                            const Icon = meta.icon;
                                            return (
                                              <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.className}`}>
                                                <Icon className="h-3 w-3" />
                                                {meta.label}
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
                      <p>Nenhum prato cadastrado para este dia.</p>
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
