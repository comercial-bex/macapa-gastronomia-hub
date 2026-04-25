import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ScrollReveal from "@/components/ScrollReveal";
import Layout from "@/components/Layout";
import AnimatedCounter from "@/components/AnimatedCounter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  UtensilsCrossed, Users, Calendar, Fish, Beef, Drumstick, Shell, CookingPot, Wheat,
  MessageCircle, ChevronDown, Star, Quote, MapPin, Clock, ArrowRight,
  type LucideIcon
} from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { z } from "zod";
import { Award, Leaf, Heart } from "lucide-react";

 import pratoVariado from "@/assets/prato-variado.jpg";
 import sushi from "@/assets/sushi.jpg";
 import garcomServindo from "@/assets/garcom-servindo.jpg";
 import clientesRestaurante from "@/assets/clientes-restaurante.jpg";
import salaoRestaurante from "@/assets/salao-restaurante.jpg";

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
  { src: pratoVariado, alt: "Prato variado" },
  { src: sushi, alt: "Sushi" },
  { src: garcomServindo, alt: "Atendimento" },
  { src: clientesRestaurante, alt: "Experiência" },
  { src: salaoRestaurante, alt: "Ambiente" },
  { src: pratoVariado, alt: "Especialidade" },
];

const specialties = [
  { title: "Culinária Amazônica", desc: "Sabores autênticos da floresta, peixes nobres e ingredientes regionais únicos.", image: pratoVariado },
  { title: "Grelhados Premium", desc: "Cortes selecionados preparados no ponto perfeito, com acompanhamentos artesanais.", image: garcomServindo },
  { title: "Sushi & Sashimi", desc: "Peças frescas preparadas por chefs especializados com técnica oriental refinada.", image: sushi },
];

const testimonials = [
  { name: "Ana Carolina M.", text: "Uma experiência gastronômica incomparável. O peixe amazônico é simplesmente divino. Ambiente elegante e atendimento impecável.", rating: 5 },
   { name: "Roberto S.", text: "Frequento o Macapaba desde a inauguração. Quase 30 anos de qualidade consistente — isso é raro. Minha família adora.", rating: 5 },
  { name: "Juliana P.", text: "O melhor restaurante de Macapá, sem dúvida. O buffet é variado, tudo fresco, e o sushi é espetacular. Recomendo demais!", rating: 5 },
   { name: "Carlos Eduardo F.", text: "Levei clientes de São Paulo e ficaram impressionados. O Macapaba honra a gastronomia do Amapá. Nota 10.", rating: 5 },
];

const marqueeText = "GASTRONOMIA AMAZÔNICA  ✦  DESDE 2018  ✦  MACAPÁ  ✦  CULINÁRIA DE AUTOR  ✦  EXPERIÊNCIA ÚNICA  ✦  ";

/* ── Scroll Progress Bar ── */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60]"
    />
  );
};

/* ── Infinite Marquee ── */
const InfiniteMarquee = () => (
  <div className="py-8 md:py-12 overflow-hidden border-y border-border/30">
    <div className="marquee-track">
      <span className="marquee-content font-display text-2xl md:text-4xl lg:text-5xl font-bold text-primary/20 whitespace-nowrap select-none">
        {marqueeText}{marqueeText}
      </span>
      <span className="marquee-content font-display text-2xl md:text-4xl lg:text-5xl font-bold text-primary/20 whitespace-nowrap select-none" aria-hidden>
        {marqueeText}{marqueeText}
      </span>
    </div>
  </div>
);

