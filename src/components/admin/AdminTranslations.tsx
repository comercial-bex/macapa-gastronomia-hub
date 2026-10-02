import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Languages, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translateContent, type TranslatableTable } from "@/lib/translateContent";
import { useAuditLog } from "@/hooks/useAuditLog";
import TranslationRow, { LOCALES, type TransRow, type Traducoes } from "./TranslationRow";

const TABLES: {
  table: TranslatableTable;
  label: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    table: "weekly_menu_items",
    label: "Pratos da semana",
    fields: [
      { key: "prato", label: "Prato" },
      { key: "descricao", label: "Descrição" },
      { key: "categoria", label: "Categoria" },
      { key: "badge", label: "Selo" },
    ],
  },
  {
    table: "beverages",
    label: "Bebidas e doses",
    fields: [
      { key: "nome", label: "Nome" },
      { key: "descricao", label: "Descrição" },
      { key: "badge", label: "Selo" },
    ],
  },
  {
    table: "beverage_categories",
    label: "Categorias (bebidas e doces)",
    fields: [{ key: "nome", label: "Nome" }],
  },
  {
    table: "units",
    label: "Unidades",
    fields: [
      { key: "nome", label: "Nome" },
      { key: "horarios", label: "Horários" },
    ],
  },
  {
    table: "job_positions",
    label: "Vagas",
    fields: [
      { key: "titulo", label: "Título" },
      { key: "descricao", label: "Descrição" },
      { key: "requisitos", label: "Requisitos" },
      { key: "funcoes", label: "Funções" },
    ],
  },
  {
    table: "portfolio_items",
    label: "Galeria",
    fields: [
      { key: "titulo", label: "Título" },
      { key: "descricao", label: "Descrição" },
      { key: "categoria", label: "Categoria" },
    ],
  },
  {
    // Categorias de portfólio e cardápio: traduzidas uma vez aqui, e não
    // repetidas por linha de conteúdo como acontecia com o campo de texto.
    table: "content_categories",
    label: "Categorias (portfólio e cardápio)",
    fields: [{ key: "nome", label: "Nome" }],
  },
  {
    // Texto institucional (hero, história, CTA, footer). Antes ficava fora da
    // tradução, então o site aparecia com o menu traduzido e a apresentação
    // em português. Chaves de contato (telefone/URLs/e-mail) são filtradas no
    // backend e não aparecem aqui.
    table: "site_settings",
    label: "Textos do site (hero, história, CTA)",
    fields: [{ key: "valor", label: "Texto" }],
  },
];

