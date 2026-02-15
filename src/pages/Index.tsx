import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/ui/image-gallery";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import Layout from "@/components/Layout";
import AnimatedImage from "@/components/AnimatedImage";
import AnimatedCounter from "@/components/AnimatedCounter";
import SectionDivider from "@/components/SectionDivider";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { UtensilsCrossed, Users, Calendar, Fish, Beef, Drumstick, Shell, CookingPot, Wheat, X, Play, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { supabase } from "@/integrations/supabase/client";

import pratoVariado from "@/assets/prato-variado.jpeg";
import sushi from "@/assets/sushi.jpeg";
import garcomServindo from "@/assets/garcom-servindo.jpeg";
import clientesRestaurante from "@/assets/clientes-restaurante.jpeg";
import salaoRestaurante from "@/assets/salao-restaurante.jpeg";

import foodDemo1 from "@/assets/food-demo-1.jpeg";
import foodDemo2 from "@/assets/food-demo-2.jpeg";
import foodDemo3 from "@/assets/food-demo-3.jpeg";

const demoImages = [foodDemo1, foodDemo2, foodDemo3];

const weekDayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

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

const portfolioImages = [
  { src: pratoVariado, alt: "Prato variado com sushi, carne e arroz" },
  { src: sushi, alt: "Sushi variado" },
  { src: garcomServindo, alt: "Garçom servindo no restaurante" },
  { src: clientesRestaurante, alt: "Clientes no restaurante" },
  { src: salaoRestaurante, alt: "Salão do restaurante" },
  { src: pratoVariado, alt: "Prato especial do Macapabá" },
];

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Cardápio da Semana - dados do banco
  const [menuDays, setMenuDays] = useState<{ id: string; dia_semana: string; ordem: number }[]>([]);
  const [menuItems, setMenuItems] = useState<{ id: string; prato: string; day_id: string | null; ordem: number; imagem_url: string | null; tipo_midia: string }[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<{ prato: string; imagem_url: string; tipo_midia: string; dia_semana: string } | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: days } = await supabase
        .from("weekly_menu_days")
        .select("*")
        .order("ordem");
      const { data: items } = await supabase
        .from("weekly_menu_items")
        .select("*")
        .eq("ativo", true)
        .order("ordem");

      if (days && days.length > 0) {
        setMenuDays(days);
        // Auto-selecionar o dia atual (0=Dom, 1=Seg...)
        const jsDay = new Date().getDay(); // 0=Dom
        const mappedIndex = jsDay === 0 ? 6 : jsDay - 1; // 0=Seg...6=Dom
        const todayDay = days[mappedIndex] || days[0];
        setSelectedDayId(todayDay.id);
      }
      if (items) setMenuItems(items);
    };
    fetchMenu();
  }, []);

  const selectedItems = menuItems.filter((item) => item.day_id === selectedDayId);
  return (
    <Layout>
      {/* Hero with Parallax */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={garcomServindo}
          alt="Restaurante Macapabá"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: heroY }}
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <img src={logoMacapaba} alt="Macapabá" className="h-20 md:h-28 mx-auto mb-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 text-white"
          >
            <span className="text-primary">Sabor</span> e tradição em Macapá desde 1998
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Uma casa feita de encontros, histórias e pratos que viram memória.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/reserva">
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary) / 0.4)", "0 0 0 12px hsl(var(--primary) / 0)", "0 0 0 0 hsl(var(--primary) / 0)"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="rounded-md inline-block"
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-8 active:scale-95 transition-transform">
                  Fazer Reserva
                </Button>
              </motion.div>
            </Link>
            <Link to="/cardapio">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold uppercase tracking-wider px-8 hover:scale-105 active:scale-95 transition-transform">
                Ver Cardápio
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Desde 1998 */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Desde 1998</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">A História</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Inaugurado em abril de 1998, o Restaurante Macapabá carrega uma história de dedicação à gastronomia regional. Com pratos que misturam sabores amazônicos e culinária nacional, nos tornamos referência em Macapá para quem busca uma experiência gastronômica completa.
                </p>
                <Link to="/reserva">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform">
                    Fazer Reserva
                  </Button>
                </Link>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden aspect-video">
                  <AnimatedImage
                    src={salaoRestaurante}
                    alt="Salão do Restaurante Macapabá"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <UtensilsCrossed className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="font-display text-4xl font-bold">
                      <AnimatedCounter target={50} suffix="" />
                      <span className="text-primary">+</span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">Variedades</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="font-display text-4xl font-bold">
                      <AnimatedCounter target={100} suffix="" />
                      <span className="text-primary">+</span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">Capacidade</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* Portfolio Preview */}
      <section className="py-24 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <ScrollReveal>
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3 text-center">Nosso Portfólio</p>
            <ImageGallery
              images={portfolioImages}
              title="Momentos & Sabores"
              subtitle="Uma coleção visual dos nossos melhores momentos – cada imagem capturada com dedicação, emoção e sabor."
            />
          </ScrollReveal>
          <div className="text-center mt-12">
            <Link to="/portfolio">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-wider font-semibold hover:scale-105 active:scale-95 transition-transform">
                Ver Portfólio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Cardápio da Semana */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Cardápio</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Cardápio da Semana</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Descubra os pratos especiais preparados com carinho para cada dia
              </p>
            </div>
          </ScrollReveal>

          {/* Tabs dos dias */}
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {menuDays.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    selectedDayId === day.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/20 hover:scale-105"
                  }`}
                >
                  {weekDayLabels[i] || day.dia_semana}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Grid de pratos */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDayId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => {
                  const DishIcon = getDishIcon(item.prato);
                  const mediaUrl = item.imagem_url || demoImages[index % 3];
                  const mediaTipo = item.imagem_url ? item.tipo_midia : 'imagem';
                  const currentDay = menuDays.find((d) => d.id === selectedDayId);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDish({ prato: item.prato, imagem_url: mediaUrl, tipo_midia: mediaTipo, dia_semana: currentDay?.dia_semana || "" })}
                      className="relative overflow-hidden rounded-xl border border-primary/10 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/25 hover:scale-[1.03] transition-all duration-300 group cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {mediaTipo === 'video' ? (
                          <div className="relative w-full h-full">
                            <video src={mediaUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Play className="h-5 w-5 text-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={mediaUrl} alt={item.prato} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/30 backdrop-blur-sm">
                          <DishIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-white drop-shadow-lg">{item.prato}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>Nenhum prato cadastrado para este dia.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Modal Reels */}
          <Dialog open={!!selectedDish} onOpenChange={() => setSelectedDish(null)}>
            <DialogContent className="max-w-sm sm:max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden overflow-hidden rounded-2xl">
              <AnimatePresence>
                {selectedDish && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative aspect-[9/16] w-full bg-black rounded-2xl overflow-hidden"
                  >
                    {selectedDish.tipo_midia === 'video' ? (
                      <video
                        src={selectedDish.imagem_url}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={selectedDish.imagem_url}
                        alt={selectedDish.prato}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                    {/* Close button */}
                    <button
                      onClick={() => setSelectedDish(null)}
                      className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                    {/* Dish info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">{selectedDish.dia_semana}</p>
                      <h3 className="font-display text-2xl font-bold text-white">{selectedDish.prato}</h3>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>

          <p className="text-center text-muted-foreground text-xs mt-6 italic">
            * O cardápio pode sofrer alterações sem aviso prévio
          </p>

          <div className="text-center mt-10">
            <Link to="/cardapio">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-8 hover:scale-105 active:scale-95 transition-transform">
                Ver Cardápio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* CTA Final */}
      <section className="py-24 px-4 bg-secondary/50">
        <div className="container mx-auto text-center">
          <ScrollReveal>
            <Calendar className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Reserve sua mesa agora</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Garanta seu lugar para uma experiência gastronômica inesquecível.
            </p>
            <Link to="/reserva">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-10 hover:scale-105 active:scale-95 transition-transform">
                Fazer Reserva
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
