import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { localizedField } from "@/i18n/localizedRecord";

interface SettingRow {
  chave: string;
  valor: string;
  traducoes?: unknown;
}

/**
 * Chaves de site_settings que NÃO devem ser traduzidas: telefone, WhatsApp,
 * URLs de redes e e-mail são dados de contato, não texto.
 */
const NON_TRANSLATABLE = new Set([
  "telefone_principal",
  "whatsapp_numero",
  "instagram_url",
  "facebook_url",
  "email_contato",
]);

export function useSiteSettings() {
  const { locale } = useI18n();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("chave, valor, traducoes");
      if (error) throw error;
      return (data ?? []) as unknown as SettingRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // O texto institucional (hero, história, CTA, footer) ficou fora da onda de
  // i18n do catálogo, então era servido sempre em pt-BR mesmo nos outros
  // idiomas. Agora resolve traducoes[locale].valor com fallback para o valor
  // original — mesma semântica de localizedField usada no catálogo.
  const settings = useMemo(() => {
    const map: Record<string, string> = {};
    rows.forEach((row) => {
      map[row.chave] = NON_TRANSLATABLE.has(row.chave)
        ? row.valor
        : localizedField(row, "valor", locale);
    });
    return map;
  }, [rows, locale]);

  const getSetting = (chave: string, fallback: string = "") =>
    settings[chave] ?? fallback;

  return { settings, getSetting, isLoading };
}