/** Chaves de site_settings que são dados de contato, não texto traduzível. */
const SITE_SETTINGS_SKIP = new Set([
  "telefone_principal",
  "whatsapp_numero",
  "instagram_url",
  "facebook_url",
  "email_contato",
]);

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Central de traduções: edita EN/ES/FR de todo o conteúdo do CMS numa só tela. */
const AdminTranslations = () => {
  const [table, setTable] = useState<TranslatableTable>("weekly_menu_items");
  const [rows, setRows] = useState<TransRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulk, setBulk] = useState(false);
  const [bulkAll, setBulkAll] = useState(false);
  const [progress, setProgress] = useState("");
  const [search, setSearch] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const { logAction } = useAuditLog();

  const config = TABLES.find((t) => t.table === table)!;

  const load = useCallback(async () => {
    setLoading(true);
    const extra = table === "site_settings" ? ["chave"] : [];
    const cols = ["id", "traducoes", ...config.fields.map((f) => f.key), ...extra].join(",");
    const { data, error } = await supabase.from(table).select(cols).limit(500);
    if (error) toast.error("Não foi possível carregar o conteúdo.");
    const loaded = ((data ?? []) as unknown as TransRow[])
      .filter((r) => table !== "site_settings" || !SITE_SETTINGS_SKIP.has(String((r as Record<string, unknown>).chave ?? "")))
      .map((r) => ({ ...r, traducoes: r.traducoes ?? {} }));
    setRows(loaded);
    setLoading(false);
  }, [table, config]);

  useEffect(() => {
    load();
  }, [load]);

  const isPending = (row: TransRow) => {
    const active = config.fields.filter(
      (f) => typeof row[f.key] === "string" && (row[f.key] as string).trim(),
    );
    return LOCALES.some((l) => !active.every((f) => (row.traducoes?.[l]?.[f.key] ?? "").trim()));
  };

  const visible = useMemo(() => {
    const q = norm(search.trim());
    return rows.filter((row) => {
      if (onlyPending && !isPending(row)) return false;
      if (!q) return true;
      return config.fields.some(
        (f) => typeof row[f.key] === "string" && norm(row[f.key] as string).includes(q),
      );
    });
  }, [rows, search, onlyPending, config]);

  const pendingCount = rows.filter(isPending).length;

  const save = async (id: string, traducoes: Traducoes) => {
    const clean: Traducoes = {};
    for (const locale of LOCALES) {
      const entry = Object.fromEntries(
        Object.entries(traducoes[locale] ?? {}).filter(([, v]) => v?.trim()),
      ) as Record<string, string>;
      if (Object.keys(entry).length) clean[locale] = entry;
    }
    const { error } = await supabase.from(table).update({ traducoes: clean }).eq("id", id);
    if (error) {
      toast.error("Falha ao salvar a tradução.");
      return;
    }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, traducoes: clean } : r)));
    await logAction("traducoes", "editou", `Editou tradução em ${config.label}`, {
      tabela: table,
      registroId: id,
    });
    toast.success("Tradução salva.");
  };

  const generateOne = async (id: string) => {
    const { translated, error } = await translateContent(table, { ids: [id] });
    if (!translated) {
      toast.error(error ?? "Não foi possível gerar a tradução.");
      return;
    }
    toast.success("Tradução gerada.");
    await load();
  };

  const generateAll = async () => {
    setBulk(true);
    const { translated, error } = await translateContent(table, { onlyMissing: true });
    if (error) toast.error(error);
    else toast[translated ? "success" : "info"](
      translated ? `${translated} item(ns) traduzido(s).` : "Nada pendente neste conteúdo.",
    );
    await load();
    setBulk(false);
  };

  // Runs every table in sequence so nothing stays untranslated.
  const generateEverything = async () => {
    setBulkAll(true);
    let total = 0;
    const failures: string[] = [];
    for (const entry of TABLES) {
      setProgress(entry.label);
      const { translated, error } = await translateContent(entry.table, { onlyMissing: true });
      if (error) failures.push(`${entry.label}: ${error}`);
      total += translated ?? 0;
    }
    setProgress("");
    if (failures.length) toast.error(failures.join(" · "));
    if (total) toast.success(`${total} item(ns) traduzido(s) em todo o conteúdo.`);
    else if (!failures.length) toast.info("Nada pendente — tudo já está traduzido.");
    await load();
    setBulkAll(false);
  };



  return (
    <div>
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
        <Languages className="h-5 w-5 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-semibold">Traduções</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={table} onValueChange={(v) => setTable(v as TranslatableTable)}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TABLES.map((t) => (
              <SelectItem key={t.table} value={t.table}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conteúdo…"
            className="pl-9"
            aria-label="Buscar conteúdo"
          />
        </div>

        <Button variant={onlyPending ? "default" : "outline"} onClick={() => setOnlyPending((v) => !v)}>
          Pendentes ({pendingCount})
        </Button>

        <Button onClick={generateAll} disabled={bulk || bulkAll} className="gap-2">
          {bulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
          Traduzir pendentes
        </Button>

        <Button variant="secondary" onClick={generateEverything} disabled={bulk || bulkAll} className="gap-2">
          {bulkAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
          Traduzir tudo o que falta
        </Button>

        {bulkAll && progress && (
          <span aria-live="polite" className="text-xs text-muted-foreground">Traduzindo: {progress}…</span>
        )}
      </div>


      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-effect rounded-lg p-10 text-center text-muted-foreground">
          Nenhum item encontrado para este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((row) => (
            <TranslationRow
              key={row.id}
              row={row}
              fields={config.fields}
              onSave={save}
              onGenerate={generateOne}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTranslations;
