import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

const Reserva = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", telefone: "", data: "", horario: "", pessoas: "2", observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim() || !form.data || !form.horario) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        data: form.data,
        horario: form.horario,
        pessoas: parseInt(form.pessoas) || 1,
        observacoes: form.observacoes.trim(),
      });
      if (error) throw error;
      toast.success("Reserva enviada com sucesso! Entraremos em contato.");
      setForm({ nome: "", telefone: "", data: "", horario: "", pessoas: "2", observacoes: "" });
    } catch {
      toast.error("Erro ao enviar reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Olá! Gostaria de fazer uma reserva:\nNome: ${form.nome}\nData: ${form.data}\nHorário: ${form.horario}\nPessoas: ${form.pessoas}\n${form.observacoes ? `Obs: ${form.observacoes}` : ""}`
  );

  return (
    <Layout>
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Reserve</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Faça sua Reserva</h1>
              <p className="text-muted-foreground mt-4">Preencha o formulário abaixo ou reserve pelo WhatsApp.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-card border border-border rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
                    <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required maxLength={20} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input id="data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="horario">Horário *</Label>
                    <Input id="horario" type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="pessoas">Nº Pessoas *</Label>
                    <Input id="pessoas" type="number" min="1" max="50" value={form.pessoas} onChange={(e) => setForm({ ...form, pessoas: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} maxLength={500} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider">
                  {loading ? "Enviando..." : "Enviar Reserva"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">ou</p>
                <a href={`https://wa.me/5596981054789?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white gap-2">
                    <MessageCircle className="h-4 w-4" /> Reservar pelo WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Reserva;
