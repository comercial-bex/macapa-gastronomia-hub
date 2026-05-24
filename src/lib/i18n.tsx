import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Locale = "pt" | "en" | "es";

const STORAGE_KEY = "macapaba.locale";

const dictionaries = {
  pt: {
    "nav.home": "Home",
    "nav.portfolio": "Portfólio",
    "nav.menu": "Cardápio",
    "nav.units": "Unidades",
    "nav.careers": "Trabalhe Conosco",
    "nav.reservation": "Reserva",
    "cta.reserve": "Reservar mesa",
    "cta.menu_button": "Abrir menu",
    "cta.menu_close": "Fechar menu",
    "footer.admin": "Admin",
    "footer.rights": "Todos os direitos reservados",
    "lang.label": "Idioma",
    "lang.pt": "Português",
    "lang.en": "English",
    "lang.es": "Español",
    "offline.message": "Você está offline",
  },
  en: {
    "nav.home": "Home",
    "nav.portfolio": "Gallery",
    "nav.menu": "Menu",
    "nav.units": "Locations",
    "nav.careers": "Careers",
    "nav.reservation": "Reservation",
    "cta.reserve": "Book a table",
    "cta.menu_button": "Open menu",
    "cta.menu_close": "Close menu",
    "footer.admin": "Admin",
    "footer.rights": "All rights reserved",
    "lang.label": "Language",
    "lang.pt": "Português",
    "lang.en": "English",
    "lang.es": "Español",
    "offline.message": "You are offline",
  },
  es: {
    "nav.home": "Inicio",
    "nav.portfolio": "Galería",
    "nav.menu": "Menú",
    "nav.units": "Sucursales",
    "nav.careers": "Trabaja con nosotros",
    "nav.reservation": "Reserva",
    "cta.reserve": "Reservar mesa",
    "cta.menu_button": "Abrir menú",
    "cta.menu_close": "Cerrar menú",
    "footer.admin": "Admin",
    "footer.rights": "Todos los derechos reservados",
    "lang.label": "Idioma",
    "lang.pt": "Português",
    "lang.en": "English",
    "lang.es": "Español",
    "offline.message": "Estás sin conexión",
  },
} as const;

export type TranslationKey = keyof (typeof dictionaries)["pt"];

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && ["pt", "en", "es"].includes(stored)) return stored;
  const nav = window.navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("es")) return "es";
  return "pt";
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  useEffect(() => {
    const htmlLang =
      locale === "pt" ? "pt-BR" : locale === "en" ? "en" : "es";
    document.documentElement.lang = htmlLang;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => dictionaries[locale][key] ?? dictionaries.pt[key] ?? key,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so components don't crash if used outside the provider.
    return {
      locale: "pt",
      setLocale: () => {},
      t: (key) => dictionaries.pt[key] ?? key,
    };
  }
  return ctx;
};