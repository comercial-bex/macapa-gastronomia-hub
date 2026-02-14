import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

  return (
    <Layout>
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
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
                      <div className="space-y-3">
                        {items.map((bev) => (
                          <div key={bev.id} className="flex justify-between items-center py-3 border-b border-border/50">
                            <div>
                              <span className="font-medium">{bev.nome}</span>
                              {bev.volume && <span className="text-muted-foreground text-sm ml-2">({bev.volume})</span>}
                            </div>
                            {bev.preco !== null && (
                              <span className="text-primary font-semibold">
                                R$ {Number(bev.preco).toFixed(2).replace(".", ",")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
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

              {activeDay && (
                <ScrollReveal>
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-6">
                      {days.find((d) => d.id === activeDay)?.dia_semana}
                    </h3>
                    <div className="space-y-3">
                      {menuItems
                        .filter((item) => item.day_id === activeDay)
                        .map((item) => (
                          <div key={item.id} className="py-3 border-b border-border/50">
                            <span className="font-medium">{item.prato}</span>
                          </div>
                        ))}
                    </div>
                    {menuItems.filter((item) => item.day_id === activeDay).length === 0 && (
                      <p className="text-muted-foreground py-6">Nenhum prato cadastrado para este dia.</p>
                    )}
                    <p className="text-muted-foreground text-sm italic mt-8">* O cardápio pode variar.</p>
                  </div>
                </ScrollReveal>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Cardapio;
