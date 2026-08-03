import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import ptBR from "./locales/pt-BR";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Dictionary,
  type Locale,
  type TranslationKey,
} from "./types";
import { dayKeyOf, translateCategory, translateDish } from "./menuGlossary";

export type { Locale, TranslationKey };
export { LOCALES, DEFAULT_LOCALE };

const STORAGE_KEY = "macapaba_language";
const LEGACY_STORAGE_KEY = "macapaba.locale";

const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  en,
  es,
  fr,
};

/** Maps legacy/short codes ("pt", "en-US", "fr-CA") to a supported locale. */
const normalizeLocale = (value?: string | null): Locale | null => {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.startsWith("pt")) return "pt-BR";
  if (v.startsWith("en")) return "en";
  if (v.startsWith("es")) return "es";
  if (v.startsWith("fr")) return "fr";
  return null;
};

const INTL_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

const interpolate = (text: string, vars?: Record<string, string | number>) =>
  vars
    ? Object.entries(vars).reduce(
        (acc, [k, v]) => acc.split(`{${k}}`).join(String(v)),
        text,
      )
    : text;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translates a UI key, with optional {placeholder} interpolation. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Translates CMS dish names via the gastronomic glossary. */
  tDish: (name: string) => string;
  /** Translates CMS category names (drinks, gallery). */
  tCategory: (name: string) => string;
  /** Translates a CMS weekday label ("Segunda-feira"), full or short form. */
  tDay: (label: string, short?: boolean) => string;
  /** Returns the pt-BR CMS value on pt-BR, the translated key otherwise. */
  tContent: (key: TranslationKey, ptValue?: string | null) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  /** Plural helper: uses `${base}_one` / `${base}_other` keys. */
  plural: (base: string, count: number) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const normalizedStored = normalizeLocale(stored);
    if (normalizedStored) return normalizedStored;
  } catch {
    /* storage unavailable */
  }
  return normalizeLocale(window.navigator?.language) ?? DEFAULT_LOCALE;
}

const buildValue = (locale: Locale, setLocale: (l: Locale) => void): I18nContextValue => {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    interpolate(dict[key] ?? ptBR[key] ?? key, vars);

  return {
    locale,
    setLocale,
    t,
    tDish: (name) => translateDish(name, locale),
    tCategory: (name) => translateCategory(name, locale),
    tDay: (label, short = false) => {
      const key = dayKeyOf(label);
      if (!key) return short ? label.slice(0, 3) : label;
      return t(`day.${short ? "short." : ""}${key}` as TranslationKey);
    },
    tContent: (key, ptValue) =>
      locale === "pt-BR" ? (ptValue?.trim() ? ptValue : t(key)) : t(key),
    formatNumber: (value, options) =>
      new Intl.NumberFormat(INTL_LOCALE[locale], options).format(value),
    formatDate: (value, options) =>
      new Intl.DateTimeFormat(INTL_LOCALE[locale], options ?? { dateStyle: "long" }).format(
        typeof value === "string" ? new Date(value) : value,
      ),
    plural: (base, count) => {
      const rule = new Intl.PluralRules(INTL_LOCALE[locale]).select(count);
      const key = (rule === "one" ? `${base}_one` : `${base}_other`) as TranslationKey;
      return t(key, { n: count });
    },
  };
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    if (!LOCALES.includes(l)) return;
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(() => buildValue(locale, setLocale), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  // Safe fallback so components don't crash if used outside the provider.
  return ctx ?? buildValue(DEFAULT_LOCALE, () => {});
};
