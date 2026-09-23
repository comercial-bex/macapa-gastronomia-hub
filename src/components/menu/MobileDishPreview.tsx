import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link as LinkIcon, Share2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDishPreviewProps {
  item?: { id: string; imagem_url: string | null; tipo_midia: string; badge?: string | null; disponivel_de?: string | null; disponivel_ate?: string | null };
  name: string;
  description: string;
  day: string;
  photoSoon: string;
  shareLabel: string;
  linkLabel: string;
  onShare: () => void;
  onCopy: () => void;
}

const MobileDishPreview = ({ item, name, description, day, photoSoon, shareLabel, linkLabel, onShare, onCopy }: MobileDishPreviewProps) => {
  const reducedMotion = useReducedMotion();
  return <div className="md:hidden">
    <div className="relative h-48 overflow-hidden rounded-lg border border-border bg-secondary">
      <AnimatePresence mode="wait">
        <motion.div key={item?.id ?? "none"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="absolute inset-0">
          {item?.imagem_url ? (item.tipo_midia === "video"
            ? <video src={item.imagem_url} className="h-full w-full object-cover" autoPlay={!reducedMotion} muted loop playsInline />
            : <img src={item.imagem_url} alt={name} className="h-full w-full object-cover" />)
            : <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground"><UtensilsCrossed className="h-8 w-8 text-primary" aria-hidden="true" /><span className="text-xs">{photoSoon}</span></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <span className="text-xs font-medium text-primary">{day}</span>
            <h2 className="menu-editorial-title text-2xl font-bold leading-tight text-foreground">{name}</h2>
            {description && <p className="line-clamp-2 text-xs text-foreground/90">{description}</p>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2">
      <div className="min-w-0 text-xs text-muted-foreground">
        {item?.badge && <span className="mr-2 text-primary">{item.badge}</span>}
        {(item?.disponivel_de || item?.disponivel_ate) && <span>{item.disponivel_de?.slice(0, 5)}{item.disponivel_ate ? `–${item.disponivel_ate.slice(0, 5)}` : ""}</span>}
      </div>
      <div className="flex shrink-0">
        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onShare} aria-label={shareLabel} title={shareLabel}><Share2 className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onCopy} aria-label={linkLabel} title={linkLabel}><LinkIcon className="h-4 w-4" /></Button>
      </div>
    </div>
  </div>;
};

export default MobileDishPreview;