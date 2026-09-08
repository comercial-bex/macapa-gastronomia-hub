import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SweetPreview, { type SweetViewItem } from "@/components/menu/SweetPreview";

interface SweetCategory { id: string; nome: string; traducoes?: unknown }
interface SweetsGalleryProps {
  categories: SweetCategory[];
  items: SweetViewItem[];
  loading: boolean;
  error: boolean;
  labels: { all: string; clear: string; empty: string; loadError: string; noResults: string; photoSoon: string; search: string };
  localize: (record: SweetCategory | SweetViewItem, field: string) => string;
  locale: string;
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SweetsGallery = ({ categories, items, loading, error, labels, localize, locale }: SweetsGalleryProps) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const filtered = useMemo(() => items.filter((item) => {
    if (activeCategory !== "all" && item.category_id !== activeCategory) return false;
    const haystack = normalize(`${localize(item, "nome")} ${localize(item, "descricao")}`);
    return !query.trim() || haystack.includes(normalize(query.trim()));
  }), [activeCategory, items, localize, query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const category = categories.find((entry) => entry.id === selected?.category_id);
  const currencyLocale = locale === "pt-BR" ? "pt-BR" : locale;
  const price = selected?.preco == null ? undefined : new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "BRL" }).format(selected.preco);

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  if (loading) return <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true"><div className="h-80 animate-pulse rounded-lg bg-secondary" /><div className="mx-auto aspect-[9/16] w-full max-w-[280px] animate-pulse rounded-lg bg-secondary" /></div>;
  if (error) return <p role="alert" className="py-12 text-center text-destructive">{labels.loadError}</p>;
  if (items.length === 0) return <p className="py-12 text-center text-muted-foreground">{labels.empty}</p>;

  return <div className="space-y-6">
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} aria-label={labels.search} className="border-border bg-secondary/40 pl-9 pr-9" />
        {query && <Button type="button" variant="ghost" size="icon" onClick={() => setQuery("")} aria-label={labels.clear} className="absolute right-0 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></Button>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label={labels.search}>
        <Button size="sm" variant={activeCategory === "all" ? "default" : "outline"} onClick={() => setActiveCategory("all")}>{labels.all}</Button>
        {categories.map((entry) => <Button key={entry.id} size="sm" variant={activeCategory === entry.id ? "default" : "outline"} onClick={() => setActiveCategory(entry.id)}>{localize(entry, "nome")}</Button>)}
      </div>
    </div>
    {filtered.length === 0 ? <p className="py-12 text-center text-muted-foreground">{labels.noResults}</p> : (
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="md:order-2 md:sticky md:top-24"><SweetPreview item={selected} categoryName={category ? localize(category, "nome") : ""} name={selected ? localize(selected, "nome") : ""} description={selected ? localize(selected, "descricao") : ""} photoSoon={labels.photoSoon} formattedPrice={price} /></div>
        <div className="space-y-7 md:order-1">
          {categories.map((entry) => {
            const categoryItems = filtered.filter((item) => item.category_id === entry.id);
            if (!categoryItems.length) return null;
            return <section key={entry.id} aria-labelledby={`sweet-${entry.id}`}><h2 id={`sweet-${entry.id}`} className="mb-3 font-display text-xl font-bold text-primary">{localize(entry, "nome")}</h2><div className="space-y-1">
              {categoryItems.map((item) => <Button key={item.id} variant="ghost" aria-current={selected?.id === item.id ? "true" : undefined} onClick={() => setSelectedId(item.id)} onMouseEnter={() => setSelectedId(item.id)} onFocus={() => setSelectedId(item.id)} className={`h-auto w-full justify-start whitespace-normal border-l-4 px-4 py-3 text-left ${selected?.id === item.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary/70"}`}><UtensilsCrossed className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block font-medium text-foreground">{localize(item, "nome")}</span>{item.descricao && <span className="mt-1 block line-clamp-2 text-xs font-normal text-muted-foreground">{localize(item, "descricao")}</span>}</span>{item.badge && <Sparkles className="h-4 w-4 shrink-0 text-primary" />}{item.preco != null && <span className="shrink-0 text-sm font-semibold text-primary">{new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "BRL" }).format(item.preco)}</span>}</Button>)}
            </div></section>;
          })}
        </div>
      </div>
    )}
  </div>;
};

export default SweetsGallery;