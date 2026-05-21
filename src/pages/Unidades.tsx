import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { MapPin, Phone, Clock, Star, Navigation, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

interface Unit {
  id: string;
  nome: string;
  endereco: string;
  telefone: string | null;
  horarios: string | null;
  maps_url: string | null;
  principal: boolean;
  imagem_url: string | null;
}

const Unidades = () => {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("units").select("*").eq("ativo", true);
      if (data) setUnits((data as any).sort((a: any, b: any) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0)));
    };
    fetch();
  }, []);

  const getGoogleMapsUrl = (unit: Unit) => {
    if (unit.maps_url) return unit.maps_url;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(unit.endereco)}`;
  };

  const getWazeUrl = (unit: Unit) => {
    return `https://waze.com/ul?q=${encodeURIComponent(unit.endereco)}&navigate=yes`;
  };

  return (
    <Layout>
      <SEO
        title="Unidades — Restaurante Macapaba | Endereços em Macapá"
        description="Encontre as unidades do Restaurante Macapaba em Macapá-AP: endereços, telefones, horários de funcionamento e como chegar."
      />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Onde Estamos</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Nossas Unidades</h1>
            </div>
          </ScrollReveal>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-8"
          >
            {units.map((unit) => (
              <StaggerItem key={unit.id}>
                <motion.div
                  className={`bg-card rounded-xl overflow-hidden border ${unit.principal ? "border-primary" : "border-border"} relative transition-shadow duration-300`}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px -8px hsl(42 65% 58% / 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  {unit.imagem_url && (
                    <div className="w-full h-48 md:h-56 overflow-hidden">
                      <img
                        src={unit.imagem_url}
                        alt={unit.nome}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    {unit.principal && (
                      <div className="flex items-center gap-1 text-primary text-xs font-semibold uppercase mb-3">
                        <Star className="h-4 w-4 fill-primary" /> Principal
                      </div>
                    )}
                    <h3 className="font-display text-2xl font-bold mb-4">{unit.nome}</h3>
                    <div className="space-y-3 text-muted-foreground text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{unit.endereco}</span>
                      </div>
                      {unit.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                          <a href={`tel:${unit.telefone}`} className="hover:text-primary transition-colors">{unit.telefone}</a>
                        </div>
                      )}
                      {unit.horarios && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{unit.horarios}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a href={getGoogleMapsUrl(unit)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                          <Map className="h-4 w-4" /> Google Maps
                        </Button>
                      </a>
                      <a href={getWazeUrl(unit)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                          <Navigation className="h-4 w-4" /> Waze
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>

          {units.length === 0 && (
            <p className="text-center text-muted-foreground py-20">Nenhuma unidade cadastrada.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Unidades;
