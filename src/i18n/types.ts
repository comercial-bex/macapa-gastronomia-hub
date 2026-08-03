import ptBR from "./locales/pt-BR";

export type Locale = "pt-BR" | "en" | "es" | "fr";

export const LOCALES: Locale[] = ["pt-BR", "en", "es", "fr"];

export const DEFAULT_LOCALE: Locale = "pt-BR";

export type TranslationKey = keyof typeof ptBR;

/** Non-default locales may omit keys — the provider falls back to pt-BR. */
export type Dictionary = Partial<Record<TranslationKey, string>>;
