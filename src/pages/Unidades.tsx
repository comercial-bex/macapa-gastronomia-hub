import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { MapPin, Phone, Clock, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Unit {
  id: string;
  nome: string;
  endereco: string;
  telefone: string | null;
  horarios: string | null;
  maps_url: string | null;
  principal: boolean;
}

const Unidades = () => {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("units").select("*").eq("ativo", true);
      if (data) setUnits(data.sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0)));
    };
    fetch();
  }, []);

  return (
    <Layout>
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Onde Estamos</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Nossas Unidades</h1>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger className="space-y-6">
            {units.map((unit) => (
              <StaggerItem key={unit.id}>
                <motion.div
                  className={`bg-card rounded-lg p-8 border ${unit.principal ? "border-primary" : "border-border"} relative transition-shadow duration-300`}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px -8px hsl(42 65% 58% / 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  {unit.principal && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-primary text-xs font-semibold uppercase">
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
                        <span>{unit.telefone}</span>
                      </div>
                    )}
                    {unit.horarios && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{unit.horarios}</span>
                      </div>
                    )}
                  </div>
                  {unit.maps_url && (
                    <a href={unit.maps_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        <ExternalLink className="h-4 w-4 mr-2" /> Como chegar
                      </Button>
                    </a>
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </ScrollReveal>

          {units.length === 0 && (
            <p className="text-center text-muted-foreground py-20">Nenhuma unidade cadastrada.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Unidades;
