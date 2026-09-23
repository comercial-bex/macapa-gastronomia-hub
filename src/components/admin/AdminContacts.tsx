import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertCircle, Briefcase, CalendarDays, Loader2, MessageCircle,
  Repeat, Search, UserRound,
} from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

interface Contact {
  id: string;
  nome: string;
  telefone_original: string;
  telefone_normalizado: string;
  email: string | null;
  notas_internas: string | null;
  primeiro_contato: string;
  ultimo_contato: string;
}

interface HistoryRow {
  contact_id: string;
  tipo: string;
  registro_id: string;
  created_at: string;
  status: string | null;
  data_evento: string | null;
  pessoas: number | null;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

/**
 * Clientes e candidatos, deduplicados por telefone.
 *
 * Sem esta tela a tabela contacts seria mais uma estrutura sem consumidor:
 * o dado existiria e ninguém veria. É aqui que "cliente recorrente" e
 * "no-show reincidente" — que o enum de status já previa mas nada expunha —
 * finalmente aparecem.
 */
const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyRecurrent, setOnlyRecurrent] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const { logAction } = useAuditLog();

  const load = useCallback(async () => {
    setLoading(true);
    const [c, h] = await Promise.all([
      supabase.from("contacts").select("*").order("ultimo_contato", { ascending: false }),
      supabase.from("contact_history").select("*"),
    ]);
    if (c.error) toast.error("Não foi possível carregar os contatos.");
    setContacts((c.data ?? []) as unknown as Contact[]);
    setHistory((h.data ?? []) as unknown as HistoryRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Métricas por contato, derivadas da view contact_history. */
  const stats = useMemo(() => {
    const map = new Map<string, { reservas: number; candidaturas: number; noShows: number }>();
    history.forEach((row) => {
      const cur = map.get(row.contact_id) ?? { reservas: 0, candidaturas: 0, noShows: 0 };
      if (row.tipo === "reserva") {
        cur.reservas += 1;
        if (row.status === "no_show") cur.noShows += 1;
      } else {
        cur.candidaturas += 1;
      }
      map.set(row.contact_id, cur);
    });
    return map;
  }, [history]);

  const visible = useMemo(() => {
    const q = norm(search.trim());
    const digits = search.replace(/\D/g, "");
    return contacts.filter((c) => {
      const s = stats.get(c.id);
      if (onlyRecurrent && (s?.reservas ?? 0) < 2) return false;
      if (!q) return true;
      return (
        norm(c.nome).includes(q) ||
        (!!digits && c.telefone_normalizado.includes(digits)) ||
        (c.email ? norm(c.email).includes(q) : false)
      );
    });
  }, [contacts, search, onlyRecurrent, stats]);

  const recorrentes = useMemo(
    () => contacts.filter((c) => (stats.get(c.id)?.reservas ?? 0) >= 2).length,
    [contacts, stats],
  );

  const openDetail = (c: Contact) => {
    setSelected(c);
    setNotas(c.notas_internas ?? "");
  };

  const saveNotas = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("contacts")
      .update({ notas_internas: notas.trim() || null })
      .eq("id", selected.id);
    setSaving(false);
    if (error) { toast.error("Falha ao salvar a anotação."); return; }
    setContacts((cs) =>
      cs.map((c) => (c.id === selected.id ? { ...c, notas_internas: notas.trim() || null } : c)),
    );
    await logAction("contatos", "editou", `Anotou sobre ${selected.nome}`, {
      tabela: "contacts",
      registroId: selected.id,
    });
    toast.success("Anotação salva.");
  };

  const detailHistory = useMemo(
    () =>
      selected
        ? history
            .filter((h) => h.contact_id === selected.id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
        : [],
    [history, selected],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando contatos...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <UserRound className="h-6 w-6 text-primary" /> Contatos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {contacts.length} pessoa(s) · {recorrentes} recorrente(s) · deduplicado por telefone
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, telefone ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={onlyRecurrent ? "default" : "outline"}
          onClick={() => setOnlyRecurrent((v) => !v)}
          className="gap-2"
        >
          <Repeat className="h-4 w-4" /> Só recorrentes
        </Button>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {contacts.length === 0
            ? "Nenhum contato ainda. Eles são criados automaticamente a cada reserva ou candidatura."
            : "Nenhum contato corresponde ao filtro."}
        </p>
      )}

      <div className="space-y-2">
        {visible.map((c) => {
          const s = stats.get(c.id) ?? { reservas: 0, candidaturas: 0, noShows: 0 };
          return (
            <button
              key={c.id}
              onClick={() => openDetail(c)}
              className="w-full text-left glass-effect rounded-xl p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium flex items-center gap-2">
                    {c.nome}
                    {s.reservas >= 2 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        <Repeat className="h-3 w-3" /> recorrente
                      </span>
                    )}
                    {s.noShows > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-orange-400">
                        <AlertCircle className="h-3 w-3" /> {s.noShows} no-show
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.telefone_original}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {s.reservas}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {s.candidaturas}
                  </span>
                  <span>último: {fmtDate(c.ultimo_contato)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.nome}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Telefone:</span>
                  {selected.telefone_original}
                  <a
                    href={`https://wa.me/55${selected.telefone_normalizado}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
                {selected.email && (
                  <div><span className="text-muted-foreground">E-mail:</span> {selected.email}</div>
                )}
                <div>
                  <span className="text-muted-foreground">Cliente desde:</span>{" "}
                  {fmtDate(selected.primeiro_contato)}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Histórico</Label>
                <div className="mt-1 max-h-52 overflow-y-auto space-y-1.5">
                  {detailHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sem registros.</p>
                  )}
                  {detailHistory.map((h) => (
                    <div
                      key={`${h.tipo}-${h.registro_id}`}
                      className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {h.tipo === "reserva" ? (
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                        )}
                        {h.tipo === "reserva"
                          ? `Reserva ${fmtDate(h.data_evento)}${h.pessoas ? ` · ${h.pessoas}p` : ""}`
                          : "Candidatura"}
                      </span>
                      <span
                        className={
                          h.status === "no_show" ? "text-orange-400" : "text-muted-foreground"
                        }
                      >
                        {h.status ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notas" className="text-xs text-muted-foreground">
                  Anotações internas (não aparecem no site)
                </Label>
                <Textarea
                  id="notas"
                  rows={3}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Preferências, restrições alimentares, observações da equipe..."
                />
                <Button onClick={saveNotas} disabled={saving} className="mt-2" size="sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar anotação"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContacts;
