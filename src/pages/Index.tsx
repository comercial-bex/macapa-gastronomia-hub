import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { UtensilsCrossed, Users, Calendar } from "lucide-react";

import pratoVariado from "@/assets/prato-variado.jpeg";
import sushi from "@/assets/sushi.jpeg";
import garcomServindo from "@/assets/garcom-servindo.jpeg";
import clientesRestaurante from "@/assets/clientes-restaurante.jpeg";
import salaoRestaurante from "@/assets/salao-restaurante.jpeg";

const weekDays = [
  { label: "Seg", day: "Segunda-feira" },
  { label: "Ter", day: "Terça-feira" },
  { label: "Qua", day: "Quarta-feira" },
  { label: "Qui", day: "Quinta-feira" },
  { label: "Sex", day: "Sexta-feira" },
  { label: "Sáb", day: "Sábado" },
  { label: "Dom", day: "Domingo" },
];

const portfolioImages = [
  { src: pratoVariado, alt: "Prato variado com sushi, carne e arroz" },
  { src: sushi, alt: "Sushi variado" },
  { src: garcomServindo, alt: "Garçom servindo no restaurante" },
  { src: clientesRestaurante, alt: "Clientes no restaurante" },
  { src: salaoRestaurante, alt: "Salão do restaurante" },
  { src: pratoVariado, alt: "Prato especial do Macapabá" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Video background (placeholder until video is provided) */}
        <img
          src={garcomServindo}
          alt="Restaurante Macapabá"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay 60% */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          >
            Macapabá — <span className="text-primary">Sabor</span> e tradição em Macapá desde 1998
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
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-8">
                Fazer Reserva
              </Button>
            </Link>
            <Link to="/cardapio">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold uppercase tracking-wider px-8">
                Ver Cardápio
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

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
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider">
                    Fazer Reserva
                  </Button>
                </Link>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden aspect-video">
                  <img
                    src={salaoRestaurante}
                    alt="Salão do Restaurante Macapabá"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <UtensilsCrossed className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="font-display text-4xl font-bold">50<span className="text-primary">+</span></p>
                    <p className="text-muted-foreground text-sm mt-1">Variedades</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-8 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="font-display text-4xl font-bold">100<span className="text-primary">+</span></p>
                    <p className="text-muted-foreground text-sm mt-1">Capacidade</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-24 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Nosso Portfólio</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Momentos & Sabores</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolioImages.map((img, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="aspect-square bg-secondary rounded-lg overflow-hidden group cursor-pointer relative">
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 z-10" />
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/portfolio">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-wider font-semibold">
                Ver Portfólio Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cardápio da Semana */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Cardápio</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Cardápio da Semana</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-3">
              {weekDays.map((day) => (
                <Link key={day.day} to={`/cardapio?dia=${encodeURIComponent(day.day)}`}>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 uppercase tracking-wider text-xs font-semibold px-6 py-5"
                  >
                    {day.label}
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

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
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider px-10">
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
