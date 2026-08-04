import type { Locale } from "./types";

/**
 * Reads a translated field from a CMS record's `traducoes` JSON column.
 * Falls back to the original pt-BR value when no translation exists.
 */
/** Any CMS row; the `traducoes` JSON column is optional. */
export type TranslatableRecord = object;

export const localizedField = (
  record: TranslatableRecord | null | undefined,
  field: string,
  locale: Locale,
): string => {
  if (!record) return "";
  const row = record as Record<string, unknown>;
  const original = typeof row[field] === "string" ? (row[field] as string) : "";
  if (locale === "pt-BR") return original;
  const map = row.traducoes as Record<string, Record<string, string>> | undefined;
  const value = map?.[locale]?.[field];
  return typeof value === "string" && value.trim() ? value : original;
};