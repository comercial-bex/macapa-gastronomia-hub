import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface MobileDishPreviewProps {
  item?: { id: string; imagem_url: string | null; tipo_midia: string; badge?: string | null; disponivel_de?: string | null; disponivel_ate?: string | null };
  name: string;
  description: string;
}

const MobileDishPreview = ({ item, name, description }: MobileDishPreviewProps) => {
  const reducedMotion = useReducedMotion();
  return <div className="md:hidden">
    {item?.imagem_url && <div className="relative h-48 overflow-hidden rounded-md border border-border bg-secondary">
      <AnimatePresence mode="wait">
        <motion.div key={item?.id ?? "none"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.22 }} className="absolute inset-0">
           {item.tipo_midia === "video"
            ? <video src={item.imagem_url} className="h-full w-full object-cover" autoPlay={!reducedMotion} muted loop playsInline />
             : <img src={item.imagem_url} alt={name} className="h-full w-full object-cover" />}
        </motion.div>
      </AnimatePresence>
    </div>}
    {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
    {(item?.badge || item?.disponivel_de || item?.disponivel_ate) && <div className="mt-2 text-xs text-muted-foreground">
      {item?.badge && <span className="mr-2 text-primary">{item.badge}</span>}
      {(item?.disponivel_de || item?.disponivel_ate) && <span>{item.disponivel_de?.slice(0, 5)}{item.disponivel_ate ? `–${item.disponivel_ate.slice(0, 5)}` : ""}</span>}
    </div>}
  </div>;
};

export default MobileDishPreview;