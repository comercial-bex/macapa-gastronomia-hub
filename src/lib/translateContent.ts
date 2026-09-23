import { supabase } from "@/integrations/supabase/client";

export type TranslatableTable =
  | "weekly_menu_items"
  | "beverages"
  | "beverage_categories"
  | "units"
  | "job_positions"
  | "portfolio_items"
  | "site_settings"
  | "content_categories";

export interface TranslateResult {
  translated: number;
  /** Human-readable reason when nothing (or not everything) could be translated. */
  error?: string;
}

/**
 * Generates EN/ES/FR translations for CMS rows via the `translate-content`
 * edge function.
 */
export async function translateContent(
  table: TranslatableTable,
  options?: { ids?: string[]; onlyMissing?: boolean },
): Promise<TranslateResult> {
  const { data, error } = await supabase.functions.invoke("translate-content", {
    body: { table, ids: options?.ids, onlyMissing: options?.onlyMissing ?? true },
  });
  if (error) {
    console.error("translate-content failed", error);
    return { translated: 0, error: error.message };
  }
  const payload = (data ?? {}) as { translated?: number; error?: string };
  return { translated: Number(payload.translated ?? 0), error: payload.error };
}
