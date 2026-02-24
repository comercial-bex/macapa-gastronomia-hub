import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import pratoVariado from "@/assets/prato-variado.jpeg";
import sushi from "@/assets/sushi.jpeg";
import garcomServindo from "@/assets/garcom-servindo.jpeg";
import salaoRestaurante from "@/assets/salao-restaurante.jpeg";
import clientesRestaurante from "@/assets/clientes-restaurante.jpeg";
import foodDemo1 from "@/assets/food-demo-1.jpeg";

interface PortfolioItem {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  tipo: string;
  url: string | null;
  destaque: boolean;
  ordem: number;
}

const fallbackItems: PortfolioItem[] = [
  { id: "f1", titulo: "Prato Variado", descricao: "Diversidade de sabores", categoria: "Pratos", tipo: "imagem", url: pratoVariado, destaque: true, ordem: 0 },
  { id: "f2", titulo: "Sushi Especial", descricao: "Culinária japonesa artesanal", categoria: "Pratos", tipo: "imagem", url: sushi, destaque: false, ordem: 1 },
  { id: "f3", titulo: "Nosso Atendimento", descricao: "Excelência no serviço", categoria: "Ambiente", tipo: "imagem", url: garcomServindo, destaque: false, ordem: 2 },
  { id: "f4", titulo: "Salão Principal", descricao: "Ambiente acolhedor e elegante", categoria: "Ambiente", tipo: "imagem", url: salaoRestaurante, destaque: true, ordem: 3 },
  { id: "f5", titulo: "Nossos Clientes", descricao: "Momentos especiais", categoria: "Ambiente", tipo: "imagem", url: clientesRestaurante, destaque: false, ordem: 4 },
  { id: "f6", titulo: "Criação Gastronômica", descricao: "Arte na apresentação", categoria: "Pratos", tipo: "imagem", url: foodDemo1, destaque: false, ordem: 5 },
];

const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      if (data && data.length > 0) {
        setItems(data);
        const cats = [...new Set(data.map((item) => item.categoria))];
        setCategories(["Todos", ...cats]);
      } else {
        setItems(fallbackItems);
        const cats = [...new Set(fallbackItems.map((item) => item.categoria))];
        setCategories(["Todos", ...cats]);
        setIsFallback(true);
      }
    };
    fetchItems();
  }, []);

  const filtered = activeFilter === "Todos" ? items : items.filter((i) => i.categoria === activeFilter);

  return (
    <Layout>
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Galeria</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Nosso Portfólio</h1>
              {isFallback && (
                <p className="text-muted-foreground text-sm mt-4">Adicione itens pelo painel administrativo para personalizar o portfólio.</p>
              )}
            </div>
          </ScrollReveal>

          {categories.length > 1 && (
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(cat)}
                    className={activeFilter === cat ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <StaggerItem key={item.id}>
                <motion.div
                  className="aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer group relative"
                  onClick={() => setLightbox(item)}
                  whileHover={{ rotateY: 3, rotateX: -2, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  style={{ perspective: 800 }}
                >
                  {item.url ? (
                    item.tipo === "video" ? (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">{item.titulo}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-sm font-semibold">{item.titulo}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </ScrollReveal>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-20">Nenhum item encontrado no portfólio.</p>
          )}
        </div>
      </section>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border-border p-2">
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 z-50 text-foreground hover:text-primary">
            <X className="h-6 w-6" />
          </button>
          {lightbox && (
            <div>
              {lightbox.tipo === "video" && lightbox.url ? (
                <video src={lightbox.url} controls className="w-full rounded-lg" />
              ) : lightbox.url ? (
                <img src={lightbox.url} alt={lightbox.titulo} className="w-full rounded-lg" />
              ) : null}
              <div className="p-4">
                <h3 className="font-display text-xl font-bold">{lightbox.titulo}</h3>
                {lightbox.descricao && <p className="text-muted-foreground text-sm mt-1">{lightbox.descricao}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Portfolio;
