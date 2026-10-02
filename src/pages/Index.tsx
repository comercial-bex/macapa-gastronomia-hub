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
  MessageCircle, ChevronDown, ChevronLeft, ChevronRight, Star, Quote, MapPin, Clock, ArrowRight,
  type LucideIcon
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import ReservaForm from "@/components/ReservaForm";
import { z } from "zod";
import { Award, Leaf, Heart, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

 import pratoVariado from "@/assets/prato-variado.jpg";
 import sushi from "@/assets/sushi.jpg";
 import garcomServindo from "@/assets/garcom-servindo.jpg";
 import clientesRestaurante from "@/assets/clientes-restaurante.jpg";
import salaoRestaurante from "@/assets/salao-restaurante.jpg";

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

const galleryImages = [
  { src: pratoVariado, altKey: "home.alt_g1" },
  { src: sushi, altKey: "home.alt_g2" },
  { src: garcomServindo, altKey: "home.alt_g3" },
  { src: clientesRestaurante, altKey: "home.alt_g4" },
  { src: salaoRestaurante, altKey: "home.alt_g5" },
  { src: pratoVariado, altKey: "home.alt_g6" },
] as const;

const specialtyDefs = [
  { titleKey: "home.spec1_title", descKey: "home.spec1_desc", image: pratoVariado },
  { titleKey: "home.spec2_title", descKey: "home.spec2_desc", image: garcomServindo },
  { titleKey: "home.spec3_title", descKey: "home.spec3_desc", image: sushi },
] as const;

const testimonialDefs = [
  { name: "Ana Carolina M.", textKey: "home.t1_text", rating: 5 },
  { name: "Roberto S.", textKey: "home.t2_text", rating: 5 },
  { name: "Juliana P.", textKey: "home.t3_text", rating: 5 },
  { name: "Carlos Eduardo F.", textKey: "home.t4_text", rating: 5 },
] as const;

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
const InfiniteMarquee = () => {
  const { t } = useI18n();
  const marqueeText = t("home.marquee");
  return (
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
};

/* ── Horizontal Carousel for Specialties ── */
const HorizontalScrollSection = ({ specialties: items }: { specialties: { title: string; desc: string; image: string }[] }) => {
  const { t } = useI18n();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); scrollPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); scrollNext(); }
  };

  return (
    <section className="relative">
      <div className="overflow-hidden flex flex-col">
        <div className="container mx-auto px-4 pt-20 pb-10 flex-shrink-0">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">{t("home.spec_eyebrow")}</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95]">{t("home.spec_title_1")}<br />{t("home.spec_title_2")}</h2>
            </div>
            <Link to="/cardapio" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              {t("home.see_menu")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div
          className="relative px-4 pb-12"
          role="region"
          aria-roledescription="carousel"
          aria-label={t("home.spec_title_1") + " " + t("home.spec_title_2")}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
            {items.map((item, i) => (
              <div key={i} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-0 pr-6 last:pr-0">
                <div className="relative h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden rounded-sm group cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{item.title}</h2>
                    <p className="text-white/50 text-sm md:text-base max-w-sm leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label={t("a11y.carousel_prev")}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-md border border-border/60 text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label={t("a11y.carousel_next")}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-md border border-border/60 text-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { getSetting } = useSiteSettings();
  const { t, tRecord, tDay, tContent } = useI18n();
  const specialties = specialtyDefs.map((s) => ({ title: t(s.titleKey), desc: t(s.descKey), image: s.image }));
  const testimonials = testimonialDefs.map((tt) => ({ name: tt.name, text: t(tt.textKey), rating: tt.rating }));
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
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonialDefs.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: days } = await supabase.from("weekly_menu_days").select("*").eq("ativo", true).order("ordem");
      const { data: items } = await supabase.from("weekly_menu_items").select("*").eq("ativo", true).eq("esgotado", false).order("ordem");
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
        title={t("seo.home_title")}
        description={t("seo.home_desc")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Restaurante Macapaba",
          servesCuisine: ["Amazonian", "Brazilian", "Sushi"],
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Macapá",
            addressRegion: "AP",
            addressCountry: "BR",
          },
          url: "https://restaurantemacapaba.com.br",
          telephone: "+5596981054789",
        }}
      />
      <ScrollProgress />

      {/* ═══════════════ HERO — CINEMATIC ═══════════════ */}
      <section ref={heroRef} className="relative h-screen -mt-16 flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <video
            src="/videos/hero.mp4"
            autoPlay muted loop playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            poster={garcomServindo}
          />
        </motion.div>
        <div className="absolute inset-0 z-10 bg-black/50" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.img
            src={logoMacapaba}
             alt={t("a11y.logo_home")}
            fetchPriority="high"
            decoding="async"
            width={320}
            height={80}
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
               {tContent("home.hero_title", getSetting("hero_titulo", ""))}
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
            {tContent("home.hero_subtitle", getSetting("hero_subtitulo", ""))}
          </motion.p>
        </motion.div>

        {/* Scroll line indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-light">{t("home.scroll")}</span>
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
                  {tContent("home.history_eyebrow", getSetting("historia_subtitulo", ""))}
                </motion.p>

                <h2 className="text-display font-display font-bold leading-[0.95] mb-10">
                  {tContent("home.history_title", getSetting("historia_titulo", ""))}
                </h2>

                <p className="text-muted-foreground leading-relaxed text-lg mb-16 max-w-md">
                  {tContent("home.history_text", getSetting("historia_texto", ""))}
                </p>

                {/* Big numbers — display style */}
                <div className="flex gap-16 mb-12">
                  <div>
                    <p className="font-display text-6xl md:text-8xl font-bold text-primary leading-none">
                      <AnimatedCounter target={17} suffix="" />
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">{t("home.years")}</p>
                  </div>
                  <div>
                    <p className="font-display text-6xl md:text-8xl font-bold text-primary leading-none">
                      <AnimatedCounter target={50} suffix="" />
                      <span className="text-primary/60">+</span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wider">{t("home.dishes")}</p>
                  </div>
                </div>

                {/* Highlights — diferenciais */}
                <div className="grid sm:grid-cols-3 gap-6 pt-10 border-t border-border/40">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">{t("home.badge_since")}</p>
                      <p className="text-muted-foreground text-xs mt-1">{t("home.badge_since_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">{t("home.badge_region")}</p>
                      <p className="text-muted-foreground text-xs mt-1">{t("home.badge_region_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-semibold uppercase tracking-wider">{t("home.badge_handmade")}</p>
                      <p className="text-muted-foreground text-xs mt-1">{t("home.badge_handmade_desc")}</p>
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
                     alt={t("home.alt_hall")}
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
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">{t("home.gallery_eyebrow")}</p>
              <h2 className="text-display font-display font-bold leading-[0.95]">{t("home.gallery_title")}</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto">
            {galleryImages.map((img, i) => (
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
                  alt={t(img.altKey)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              {t("home.see_portfolio")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CARDÁPIO DA SEMANA — MINIMAL ═══════════════ */}
      <section className="py-32 md:py-44 px-4 bg-card/50">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">{t("home.week_eyebrow")}</p>
              <h2 className="text-display font-display font-bold leading-[0.95] mb-4">{t("home.week_title")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("home.week_subtitle")}
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
                    {tDay(day.dia_semana, true)}
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
                            const mediaUrl = item.imagem_url;
                            const mediaTipo = item.tipo_midia;
                            const currentDay = menuDays.find((d) => d.id === selectedDayId);
                            const DishIcon = getDishIcon(item.prato);
                            if (!mediaUrl) {
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-background">
                                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.25),_transparent_60%)]" />
                                  <div className="relative flex flex-col items-center text-center px-6">
                                    <div className="mb-3 p-4 rounded-full bg-primary/10 border border-primary/20">
                                      <DishIcon className="h-10 w-10 text-primary" />
                                    </div>
                                    <p className="text-primary text-[10px] font-semibold uppercase tracking-widest mb-1">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                    <h3 className="font-display text-lg font-bold text-foreground/90">{tRecord(item, "prato")}</h3>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <>
                                {mediaTipo === 'video' ? (
                                  <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                  <img src={mediaUrl} alt={tRecord(item, "prato")} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                  <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                  <h3 className="font-display text-xl font-bold text-white">{tRecord(item, "prato")}</h3>
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
                            <span className="text-sm font-medium">{tRecord(item, "prato")}</span>
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
                            const mediaUrl = item.imagem_url;
                            const mediaTipo = item.tipo_midia;
                            const currentDay = menuDays.find((d) => d.id === selectedDayId);
                            const DishIcon = getDishIcon(item.prato);
                            if (!mediaUrl) {
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-background">
                                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.25),_transparent_60%)]" />
                                  <div className="relative flex flex-col items-center text-center px-6">
                                    <div className="mb-3 p-4 rounded-full bg-primary/10 border border-primary/20">
                                      <DishIcon className="h-10 w-10 text-primary" />
                                    </div>
                                    <p className="text-primary text-[10px] font-semibold uppercase tracking-widest mb-1">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                    <h3 className="font-display text-2xl font-bold text-foreground/90">{tRecord(item, "prato")}</h3>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <>
                                {mediaTipo === 'video' ? (
                                  <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                  <img src={mediaUrl} alt={tRecord(item, "prato")} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                  <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">{currentDay ? tDay(currentDay.dia_semana) : ""}</p>
                                  <h3 className="font-display text-2xl font-bold text-white">{tRecord(item, "prato")}</h3>
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
                  <p>{t("home.week_empty")}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-muted-foreground text-xs mt-12 opacity-40">
            {t("home.week_disclaimer")}
          </p>

          <div className="text-center mt-10">
            <Link to="/cardapio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              {t("home.see_full_menu")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">{t("home.testimonials_eyebrow")}</p>
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
                aria-label={t("home.testimonial_aria", { i: i + 1, n: testimonials.length })}
                className={`h-px transition-all duration-500 ${
                  i === activeTestimonial ? "w-10 bg-primary" : "w-5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ RESERVA — CLEAN FORM ═══════════════ */}
      <ReservaForm getSetting={getSetting} />
    </Layout>
  );
};

/* ── Reserva Inline Component ── */

export default Index;