/* ── Pinned Horizontal Scroll for Specialties ── */
const HorizontalScrollSection = ({ specialties: items }: { specialties: { title: string; desc: string; image: string }[] }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Use useTransform with a function so it always reads the latest scrollWidth
  const x = useTransform(scrollYProgress, (progress) => {
    if (!trackRef.current) return 0;
    const scrollWidth = trackRef.current.scrollWidth;
    const containerWidth = trackRef.current.parentElement?.clientWidth || window.innerWidth;
    const maxScroll = Math.max(0, scrollWidth - containerWidth);
    return -progress * maxScroll;
  });

  return (
    <section ref={sectionRef} className="relative" style={{ height: "150vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="container mx-auto px-4 pt-20 pb-10 flex-shrink-0">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">Especialidades</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95]">Nossos<br />Destaques</h2>
            </div>
            <Link to="/cardapio" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              Ver cardápio <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div ref={trackRef} style={{ x }} className="flex h-full gap-6 px-4">
            {items.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-[80vw] md:w-[60vw] lg:w-[45vw] h-full pb-8">
                <div className="relative h-full overflow-hidden rounded-sm group cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-white/50 text-sm md:text-base max-w-sm leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { getSetting } = useSiteSettings();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Cardápio da Semana
  const [menuDays, setMenuDays] = useState<{ id: string; dia_semana: string; ordem: number }[]>([]);
  const [menuItems, setMenuItems] = useState<{ id: string; prato: string; day_id: string | null; ordem: number; imagem_url: string | null; tipo_midia: string }[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  // Testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: days } = await supabase.from("weekly_menu_days").select("*").order("ordem");
      const { data: items } = await supabase.from("weekly_menu_items").select("*").eq("ativo", true).order("ordem");
      if (days && days.length > 0) {
        setMenuDays(days);
        const jsDay = new Date().getDay();
        const mappedIndex = jsDay === 0 ? 6 : jsDay - 1;
        const todayDay = days[mappedIndex] || days[0];
        setSelectedDayId(todayDay.id);
      }
      if (items) setMenuItems(items);
    };
    fetchMenu();
  }, []);

  useEffect(() => { setSelectedItemIndex(0); }, [selectedDayId]);

  const selectedItems = menuItems.filter((item) => item.day_id === selectedDayId);

  return (
    <Layout>
      <SEO
        title="Restaurante Macapaba — Gastronomia Amazônica em Macapá"
        description="Restaurante em Macapá desde 2018. Culinária amazônica autoral, peixes regionais, sushi e ambiente acolhedor. Reserve sua mesa no Macapaba."
      />
      <ScrollProgress />

      {/* ═══════════════ HERO — CINEMATIC ═══════════════ */}
      <section ref={heroRef} className="relative h-screen -mt-16 flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <video
            src="/videos/hero.mp4"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster={garcomServindo}
          />
        </motion.div>
        <div className="absolute inset-0 z-10 bg-black/50" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.img
            src={logoMacapaba}
             alt="Macapaba"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-14 md:h-20 mx-auto mb-10 drop-shadow-2xl"
          />

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-display font-display font-light text-white leading-[0.95] tracking-tight"
            >
               {getSetting("hero_titulo", "Sabor e tradição em Macapá desde 2018")}
            </motion.h1>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
            className="h-px w-24 bg-primary mx-auto my-8 origin-center"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-base md:text-lg text-white/60 max-w-xl mx-auto font-light tracking-wide"
          >
            {getSetting("hero_subtitulo", "Uma casa feita de encontros, histórias e pratos que viram memória.")}
          </motion.p>
        </motion.div>

        {/* Scroll line indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-light">Scroll</span>
          <motion.div
            className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </motion.div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <InfiniteMarquee />

      {/* ═══════════════ HISTÓRIA — SPLIT SCREEN ═══════════════ */}
      <section className="py-32 md:py-44 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 xl:gap-32 items-center">
            {/* Text side */}
            <ScrollReveal>
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-6"
                >
                  {getSetting("historia_subtitulo", "Desde 2018")}
                </motion.p>

                <h2 className="text-display font-display font-bold leading-[0.95] mb-10">
                  {getSetting("historia_titulo", "A História")}
                </h2>

                <p className="text-muted-foreground leading-relaxed text-lg mb-16 max-w-md">
                  {getSetting("historia_texto", "Inaugurado em abril de 2018, o Restaurante Macapaba nasceu do sonho de oferecer aos macapaenses uma experiência gastronômica única. Ao longo de mais de 25 anos, nos tornamos referência em culinária regional, combinando sabores amazônicos com técnicas contemporâneas. Nosso compromisso com a qualidade e o atendimento nos consolidou como um dos restaurantes mais tradicionais e queridos de Macapá.")}
                </p>

                {/* Big numbers — display style */}
                <div className="flex gap-16 mb-12">
                  <div>
                    <p className="font-display text-6xl md:text-8xl font-bold text-primary leading-none">
                      <AnimatedCounter target={7} suffix="" />
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">Anos</p>
                  </div>
                  <div>
                    <p className="font-display text-6xl md:text-8xl font-bold text-primary leading-none">
                      <AnimatedCounter target={50} suffix="" />
                      <span className="text-primary/60">+</span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">Pratos</p>
                  </div>
                </div>

                {/* Highlights — diferenciais */}
                <div className="grid sm:grid-cols-3 gap-6 pt-10 border-t border-border/40">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">Desde 2018</p>
                      <p className="text-muted-foreground text-xs mt-1">Tradição construída em Macapá</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">Amazônia/AP</p>
                      <p className="text-muted-foreground text-xs mt-1">Ingredientes regionais selecionados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">Feito à mão</p>
                      <p className="text-muted-foreground text-xs mt-1">Atendimento próximo e acolhedor</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Image side — reveal */}
            <ScrollReveal>
              <div className="relative">
                <motion.div
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden rounded-sm"
                >
                  <img
                    src={salaoRestaurante}
                     alt="Salão do Restaurante Macapaba"
                    className="w-full h-[500px] lg:h-[650px] object-cover"
                  />
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ ESPECIALIDADES — PINNED HORIZONTAL SCROLL ═══════════════ */}
      <HorizontalScrollSection specialties={specialties} />

      {/* ═══════════════ GALERIA — CINEMATIC GRID ═══════════════ */}
      <section className="py-32 md:py-44 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">Galeria</p>
              <h2 className="text-display font-display font-bold leading-[0.95]">Momentos</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto">
            {portfolioImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`overflow-hidden rounded-sm group cursor-pointer ${
                  i % 3 === 0 ? "h-[300px] md:h-[450px]" : "h-[250px] md:h-[350px]"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              Ver portfólio completo <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CARDÁPIO DA SEMANA — MINIMAL ═══════════════ */}
      <section className="py-32 md:py-44 px-4 bg-card/50">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">Cardápio</p>
              <h2 className="text-display font-display font-bold leading-[0.95] mb-4">Cardápio da Semana</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Pratos especiais preparados com carinho para cada dia
              </p>
            </div>
          </ScrollReveal>

          {/* Minimal underline tabs */}
          <ScrollReveal>
            <div className="flex justify-center mb-16">
              <div className="inline-flex gap-6 md:gap-8">
                {menuDays.map((day, i) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`relative text-xs font-semibold uppercase tracking-wider pb-3 transition-colors duration-300 ${
                      selectedDayId === day.id ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
                    }`}
                  >
                    {weekDayLabels[i] || day.dia_semana}
                    {selectedDayId === day.id && (
                      <motion.div
                        layoutId="menu-underline"
                        className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDayId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto"
            >
              {selectedItems.length > 0 ? (
                <>
                  {/* Mobile: Media on top */}
                  <div className="md:hidden flex justify-center">
                    <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-sm overflow-hidden bg-black shadow-2xl shadow-black/40">
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
                            const currentDay = menuDays.find((d) => d.id === selectedDayId);
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

                  {/* Left: Dish list — minimal */}
                  <div className="flex-1 min-w-0">
                    <div className="divide-y divide-border/30">
                      {selectedItems.map((item, index) => {
                        const isActive = index === selectedItemIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItemIndex(index)}
                            className={`w-full flex items-center justify-between px-2 py-4 text-left transition-all duration-300 group ${
                              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="text-sm font-medium">{item.prato}</span>
                            <ArrowRight className={`h-3 w-3 transition-all duration-300 ${isActive ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: 9:16 Media Viewer (Desktop) — clean frame */}
                  <div className="hidden md:flex items-start justify-center flex-shrink-0">
                    <div className="relative w-[300px] aspect-[9/16] rounded-sm overflow-hidden bg-black shadow-2xl shadow-black/40">
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
                            const currentDay = menuDays.find((d) => d.id === selectedDayId);
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

          <p className="text-center text-muted-foreground text-xs mt-12 opacity-40">
            * O cardápio pode sofrer alterações sem aviso prévio
          </p>

          <div className="text-center mt-10">
            <Link to="/cardapio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              Ver cardápio completo <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ DEPOIMENTOS — FULL WIDTH QUOTE ═══════════════ */}
      <section className="py-32 md:py-44 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative">
          {/* Giant decorative quote */}
          <div className="absolute -top-10 left-0 text-[180px] md:text-[250px] font-display font-bold text-primary/[0.04] leading-none select-none pointer-events-none">
            "
          </div>

          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">Depoimentos</p>
            </div>
          </ScrollReveal>

          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-2xl md:text-3xl lg:text-4xl text-foreground/90 leading-relaxed mb-10 italic font-display font-light">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{testimonials[activeTestimonial].name}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Line dots */}
          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-px transition-all duration-500 ${
                  i === activeTestimonial ? "w-10 bg-primary" : "w-5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ RESERVA — CLEAN FORM ═══════════════ */}
      <ReservaInline getSetting={getSetting} />
    </Layout>
  );
};

/* ── Reserva Inline Component ── */
const ReservaInline = ({ getSetting }: { getSetting: (key: string, fallback: string) => string }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", data: "", pessoas: "2", observacoes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  const reservaSchema = z.object({
    nome: z
      .string()
      .trim()
      .min(2, { message: "Informe seu nome completo." })
      .max(100, { message: "Nome deve ter no máximo 100 caracteres." }),
    telefone: z
      .string()
      .trim()
      .regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, {
        message: "Telefone inválido. Use o formato (96) 99999-9999.",
      }),
    data: z
      .string()
      .min(1, { message: "Selecione uma data." })
      .refine((v) => v >= today, { message: "A data não pode ser no passado." }),
    pessoas: z
      .string()
      .refine((v) => {
        const n = parseInt(v);
        return !isNaN(n) && n >= 1 && n <= 50;
      }, { message: "Informe entre 1 e 50 pessoas." }),
    observacoes: z.string().max(500).optional(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = reservaSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Verifique os campos destacados.");
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        nome: result.data.nome,
        telefone: result.data.telefone,
        data: result.data.data,
        horario: "12:00",
        pessoas: parseInt(result.data.pessoas) || 1,
        observacoes: (result.data.observacoes ?? "").trim(),
      });
      if (error) throw error;
      toast.success("Reserva enviada! Entraremos em contato em breve.");
      setSent(true);
    } catch {
      toast.error("Erro ao enviar reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${getSetting("whatsapp_numero", "5596991832460")}?text=${encodeURIComponent(
    `Olá! Gostaria de fazer uma reserva:\nNome: ${form.nome}\nTelefone: ${form.telefone}\nData: ${form.data}\nPessoas: ${form.pessoas}\nReserva válida até 12h${form.observacoes ? `\nObs: ${form.observacoes}` : ""}`
  )}`;

  const resetForm = () => {
    setForm({ nome: "", telefone: "", data: "", pessoas: "2", observacoes: "" });
    setSent(false);
  };

  return (
    <section id="reserva" className="py-32 md:py-44 px-4 bg-card/30">
      <div className="container mx-auto max-w-2xl">
        <SEO
          title="Reserva — Restaurante Macapaba | Macapá-AP"
          description="Reserve sua mesa no Restaurante Macapaba em Macapá. Gastronomia amazônica, ambiente acolhedor e atendimento personalizado."
        />
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">Reserva</p>
            <h2 className="text-display font-display font-bold leading-[0.95] mb-4">
              {getSetting("cta_titulo", "Sua mesa espera por você")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {getSetting("cta_subtitulo", "Reserve em segundos e viva uma experiência inesquecível em Macapá.")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="res-nome" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Nome *</Label>
                  <input
                    id="res-nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    maxLength={100}
                    className="input-underline"
                    placeholder="Seu nome"
                  />
                  {errors.nome && <p className="text-destructive text-xs mt-2">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="res-telefone" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Telefone *</Label>
                  <input
                    id="res-telefone"
                    type="tel"
                    inputMode="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    required
                    maxLength={20}
                    className="input-underline"
                    placeholder="(96) 99999-9999"
                  />
                  {errors.telefone && <p className="text-destructive text-xs mt-2">{errors.telefone}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="res-data" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Data *</Label>
                  <input
                    id="res-data"
                    type="date"
                    min={today}
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                    className="input-underline"
                  />
                  {errors.data && <p className="text-destructive text-xs mt-2">{errors.data}</p>}
                </div>
                <div>
                  <Label htmlFor="res-pessoas" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Nº Pessoas *</Label>
                  <input
                    id="res-pessoas"
                    type="number"
                    min="1"
                    max="50"
                    value={form.pessoas}
                    onChange={(e) => setForm({ ...form, pessoas: e.target.value })}
                    required
                    className="input-underline"
                  />
                  {errors.pessoas && <p className="text-destructive text-xs mt-2">{errors.pessoas}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 py-3 border-b border-primary/20">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">A reserva garante sua mesa até as <strong className="text-foreground">12h</strong>.</p>
              </div>

              <div>
                <Label htmlFor="res-obs" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Observações</Label>
                <textarea
                  id="res-obs"
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="input-underline resize-none"
                  placeholder="Alguma observação especial?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-fill-hover w-full"
              >
                {loading ? "Enviando..." : "Garantir minha mesa"}
              </button>

              <div className="text-center pt-4">
                <p className="text-muted-foreground/40 text-xs mb-4">ou</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                  <MessageCircle className="h-4 w-4" /> Reservar pelo WhatsApp
                </a>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-16 gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-2">Reserva Enviada!</h3>
                <p className="text-muted-foreground">Entraremos em contato para confirmar.</p>
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                <MessageCircle className="h-4 w-4" /> Confirmar pelo WhatsApp
              </a>
              <button onClick={resetForm} className="text-sm text-muted-foreground/50 hover:text-foreground transition-colors">
                Fazer nova reserva
              </button>
            </motion.div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Index;
