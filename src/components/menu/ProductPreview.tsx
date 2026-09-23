import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, UtensilsCrossed } from "lucide-react";

export interface ProductViewItem {
  id: string;
  nome: string;
  descricao?: string | null;
  imagem_url?: string | null;
  preco?: number | null;
  volume?: string | null;
  badge?: string | null;
  category_id: string;
  traducoes?: unknown;
}

interface ProductPreviewProps {
  item?: ProductViewItem;
  categoryName: string;
  name: string;
  description: string;
  photoSoon: string;
  formattedPrice?: string;
  compact?: boolean;
}

const ProductPreview = ({ item, categoryName, name, description, photoSoon, formattedPrice, compact }: ProductPreviewProps) => (
  <div className={`relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-secondary shadow-elegant ${compact ? "menu-compact-visual h-48" : "max-w-[280px] md:max-w-[320px] aspect-[9/16]"}`}>
    <AnimatePresence mode="wait">
      <motion.div
        key={item?.id ?? "empty"}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {item?.imagem_url ? (
          <img src={item.imagem_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-background px-8 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <UtensilsCrossed className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <p className="font-display text-xl font-bold text-foreground">{name}</p>
            <p className="mt-2 text-xs uppercase text-muted-foreground">{photoSoon}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-6">
          <p className="text-xs font-semibold uppercase text-primary">{categoryName}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 className="menu-editorial-title font-display text-2xl font-bold text-foreground leading-tight">{name}</h2>
            {formattedPrice && <span className="shrink-0 font-semibold text-primary">{formattedPrice}</span>}
          </div>
          {item?.volume && <p className="mt-1 text-xs text-muted-foreground">{item.volume}</p>}
          {description && <p className="mt-1 line-clamp-2 text-xs md:mt-2 md:line-clamp-3 md:text-sm text-foreground/80">{description}</p>}
          {item?.badge && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> {item.badge}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
);

export default ProductPreview;
