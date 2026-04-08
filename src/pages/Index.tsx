import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import Layout from "@/components/Layout";
import AnimatedImage from "@/components/AnimatedImage";
import AnimatedCounter from "@/components/AnimatedCounter";
import SectionDivider from "@/components/SectionDivider";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useGsapScrollEffects } from "@/hooks/useGsapScrollEffects";
import {
  UtensilsCrossed, Users, Calendar, Fish, Beef, Drumstick, Shell, CookingPot, Wheat,
  Play, MessageCircle, ChevronDown, Star, Quote, MapPin, Clock,
  type LucideIcon
} from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

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

const specialties = [
  { title: "Culinária Amazônica", desc: "Sabores autênticos da floresta, peixes nobres e ingredientes regionais únicos.", image: pratoVariado },
  { title: "Grelhados Premium", desc: "Cortes selecionados preparados no ponto perfeito, com acompanhamentos artesanais.", image: garcomServindo },
  { title: "Sushi & Sashimi", desc: "Peças frescas preparadas por chefs especializados com técnica oriental refinada.", image: sushi },
];

const testimonials = [
  { name: "Ana Carolina M.", text: "Uma experiência gastronômica incomparável. O peixe amazônico é simplesmente divino. Ambiente elegante e atendimento impecável.", rating: 5 },
  { name: "Roberto S.", text: "Frequento o Macapabá desde a inauguração. Quase 30 anos de qualidade consistente — isso é raro. Minha família adora.", rating: 5 },
  { name: "Juliana P.", text: "O melhor restaurante de Macapá, sem dúvida. O buffet é variado, tudo fresco, e o sushi é espetacular. Recomendo demais!", rating: 5 },
  { name: "Carlos Eduardo F.", text: "Levei clientes de São Paulo e ficaram impressionados. O Macapabá honra a gastronomia do Amapá. Nota 10.", rating: 5 },
];

