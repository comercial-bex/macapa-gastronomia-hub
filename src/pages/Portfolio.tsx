import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useI18n } from "@/lib/i18n";

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
  categoria_id?: string | null;
  tipo: string;
  url: string | null;
  destaque: boolean;
  ordem: number;
}

/** Categoria do domínio compartilhado (content_categories, escopo portfolio). */
interface CategoryOption {
  id: string;
  nome: string;
  traducoes?: unknown;
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
  const { t, tRecord } = useI18n();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [activeFilter, setActiveFilter] = useState("__all__");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      // Os filtros vêm do domínio (content_categories), não mais de
      // Set(map(categoria)) sobre os itens: derivar do texto fazia cada typo
      // do admin virar um filtro-fantasma nesta página.
      const [itemsRes, catsRes] = await Promise.all([
        supabase.from("portfolio_items").select("*").eq("ativo", true).order("ordem"),
        supabase
          .from("content_categories")
          .select("id, nome, traducoes")
          .eq("escopo", "portfolio")
          .eq("ativo", true)
          .order("ordem"),
      ]);

      const data = itemsRes.data ?? [];
      if (data.length > 0) {
        setItems(data as unknown as PortfolioItem[]);
        const dominio = (catsRes.data ?? []) as unknown as CategoryOption[];
        if (catsRes.error || dominio.length === 0) {
          // A tabela de domínio pode ainda não existir (migration não
          // aplicada) ou estar vazia. Nesse caso volta a derivar do texto
          // dos itens: perde a proteção contra typo, mas é melhor que a
          // página ficar sem nenhum filtro.
          const nomes = [...new Set(data.map((i) => (i as { categoria: string }).categoria).filter(Boolean))];
          setCategories(nomes.map((nome) => ({ id: nome, nome })));
        } else {
          // Só oferece filtro que tem item — categoria cadastrada e vazia
          // renderizaria um chip que não leva a nada.
          const usadas = new Set(data.map((i) => (i as { categoria_id?: string | null }).categoria_id).filter(Boolean));
          const comItens = dominio.filter((c) => usadas.has(c.id));
          // Itens antigos ainda sem categoria_id: mantém os chips de texto
          // para não sumir com filtro que hoje funciona.
          const semVinculo = [...new Set(
            data.filter((i) => !(i as { categoria_id?: string | null }).categoria_id)
                .map((i) => (i as { categoria: string }).categoria).filter(Boolean),
          )];
          setCategories([...comItens, ...semVinculo.map((nome) => ({ id: nome, nome }))]);
        }
      } else {
        setItems(fallbackItems);
        // O fallback é conteúdo de demonstração em código, sem vínculo no banco.
        const nomes = [...new Set(fallbackItems.map((i) => i.categoria))];
        setCategories(nomes.map((nome) => ({ id: nome, nome })));
        setIsFallback(true);
      }
    };
    fetchItems();
  }, []);

  const filtered =
    activeFilter === "__all__"
      ? items
      : items.filter((i) =>
          // Casa por id no caminho normal; pelo texto no fallback e em itens
          // antigos que ainda não foram revinculados no admin.
          i.categoria_id ? i.categoria_id === activeFilter : i.categoria === activeFilter,
        );

  return (
    <Layout>
      <SEO
        title={t("seo.portfolio_title")}
        description={t("seo.portfolio_desc")}
      />
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t("portfolio.eyebrow")}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">{t("portfolio.title")}</h1>
              {isFallback && (
                <p className="text-muted-foreground text-sm mt-4">{t("portfolio.hint")}</p>
              )}
            </div>
          </ScrollReveal>

          {categories.length > 0 && (
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {[{ id: "__all__", nome: t("portfolio.all") }, ...categories].map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeFilter === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(cat.id)}
                    className={activeFilter === cat.id ? "bg-primary text-primary-foreground" : "border-border hover:border-primary hover:text-primary"}
                  >
                    {cat.id === "__all__" ? cat.nome : tRecord(cat, "nome") || cat.nome}
                  </Button>
                ))}
              </div>
            </ScrollReveal>
          )}

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
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
                      <img src={item.url} alt={tRecord(item, "titulo")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">{tRecord(item, "titulo")}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-sm font-semibold">{tRecord(item, "titulo")}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-20">{t("portfolio.empty")}</p>
          )}
        </div>
      </section>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border-border p-2">
          <button onClick={() => setLightbox(null)} aria-label={t("portfolio.close")} className="absolute top-4 right-4 z-50 text-foreground hover:text-primary">
            <X className="h-6 w-6" />
          </button>
          {lightbox && (
            <div>
              {lightbox.tipo === "video" && lightbox.url ? (
                <video src={lightbox.url} controls className="w-full rounded-lg" />
              ) : lightbox.url ? (
                <img src={lightbox.url} alt={tRecord(lightbox, "titulo")} className="w-full rounded-lg" />
              ) : null}
              <div className="p-4">
                <h2 className="font-display text-xl font-bold">{tRecord(lightbox, "titulo")}</h2>
                {lightbox.descricao && <p className="text-muted-foreground text-sm mt-1">{tRecord(lightbox, "descricao")}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Portfolio;
