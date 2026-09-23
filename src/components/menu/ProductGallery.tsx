import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductPreview, { type ProductViewItem } from "@/components/menu/ProductPreview";

interface ProductCategory { id: string; nome: string; traducoes?: unknown }
interface ProductGalleryProps {
  categories: ProductCategory[];
  items: ProductViewItem[];
  loading: boolean;
  error: boolean;
  labels: { all: string; clear: string; empty: string; loadError: string; noResults: string; photoSoon: string; search: string };
  localize: (record: ProductCategory | ProductViewItem, field: string) => string;
  locale: string;
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const ProductGallery = ({ categories, items, loading, error, labels, localize, locale }: ProductGalleryProps) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const filtered = useMemo(() => items.filter((item) => {
    if (activeCategory !== "all" && item.category_id !== activeCategory) return false;
    const haystack = normalize(`${localize(item, "nome")} ${localize(item, "descricao")} ${item.volume ?? ""}`);
    return !query.trim() || haystack.includes(normalize(query.trim()));
  }), [activeCategory, items, localize, query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const category = categories.find((entry) => entry.id === selected?.category_id);
  const currencyLocale = locale === "pt-BR" ? "pt-BR" : locale;
  const money = (value: number) => new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "BRL" }).format(value);
  const price = selected?.preco == null ? undefined : money(selected.preco);

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  if (loading) return <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true"><div className="h-80 animate-pulse rounded-lg bg-secondary" /><div className="mx-auto aspect-[9/16] w-full max-w-[280px] animate-pulse rounded-lg bg-secondary" /></div>;
  if (error) return <p role="alert" className="py-12 text-center text-destructive">{labels.loadError}</p>;
  if (items.length === 0) return <p className="py-12 text-center text-muted-foreground">{labels.empty}</p>;

  const chips = <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={labels.all}>
    <Button size="sm" variant={activeCategory === "all" ? "default" : "outline"} onClick={() => setActiveCategory("all")} className="shrink-0 rounded-full">{labels.all}</Button>
    {categories.map((entry) => <Button key={entry.id} size="sm" variant={activeCategory === entry.id ? "default" : "outline"} onClick={() => setActiveCategory(entry.id)} className="shrink-0 rounded-full">{localize(entry, "nome")}</Button>)}
  </div>;
  const preview = <ProductPreview item={selected} categoryName={category ? localize(category, "nome") : ""} name={selected ? localize(selected, "nome") : ""} description={selected ? localize(selected, "descricao") : ""} photoSoon={labels.photoSoon} formattedPrice={price} />;

  return <div className="space-y-5 md:space-y-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} aria-label={labels.search} className="border-border bg-secondary/40 pl-9 pr-9 max-md:h-12" />
      {query && <Button type="button" variant="ghost" size="icon" onClick={() => setQuery("")} aria-label={labels.clear} className="absolute right-0 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></Button>}
    </div>
    {filtered.length === 0 ? <p className="py-12 text-center text-muted-foreground">{labels.noResults}</p> : (<>
      <div className="space-y-4 md:hidden">
        <ProductPreview compact item={selected} categoryName={category ? localize(category, "nome") : ""} name={selected ? localize(selected, "nome") : ""} description={selected ? localize(selected, "descricao") : ""} photoSoon={labels.photoSoon} formattedPrice={price} />
        {chips}
      </div>
      <div className="hidden md:block">{chips}</div>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="hidden md:order-2 md:block md:sticky md:top-24">{preview}</div>
        <div className="space-y-7 md:order-1">
          {categories.map((entry) => {
            const categoryItems = filtered.filter((item) => item.category_id === entry.id);
            if (!categoryItems.length) return null;
            return <section key={entry.id} aria-labelledby={`product-${entry.id}`}><h2 id={`product-${entry.id}`} className="menu-editorial-title mb-3 border-b border-border pb-2 font-display text-2xl font-bold text-foreground md:border-0 md:pb-0 md:text-xl md:italic md:text-primary">{localize(entry, "nome")}</h2><div className="space-y-2 md:space-y-1">
              {categoryItems.map((item) => <Button key={item.id} variant="ghost" aria-current={selected?.id === item.id ? "true" : undefined} onClick={() => setSelectedId(item.id)} onMouseEnter={() => setSelectedId(item.id)} onFocus={() => setSelectedId(item.id)} className={`h-auto w-full items-center justify-start gap-3 whitespace-normal border-l-4 px-2 py-3 text-left md:items-start md:px-4 ${selected?.id === item.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary/70"}`}>
                <span className="order-first flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary md:order-last md:h-14 md:w-14">
                  {item.imagem_url ? <img src={item.imagem_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : <UtensilsCrossed className="h-5 w-5 text-primary/50" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="menu-editorial-title min-w-0 font-medium text-foreground max-md:text-xl max-md:leading-tight">{localize(item, "nome")}{item.volume && <span className="ml-1 text-xs font-normal text-muted-foreground">({item.volume})</span>}{item.badge && <Sparkles className="ml-1 inline h-3.5 w-3.5 text-primary" aria-hidden="true" />}</span>
                    {item.preco != null && <span className="shrink-0 text-sm font-semibold text-primary">{money(item.preco)}</span>}
                  </span>
                  {item.descricao && <span className="mt-1 block line-clamp-2 text-xs font-normal text-muted-foreground">{localize(item, "descricao")}</span>}
                </span>
              </Button>)}
            </div></section>;
          })}
        </div>
      </div>
    </>)}
  </div>;
};

export default ProductGallery;
