import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, MessageCircle, MapPin, AlertCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

/**
 * Formulário de reserva.
 *
 * Extraído de Index.tsx para poder ser usado também em /reserva, que antes
 * era só um redirect retornando null — o crawler recebia página vazia apesar
 * de a URL estar declarada no sitemap.xml.
 */
const ReservaForm = ({ getSetting }: { getSetting: (key: string, fallback: string) => string }) => {
  const { t, tContent, tRecord, formatDate } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", data: "", horario: "12:00", pessoas: "2", observacoes: "", unit_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<{ id: string; nome: string; principal: boolean }[]>([]);

  useEffect(() => {
    const fetchUnits = async () => {
      const { data } = await supabase
        .from("units")
        .select("id,nome,principal,traducoes")
        .eq("ativo", true)
        .order("principal", { ascending: false });
      if (data) {
        setUnits(data);
        const principal = data.find((u) => u.principal) ?? data[0];
        if (principal) setForm((f) => (f.unit_id ? f : { ...f, unit_id: principal.id }));
      }
    };
    fetchUnits();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const reservaSchema = z.object({
    nome: z
      .string()
      .trim()
      .min(2, { message: t("res.err_name_min") })
      .max(100, { message: t("res.err_name_max") }),
    telefone: z
      .string()
      .trim()
      .regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, {
        message: t("res.err_phone"),
      }),
    data: z
      .string()
      .min(1, { message: t("res.err_date_req") })
      .refine((v) => v >= today, { message: t("res.err_date_past") }),
    horario: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: t("res.err_time") }),
    pessoas: z
      .string()
      .refine((v) => {
        const n = parseInt(v);
        return !isNaN(n) && n >= 1 && n <= 50;
      }, { message: t("res.err_people") }),
    observacoes: z.string().max(500).optional(),
  });

  const fieldLabels: Record<string, string> = {
    nome: t("res.name"),
    telefone: t("res.phone"),
    data: t("res.date"),
    horario: t("res.time"),
    pessoas: t("res.people"),
    observacoes: t("res.notes"),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = reservaSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(t("res.toast_invalid"));
      return;
    }
    if (units.length > 0 && !form.unit_id) {
      setErrors({ unit_id: t("res.err_unit_required") });
      toast.error(t("res.err_unit_required"));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        nome: result.data.nome,
        telefone: result.data.telefone,
        data: result.data.data,
        horario: result.data.horario,
        pessoas: parseInt(result.data.pessoas) || 1,
        observacoes: (result.data.observacoes ?? "").trim(),
        unit_id: form.unit_id || null,
      });
      if (error) throw error;
      toast.success(t("res.toast_success"));
      setSent(true);
    } catch (err: unknown) {
      // O trigger de capacidade no banco devolve exceção; a mensagem é a
      // única forma de distinguir "horário lotado" de falha genérica.
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Horário sem disponibilidade") || msg.toLowerCase().includes("capacidade")) {
        toast.error(t("res.toast_full_title"), {
          description: t("res.toast_full_desc"),
        });
        setErrors({ horario: t("res.err_full_slot") });
      } else {
        toast.error(t("res.toast_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateLocal = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return formatDate(new Date(y, m - 1, d), { dateStyle: "long" });
  };

  const whatsappMessage =
    `${t("res.wa_intro")}\n\n` +
    `• *${t("res.wa_name")}:* ${form.nome || "-"}\n` +
    `• *${t("res.wa_phone")}:* ${form.telefone || "-"}\n` +
    `• *${t("res.wa_unit")}:* ${units.find((u) => u.id === form.unit_id)?.nome || t("res.wa_tbd")}\n` +
    `• *${t("res.wa_date")}:* ${formatDateLocal(form.data) || "-"}\n` +
    `• *${t("res.wa_time")}:* ${form.horario || "-"}\n` +
    `• *${t("res.wa_people")}:* ${form.pessoas || "-"}` +
    (form.observacoes ? `\n• *${t("res.wa_notes")}:* ${form.observacoes}` : "") +
    `\n\n${t("res.wa_outro")}`;

  const whatsappUrl = `https://wa.me/${getSetting(
    "whatsapp_numero",
    "5596991832460",
  )}?text=${encodeURIComponent(whatsappMessage)}`;

  const resetForm = () => {
    setForm((f) => ({ nome: "", telefone: "", data: "", horario: "12:00", pessoas: "2", observacoes: "", unit_id: f.unit_id }));
    setErrors({});
    setSent(false);
  };

  return (
    <section id="reserva" className="py-32 md:py-44 px-4 bg-card/30">
      <div className="container mx-auto max-w-2xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-4">{t("res.eyebrow")}</p>
            <h2 className="text-display font-display font-bold leading-[0.95] mb-4">
              {tContent("res.title", getSetting("cta_titulo", ""))}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {tContent("res.subtitle", getSetting("cta_subtitulo", ""))}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {Object.keys(errors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="polite"
                  className="border border-destructive/40 bg-destructive/10 rounded-sm p-4 flex items-start gap-3"
                >
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive mb-2">
                      {Object.keys(errors).length === 1
                        ? t("res.fix_one")
                        : t("res.fix_many").replace("{n}", String(Object.keys(errors).length))}
                    </p>
                    <ul className="text-xs text-destructive/90 space-y-1 list-disc list-inside">
                      {Object.entries(errors).map(([field, msg]) => (
                        <li key={field}>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`res-${field}`)?.focus()}
                            className="underline-offset-2 hover:underline"
                          >
                            <strong>{fieldLabels[field] ?? field}:</strong> {msg}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {units.length > 1 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">{t("res.unit")} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {units.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setForm({ ...form, unit_id: u.id })}
                        className={`px-4 py-2 text-sm rounded-sm border transition-all ${
                          form.unit_id === u.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {tRecord(u, "nome")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="res-nome" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.name")} *</Label>
                  <input
                    id="res-nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    maxLength={100}
                    className="input-underline"
                    placeholder={t("res.name_ph")}
                  />
                  {errors.nome && <p className="text-destructive text-xs mt-2">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="res-telefone" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.phone")} *</Label>
                  <input
                    id="res-telefone"
                    type="tel"
                    inputMode="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    required
                    maxLength={20}
                    className="input-underline"
                    placeholder={t("res.phone_ph")}
                  />
                  {errors.telefone && <p className="text-destructive text-xs mt-2">{errors.telefone}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-8">
                <div>
                  <Label htmlFor="res-data" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.date")} *</Label>
                  <input
                    id="res-data"
                    type="date"
                    min={today}
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                    className="input-underline"
                  />
                  {errors.data && <p className="text-destructive text-xs mt-2">{errors.data}</p>}
                </div>
                <div>
                  <Label htmlFor="res-horario" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.time")} *</Label>
                  <input
                    id="res-horario"
                    type="time"
                    value={form.horario}
                    onChange={(e) => setForm({ ...form, horario: e.target.value })}
                    required
                    className="input-underline"
                  />
                  {errors.horario && <p className="text-destructive text-xs mt-2">{errors.horario}</p>}
                </div>
                <div>
                  <Label htmlFor="res-pessoas" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.people")} *</Label>
                  <input
                    id="res-pessoas"
                    type="number"
                    min="1"
                    max="50"
                    value={form.pessoas}
                    onChange={(e) => setForm({ ...form, pessoas: e.target.value })}
                    required
                    className="input-underline"
                  />
                  {errors.pessoas && <p className="text-destructive text-xs mt-2">{errors.pessoas}</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 py-3 border-b border-primary/20">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {t("res.hold")} <strong className="text-foreground">{t("res.hold_minutes")}</strong> {t("res.hold_after")}
                </p>
              </div>

              <div>
                <Label htmlFor="res-obs" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("res.notes")}</Label>
                <textarea
                  id="res-obs"
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="input-underline resize-none"
                  placeholder={t("res.notes_ph")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-fill-hover w-full"
              >
                {loading ? t("res.sending") : t("res.submit")}
              </button>

              <div className="text-center pt-4">
                <p className="text-muted-foreground/40 text-xs mb-4">{t("res.or")}</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                  <MessageCircle className="h-4 w-4" /> {t("res.whatsapp")}
                </a>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-16 gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-2">{t("res.success_title")}</h3>
                <p className="text-muted-foreground">{t("res.success_text")}</p>
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                <MessageCircle className="h-4 w-4" /> {t("res.success_confirm")}
              </a>
              <button onClick={resetForm} className="text-sm text-muted-foreground/50 hover:text-foreground transition-colors">
                {t("res.new")}
              </button>
            </motion.div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ReservaForm;
