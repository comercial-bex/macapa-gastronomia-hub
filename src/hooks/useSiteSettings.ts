import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("chave, valor");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data as any[])?.forEach((row: { chave: string; valor: string }) => {
        map[row.chave] = row.valor;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getSetting = (chave: string, fallback: string = "") =>
    settings[chave] ?? fallback;

  return { settings, getSetting, isLoading };
}
