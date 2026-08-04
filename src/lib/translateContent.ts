import { supabase } from "@/integrations/supabase/client";

export type TranslatableTable =
  | "weekly_menu_items"
  | "beverages"
  | "beverage_categories"
  | "units"
  | "job_positions"
  | "portfolio_items";

/**
 * Generates EN/ES/FR translations for CMS rows via the `translate-content`
 * edge function. Returns the number of rows translated (0 on failure).
 */
export async function translateContent(
  table: TranslatableTable,
  options?: { ids?: string[]; onlyMissing?: boolean },
): Promise<number> {
  const { data, error } = await supabase.functions.invoke("translate-content", {
    body: { table, ids: options?.ids, onlyMissing: options?.onlyMissing ?? true },
  });
  if (error) {
    console.error("translate-content failed", error);
    return 0;
  }
  return Number((data as { translated?: number } | null)?.translated ?? 0);
}
