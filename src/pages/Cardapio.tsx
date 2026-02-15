import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Fish, Beef, Drumstick, Shell, CookingPot, Wheat, UtensilsCrossed, Play, type LucideIcon } from "lucide-react";

import foodDemo1 from "@/assets/food-demo-1.jpeg";
import foodDemo2 from "@/assets/food-demo-2.jpeg";
import foodDemo3 from "@/assets/food-demo-3.jpeg";

const demoImages = [foodDemo1, foodDemo2, foodDemo3];

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

  useEffect(() => {
    const fetchData = async () => {
      const [catsRes, bevsRes, daysRes, itemsRes] = await Promise.all([
        supabase.from("beverage_categories").select("*").eq("ativo", true).order("ordem"),
        supabase.from("beverages").select("*").eq("ativo", true).order("ordem"),
        supabase.from("weekly_menu_days").select("*").order("ordem"),
        supabase.from("weekly_menu_items").select("*").eq("ativo", true).order("ordem"),
      ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (bevsRes.data) setBeverages(bevsRes.data);
      if (daysRes.data) {
        setDays(daysRes.data);
        const target = diaParam ? daysRes.data.find((d) => d.dia_semana === diaParam) : daysRes.data[0];
        if (target) setActiveDay(target.id);
      }
      if (itemsRes.data) setMenuItems(itemsRes.data);
    };
    fetchData();
  }, [diaParam]);

  useEffect(() => {
    setSelectedItemIndex(0);
  }, [activeDay]);

  const selectedItems = menuItems.filter((item) => item.day_id === activeDay);

  return (
    <Layout>
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
                      <h3 className="font-display text-2xl font-bold mb-4 text-primary">{cat.nome}</h3>
                      <ScrollReveal stagger className="space-y-0">
                        {items.map((bev) => (
                          <StaggerItem key={bev.id}>
                            <motion.div
                              className="flex justify-between items-center py-3 border-b border-border/50 hover:bg-secondary/50 px-2 rounded transition-colors"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div>
                                <span className="font-medium">{bev.nome}</span>
                                {bev.volume && <span className="text-muted-foreground text-sm ml-2">({bev.volume})</span>}
                              </div>
                              {bev.preco !== null && (
                                <span className="text-primary font-semibold">
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
                                const mediaUrl = item.imagem_url || demoImages[selectedItemIndex % 3];
                                const mediaTipo = item.imagem_url ? item.tipo_midia : 'imagem';
                                const currentDay = days.find((d) => d.id === activeDay);
                                return (
                                  <>
                                    {mediaTipo === 'video' ? (
                                      <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={mediaUrl} alt={item.prato} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">{currentDay?.dia_semana}</p>
                                      <h3 className="font-display text-xl font-bold text-white">{item.prato}</h3>
                                    </div>
                                  </>
                                );
                              })()}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-2xl font-bold mb-6">
                          {days.find((d) => d.id === activeDay)?.dia_semana}
                        </h3>
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
                                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                  {item.prato}
                                </span>
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
                                const mediaUrl = item.imagem_url || demoImages[selectedItemIndex % 3];
                                const mediaTipo = item.imagem_url ? item.tipo_midia : 'imagem';
                                const currentDay = days.find((d) => d.id === activeDay);
                                return (
                                  <>
                                    {mediaTipo === 'video' ? (
                                      <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                      <img src={mediaUrl} alt={item.prato} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">{currentDay?.dia_semana}</p>
                                      <h3 className="font-display text-2xl font-bold text-white">{item.prato}</h3>
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