/* ── Word-by-word reveal ── */
const WordReveal = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + i * 0.08, ease: "easeOut" }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const Index = () => {
  const { getSetting } = useSiteSettings();
  const heroRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // GSAP scroll effects
  useGsapScrollEffects(pageRef);

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
      <div ref={pageRef}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative h-screen -mt-16 flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <video
            src="/videos/hero.mp4"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster={garcomServindo}
          />
        </motion.div>
        {/* Sophisticated overlay: radial + linear */}
        <div className="absolute inset-0 z-10" style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)"
        }} />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <img src={logoMacapaba} alt="Macapabá" className="h-20 md:h-32 mx-auto drop-shadow-2xl" />
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 text-white">
            <WordReveal text={`Sabor ${getSetting("hero_titulo", "e tradição em Macapá desde 1998").replace(/^Sabor\s*/, "")}`} delay={0.3} />
          </h1>

          {/* Decorative gold line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6 origin-center"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto font-light tracking-wide"
          >
            {getSetting("hero_subtitulo", "Uma casa feita de encontros, histórias e pratos que viram memória.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#reserva" onClick={(e) => { e.preventDefault(); document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" }); }}>
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary) / 0.4)", "0 0 0 12px hsl(var(--primary) / 0)", "0 0 0 0 hsl(var(--primary) / 0)"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="rounded-md inline-block"
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-8 active:scale-95 transition-transform">
                  Fazer Reserva
                </Button>
              </motion.div>
            </a>
            <Link to="/cardapio">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold uppercase tracking-wider px-8 hover:scale-105 active:scale-95 transition-transform">
                Ver Cardápio
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs uppercase tracking-[0.3em] font-light">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-primary/80" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ EXPERIENCE ═══════════════ */}
      <section className="py-28 md:py-36 px-4 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob" />

        <div className="container mx-auto">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
              {/* Text side */}
              <div className="relative">
                {/* Vertical gold accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent hidden lg:block" />
                <div className="lg:pl-8">
                  <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                    {getSetting("historia_subtitulo", "Desde 1998")}
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                    {getSetting("historia_titulo", "A História")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-10">
                    {getSetting("historia_texto", "Inaugurado em abril de 1998, o Restaurante Macapabá carrega uma história de dedicação à gastronomia regional. Com pratos que misturam sabores amazônicos e culinária nacional, nos tornamos referência em Macapá para quem busca uma experiência gastronômica completa.")}
                  </p>

                  {/* Stats with glassmorphism */}
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="glass-card rounded-xl p-6 text-center group hover:border-primary/30 transition-colors duration-500">
                      <UtensilsCrossed className="h-6 w-6 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-display text-3xl md:text-4xl font-bold">
                        <AnimatedCounter target={50} suffix="" />
                        <span className="text-primary">+</span>
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">Variedades</p>
                    </div>
                    <div className="glass-card rounded-xl p-6 text-center group hover:border-primary/30 transition-colors duration-500">
                      <Users className="h-6 w-6 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-display text-3xl md:text-4xl font-bold">
                        <AnimatedCounter target={100} suffix="" />
                        <span className="text-primary">+</span>
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">Capacidade</p>
                    </div>
                  </div>

                  <a href="#reserva" onClick={(e) => { e.preventDefault(); document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" }); }}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform">
                      Fazer Reserva
                    </Button>
                  </a>
                </div>
              </div>

              {/* Image side */}
              <div className="relative group">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                  <AnimatedImage
                    src={salaoRestaurante}
                    alt="Salão do Restaurante Macapabá"
                    className="w-full h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Floating accent frame */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/20 rounded-2xl -z-10" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ SPECIALTIES ═══════════════ */}
      <section className="py-28 md:py-36 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Especialidades</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Nossos Destaques</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Três pilares que definem a experiência Macapabá
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger>
            <div className="grid md:grid-cols-3 gap-6">
              {specialties.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                      <h3 className="font-display text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        {item.desc}
                      </p>
                    </div>
                    {/* Gold corner accent */}
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </StaggerItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ GALLERY ═══════════════ */}
      <section className="py-28 md:py-36 px-4 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob animation-delay-2000" />

        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Galeria</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Momentos & Sabores</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Uma coleção visual dos nossos melhores momentos
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger>
            {/* Asymmetric masonry grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]">
              {portfolioImages.map((img, i) => {
                const spans = [
                  "md:col-span-2 md:row-span-2",
                  "",
                  "",
                  "md:col-span-2",
                  "",
                  "",
                ];
                return (
                  <StaggerItem key={i} className={`${spans[i] || ""} relative rounded-xl overflow-hidden group cursor-pointer`}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-white text-sm font-medium">{img.alt}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
          </ScrollReveal>

          <div className="text-center mt-12">
            <Link to="/portfolio">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-wider font-semibold hover:scale-105 active:scale-95 transition-all">
                Ver Portfólio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ CARDÁPIO DA SEMANA ═══════════════ */}
      <section className="py-28 md:py-36 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Cardápio</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Cardápio da Semana</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Descubra os pratos especiais preparados com carinho para cada dia
              </p>
            </div>
          </ScrollReveal>

          {/* Elegant underline tabs */}
          <ScrollReveal>
            <div className="flex justify-center mb-14">
              <div className="inline-flex gap-1 p-1.5 rounded-full glass-card">
                {menuDays.map((day, i) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      selectedDayId === day.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {weekDayLabels[i] || day.dia_semana}
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
                    <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/40 border border-primary/10">
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

                  {/* Left: Dish list */}
                  <div className="flex-1 min-w-0">
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
                                ? "glass-card border-l-4 !border-l-primary shadow-sm"
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
                  </div>

                  {/* Right: 9:16 Media Viewer (Desktop) with gold frame */}
                  <div className="hidden md:flex items-start justify-center flex-shrink-0">
                    <div className="relative">
                      <div className="relative w-[300px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/40 border border-primary/15">
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
                      {/* Gold accent frame */}
                      <div className="absolute -bottom-3 -right-3 w-full h-full border border-primary/15 rounded-2xl -z-10" />
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

          <p className="text-center text-muted-foreground text-xs mt-8 italic opacity-60">
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

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-28 md:py-36 px-4 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-blob animation-delay-4000" />

        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Depoimentos</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">O Que Dizem</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                A satisfação dos nossos clientes é o nosso maior prêmio
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card rounded-2xl p-10 md:p-14 text-center relative"
                >
                  <Quote className="h-10 w-10 text-primary/30 mx-auto mb-6" />
                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 italic font-light">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="font-display text-lg font-semibold text-foreground">{testimonials[activeTestimonial].name}</p>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeTestimonial ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ RESERVA ═══════════════ */}
      <ReservaInline getSetting={getSetting} />
      </div>
    </Layout>
  );
};

/* ── Reserva Inline Component ── */
const ReservaInline = ({ getSetting }: { getSetting: (key: string, fallback: string) => string }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", data: "", pessoas: "2", observacoes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim() || !form.data) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        data: form.data,
        horario: "12:00",
        pessoas: parseInt(form.pessoas) || 1,
        observacoes: form.observacoes.trim(),
      });
      if (error) throw error;
      toast.success("Reserva enviada com sucesso! Entraremos em contato.");
      setSent(true);
    } catch {
      toast.error("Erro ao enviar reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${getSetting("whatsapp_numero", "5596981054789")}?text=${encodeURIComponent(
    `Olá! Gostaria de fazer uma reserva:\nNome: ${form.nome}\nTelefone: ${form.telefone}\nData: ${form.data}\nPessoas: ${form.pessoas}\nReserva válida até 12h${form.observacoes ? `\nObs: ${form.observacoes}` : ""}`
  )}`;

  const resetForm = () => {
    setForm({ nome: "", telefone: "", data: "", pessoas: "2", observacoes: "" });
    setSent(false);
  };

  return (
    <section id="reserva" className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob animation-delay-2000" />

      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Reserva</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{getSetting("cta_titulo", "Reserve sua mesa agora")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {getSetting("cta_subtitulo", "Garanta seu lugar para uma experiência gastronômica inesquecível.")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden glass-card max-w-5xl mx-auto shadow-2xl shadow-black/20">
            {/* Image with parallax feel */}
            <div className="relative h-64 lg:h-auto min-h-[400px] overflow-hidden group">
              <img
                src={salaoRestaurante}
                alt="Salão do Restaurante Macapabá"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
              {/* Floating info */}
              <div className="absolute bottom-6 left-6 z-10 hidden lg:block">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Macapá, AP</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Mesa garantida até 12h</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 md:p-10">
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="res-nome">Nome *</Label>
                      <Input id="res-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required maxLength={100} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                    <div>
                      <Label htmlFor="res-telefone">Telefone / WhatsApp *</Label>
                      <Input id="res-telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required maxLength={20} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="res-data">Data *</Label>
                      <Input id="res-data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                    <div>
                      <Label htmlFor="res-pessoas">Nº Pessoas *</Label>
                      <Input id="res-pessoas" type="number" min="1" max="50" value={form.pessoas} onChange={(e) => setForm({ ...form, pessoas: e.target.value })} required className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">A reserva garante sua mesa até as <strong className="text-foreground">12h</strong>. Após esse horário, a mesa será liberada para outros clientes.</p>
                  </div>
                  <div>
                    <Label htmlFor="res-obs">Observações</Label>
                    <Textarea id="res-obs" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} maxLength={500} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform">
                    {loading ? "Enviando..." : "Enviar Reserva"}
                  </Button>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-3">ou</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="outline" className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white gap-2 hover:scale-105 active:scale-95 transition-transform">
                        <MessageCircle className="h-4 w-4" /> Reservar pelo WhatsApp
                      </Button>
                    </a>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center py-8 gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-2">Reserva Enviada!</h3>
                    <p className="text-muted-foreground">Entraremos em contato para confirmar. Você também pode confirmar pelo WhatsApp:</p>
                  </div>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white gap-2 hover:scale-105 active:scale-95 transition-transform">
                      <MessageCircle className="h-4 w-4" /> Confirmar pelo WhatsApp
                    </Button>
                  </a>
                  <Button variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                    Fazer nova reserva
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Index;
