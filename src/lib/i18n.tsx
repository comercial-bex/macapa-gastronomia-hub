/**
 * Compatibility entry point — the i18n implementation lives in `src/i18n`.
 * Keeps `@/lib/i18n` imports working across the app.
 */
export {
  I18nProvider,
  useI18n,
  LOCALES,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationKey,
} from "@/i18n";
