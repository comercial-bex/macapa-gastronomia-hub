import { AlertTriangle } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

/**
 * Alérgenos declarados de um prato ou bebida.
 *
 * O campo é texto livre no admin ("glúten, lactose, frutos do mar"), então
 * normalizamos para traduzir os termos mais comuns. Valor desconhecido é
 * exibido cru — nunca omitido: esconder alérgeno é risco à saúde do cliente.
 */
const ALLERGEN_KEYS: Record<string, TranslationKey> = {
  "gluten": "allergen.gluten",
  "trigo": "allergen.gluten",
  "lactose": "allergen.lactose",
  "leite": "allergen.lactose",
  "frutos do mar": "allergen.seafood",
  "frutos-do-mar": "allergen.seafood",
  "crustaceos": "allergen.seafood",
  "camarao": "allergen.seafood",
  "peixe": "allergen.fish",
  "ovo": "allergen.egg",
  "ovos": "allergen.egg",
  "soja": "allergen.soy",
  "castanha": "allergen.nuts",
  "castanhas": "allergen.nuts",
  "nozes": "allergen.nuts",
  "amendoim": "allergen.peanut",
};

const normalizeAllergen = (raw: string) =>
  raw.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

interface AllergenListProps {
  alergenos?: string[] | null;
  /** Variante reduzida, para uso em listas densas. */
  compact?: boolean;
  className?: string;
}

const AllergenList = ({ alergenos, compact = false, className = "" }: AllergenListProps) => {
  const { t } = useI18n();
  const items = (alergenos || []).map((a) => a.trim()).filter(Boolean);
  if (items.length === 0) return null;

  const labels = items.map((raw) => {
    const key = ALLERGEN_KEYS[normalizeAllergen(raw)];
    return key ? t(key) : raw;
  });

  return (
    <div
      className={`flex items-start gap-1.5 ${compact ? "mt-1" : "mt-2"} text-amber-200/90 ${className}`}
      aria-label={t("menu.allergens_aria")}
    >
      <AlertTriangle
        className={`${compact ? "h-2.5 w-2.5 mt-[3px]" : "h-3 w-3 mt-[2px]"} flex-shrink-0`}
        aria-hidden="true"
      />
      <span className={`${compact ? "text-[9px]" : "text-[10px]"} leading-snug`}>
        <span className="font-semibold uppercase tracking-wider">{t("menu.allergens")}:</span>{" "}
        {labels.join(" · ")}
      </span>
    </div>
  );
};

export default AllergenList;
