import type { Locale } from "./types";

/**
 * Reads a translated field from a CMS record's `traducoes` JSON column.
 * Falls back to the original pt-BR value when no translation exists.
 */
export type TranslatableRecord = {
  traducoes?: unknown;
  [key: string]: unknown;
};

export const localizedField = (
  record: TranslatableRecord | null | undefined,
  field: string,
  locale: Locale,
): string => {
  if (!record) return "";
  const original = typeof record[field] === "string" ? (record[field] as string) : "";
  if (locale === "pt-BR") return original;
  const map = record.traducoes as Record<string, Record<string, string>> | undefined;
  const value = map?.[locale]?.[field];
  return typeof value === "string" && value.trim() ? value : original;
};