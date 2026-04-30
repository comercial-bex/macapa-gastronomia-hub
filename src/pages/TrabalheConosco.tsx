import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal, { StaggerItem } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Briefcase, ArrowLeft, Upload, CheckCircle, DollarSign, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  titulo: string;
  descricao: string | null;
  requisitos: string | null;
  funcoes: string | null;
  tipo_contrato: string | null;
  salario: string | null;
}

interface UnitOption {
  id: string;
  nome: string;
}

const TrabalheConosco = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", telefone: "", email: "", experiencia: "", disponibilidade: "", observacoes: "", unidade_pref: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [units, setUnits] = useState<UnitOption[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("job_positions").select("*").eq("ativa", true).order("ordem");
      if (data) setJobs(data as any);
      const { data: unitsData } = await supabase
        .from("units")
        .select("id,nome")
        .eq("ativo", true)
        .order("principal", { ascending: false });
      if (unitsData) setUnits(unitsData);
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!form.nome.trim() || !form.telefone.trim() || !form.email.trim()) {
      toast.error("Preencha nome, telefone e e-mail.");
      return;
    }
    setLoading(true);
    try {
      let curriculo_url = "";
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("resumes").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);
        curriculo_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("job_applications").insert({
        vaga_id: selectedJob.id,
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        experiencia: form.experiencia.trim(),
        disponibilidade: form.disponibilidade,
        curriculo_url,
        observacoes: [
          form.unidade_pref
            ? `Unidade preferencial: ${units.find((u) => u.id === form.unidade_pref)?.nome ?? "—"}`
            : null,
          form.observacoes.trim() || null,
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
      if (error) throw error;
      toast.success("Candidatura enviada com sucesso!");
      setSelectedJob(null);
      setForm({ nome: "", telefone: "", email: "", experiencia: "", disponibilidade: "", observacoes: "", unidade_pref: "" });
      setFile(null);
    } catch {
      toast.error("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderTextLines = (text: string) =>
    text.split("\n").filter(Boolean).map((line, i) => (
      <li key={i} className="flex items-start gap-2">
        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <span>{line.replace(/^[-•]\s*/, "")}</span>
      </li>
    ));

  return (
    <Layout>
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Carreiras</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Trabalhe Conosco</h1>
            </div>
          </ScrollReveal>

          {!selectedJob ? (
            <ScrollReveal stagger className="space-y-4">
              {jobs.map((job) => (
                <StaggerItem key={job.id}>
                  <motion.div
                    className="bg-card border border-border rounded-lg p-6 cursor-pointer group relative overflow-hidden"
                    onClick={() => setSelectedJob(job)}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-lg opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-center gap-3 relative z-10">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="font-display text-xl font-bold group-hover:text-primary transition-colors">{job.titulo}</h3>
                    </div>
                    <div className="ml-8 relative z-10 mt-2 flex flex-wrap gap-2">
                      {job.tipo_contrato && <Badge variant="outline" className="text-xs">{job.tipo_contrato}</Badge>}
                      {job.salario && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <DollarSign className="h-3 w-3" /> {job.salario}
                        </Badge>
                      )}
                    </div>
                    {job.descricao && <p className="text-muted-foreground text-sm mt-3 ml-8 relative z-10">{job.descricao}</p>}
                  </motion.div>
                </StaggerItem>
              ))}
              {jobs.length === 0 && (
                <p className="text-center text-muted-foreground py-20">Nenhuma vaga disponível no momento.</p>
              )}
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar às vagas
                </button>

                <div className="bg-card border border-border rounded-lg p-8">
                  <h3 className="font-display text-2xl font-bold mb-2">{selectedJob.titulo}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedJob.tipo_contrato && <Badge variant="outline">{selectedJob.tipo_contrato}</Badge>}
                    {selectedJob.salario && <Badge variant="outline" className="gap-1"><DollarSign className="h-3 w-3" /> {selectedJob.salario}</Badge>}
                  </div>
                  {selectedJob.descricao && <p className="text-muted-foreground text-sm mb-6">{selectedJob.descricao}</p>}

                  {selectedJob.requisitos && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-primary" /> Requisitos</h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">{renderTextLines(selectedJob.requisitos)}</ul>
                    </div>
                  )}

                  {selectedJob.funcoes && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4 text-primary" /> Funções</h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">{renderTextLines(selectedJob.funcoes)}</ul>
                    </div>
                  )}

                  <hr className="border-border mb-8" />

                  <h4 className="font-display text-lg font-bold mb-4">Candidate-se</h4>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required maxLength={100} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required maxLength={20} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                    <div>
                      <Label htmlFor="experiencia">Experiência</Label>
                      <Textarea id="experiencia" value={form.experiencia} onChange={(e) => setForm({ ...form, experiencia: e.target.value })} rows={3} maxLength={1000} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                    <div>
                      <Label htmlFor="disponibilidade">Disponibilidade</Label>
                      <Select value={form.disponibilidade} onValueChange={(v) => setForm({ ...form, disponibilidade: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="integral">Integral</SelectItem>
                          <SelectItem value="meio-periodo">Meio período</SelectItem>
                          <SelectItem value="noturno">Noturno</SelectItem>
                          <SelectItem value="fins-de-semana">Fins de semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {units.length > 1 && (
                      <div>
                        <Label htmlFor="unidade-pref">Unidade preferencial</Label>
                        <Select value={form.unidade_pref} onValueChange={(v) => setForm({ ...form, unidade_pref: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="curriculo">Currículo (PDF/DOC)</Label>
                      <div className="mt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-lg p-4 hover:border-primary">
                          <Upload className="h-4 w-4" />
                          {file ? file.name : "Selecionar arquivo"}
                          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea id="observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} maxLength={500} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform">
                      {loading ? "Enviando..." : "Enviar Candidatura"}
                    </Button>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TrabalheConosco;
