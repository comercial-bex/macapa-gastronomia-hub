import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LOCALES = ["en", "es", "fr"] as const;
export type TransLocale = (typeof LOCALES)[number];
const LOCALE_LABEL: Record<TransLocale, string> = { en: "Inglês", es: "Espanhol", fr: "Francês" };

export type Traducoes = Partial<Record<TransLocale, Record<string, string>>>;
export interface TransRow {
  id: string;
  traducoes: Traducoes;
  [key: string]: unknown;
}

interface Props {
  row: TransRow;
  fields: { key: string; label: string }[];
  onSave: (id: string, traducoes: Traducoes) => Promise<void>;
  onGenerate: (id: string) => Promise<void>;
}

/** One CMS record with its pt-BR source and editable EN/ES/FR fields. */
const TranslationRow = ({ row, fields, onSave, onGenerate }: Props) => {
  const [draft, setDraft] = useState<Traducoes>(row.traducoes ?? {});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const activeFields = fields.filter(
    (f) => typeof row[f.key] === "string" && (row[f.key] as string).trim(),
  );
  const missing = LOCALES.filter(
    (l) => !activeFields.every((f) => (draft[l]?.[f.key] ?? "").trim()),
  );

  const set = (locale: TransLocale, field: string, value: string) =>
    setDraft((d) => ({ ...d, [locale]: { ...(d[locale] ?? {}), [field]: value } }));

  const title = String(row[activeFields[0]?.key ?? "id"] ?? "");

  return (
    <div className="glass-effect rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {missing.length
              ? `Faltando: ${missing.map((l) => LOCALE_LABEL[l]).join(", ")}`
              : "Traduzido nos 3 idiomas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={generating}
            onClick={async () => {
              setGenerating(true);
              await onGenerate(row.id);
              setGenerating(false);
            }}
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Gerar com IA
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(row.id, draft);
              setSaving(false);
            }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {LOCALES.map((locale) => (
          <div key={locale} className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-primary">{LOCALE_LABEL[locale]}</p>
            {activeFields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {f.label} · <span className="italic">{String(row[f.key])}</span>
                </Label>
                <Input
                  value={draft[locale]?.[f.key] ?? ""}
                  placeholder={String(row[f.key])}
                  onChange={(e) => set(locale, f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationRow;
