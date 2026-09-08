import { useState } from "react";
import { toast } from "sonner";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateContent, type TranslatableTable } from "@/lib/translateContent";

const TABLES: { table: TranslatableTable; label: string }[] = [
  { table: "weekly_menu_items", label: "Cardápio da semana" },
  { table: "beverages", label: "Bebidas" },
  { table: "beverage_categories", label: "Categorias de bebidas" },
  { table: "units", label: "Unidades" },
  { table: "job_positions", label: "Vagas" },
  { table: "portfolio_items", label: "Galeria" },
];

/** Generates EN/ES/FR versions for CMS rows that still have no translation. */
const TranslationBackfill = () => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setDone(null);
    try {
      let total = 0;
      let failure: string | undefined;
      for (const { table, label } of TABLES) {
        const { translated, error } = await translateContent(table, { onlyMissing: true });
        total += translated;
        if (translated) toast.success(`${label}: ${translated} item(ns) traduzido(s)`);
        if (error) { failure = error; break; }
      }
      if (failure) toast.error(failure);
      setDone(
        failure
          ? failure
          : total > 0
            ? `${total} registro(s) traduzido(s) para EN, ES e FR.`
            : "Tudo já está traduzido.",
      );
    } catch {
      toast.error("Falha ao traduzir conteúdo.");
    } finally {
      setRunning(false);
    }
  };


  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
        <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Traduções automáticas</h2>
      </div>
      <div className="glass-effect rounded-lg p-6 space-y-4 max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Gera as versões em inglês, espanhol e francês dos conteúdos cadastrados
          (pratos, bebidas, unidades, vagas e galeria). Nomes regionais são
          preservados. Itens já traduzidos não são reprocessados.
        </p>
        <Button onClick={run} disabled={running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Languages className="h-4 w-4" aria-hidden="true" />}
          {running ? "Traduzindo…" : "Traduzir conteúdo pendente"}
        </Button>
        {done && <p className="text-sm text-primary" role="status">{done}</p>}
      </div>
    </div>
  );
};

export default TranslationBackfill;
