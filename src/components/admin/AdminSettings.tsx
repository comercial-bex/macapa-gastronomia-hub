import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, Type, MessageSquare, Globe, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

interface Setting { id: string; chave: string; valor: string; descricao: string; }

const categoryConfig: Record<string, { keys: string[]; icon: typeof Type }> = {
  "Textos Principais": { keys: ["hero_titulo", "hero_subtitulo", "historia_titulo", "historia_subtitulo", "historia_texto", "footer_descricao"], icon: Type },
  "CTA (Chamada para Ação)": { keys: ["cta_titulo", "cta_subtitulo"], icon: MessageSquare },
  "Contato & Redes Sociais": { keys: ["telefone_principal", "whatsapp_numero", "email_contato", "instagram_url", "facebook_url"], icon: Globe },
};

const longFields = ["historia_texto", "hero_subtitulo", "footer_descricao", "cta_subtitulo"];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logAction } = useAuditLog();

  // New admin form
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", nome: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from("site_settings" as any).select("*");
      if (error) { toast.error("Erro ao carregar configurações"); return; }
      setSettings((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleChange = (chave: string, valor: string) => setEdited((prev) => ({ ...prev, [chave]: valor }));
  const getValue = (s: Setting) => edited[s.chave] ?? s.valor;

  const handleSave = async () => {
    const changes = Object.entries(edited);
    if (changes.length === 0) { toast.info("Nenhuma alteração para salvar."); return; }
    setSaving(true);
    try {
      for (const [chave, valor] of changes) {
        const { error } = await (supabase.from("site_settings" as any) as any).update({ valor }).eq("chave", chave);
        if (error) throw error;
      }
      setSettings((prev) => prev.map((s) => (edited[s.chave] !== undefined ? { ...s, valor: edited[s.chave] } : s)));
      setEdited({});
      await logAction("configuracoes", "editou", `Alterou ${changes.length} configuração(ões): ${changes.map(([k]) => k).join(", ")}`);
      toast.success("Configurações salvas com sucesso!");
    } catch { toast.error("Erro ao salvar configurações."); } finally { setSaving(false); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) { toast.error("Preencha e-mail e senha."); return; }
    if (newAdmin.password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
    setCreatingAdmin(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sessão expirada."); return; }

      const res = await supabase.functions.invoke("create-admin-user", {
        body: { email: newAdmin.email, password: newAdmin.password, nome: newAdmin.nome },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      await logAction("configuracoes", "criou", `Criou novo admin: ${newAdmin.email}`);
      toast.success(`Admin ${newAdmin.email} criado com sucesso!`);
      setNewAdmin({ email: "", password: "", nome: "" });
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar admin.");
    } finally { setCreatingAdmin(false); }
  };

  if (loading) return <div className="text-muted-foreground py-12 text-center">Carregando configurações...</div>;

  const hasChanges = Object.keys(edited).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Configurações do Site</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie todos os textos e informações do site</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      {/* Criar Admin */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <UserPlus className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Criar Novo Administrador</h2>
        </div>
        <form onSubmit={handleCreateAdmin} className="glass-effect rounded-lg p-6 space-y-4 max-w-md">
          <div>
            <Label>Nome</Label>
            <Input value={newAdmin.nome} onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })} placeholder="Nome do administrador" />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required placeholder="admin@email.com" />
          </div>
          <div>
            <Label>Senha *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={creatingAdmin} className="gap-2">
            {creatingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {creatingAdmin ? "Criando..." : "Criar Admin"}
          </Button>
        </form>
      </div>

      <div className="space-y-10">
        {Object.entries(categoryConfig).map(([catName, config]) => {
          const Icon = config.icon;
          return (
            <div key={catName}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{catName}</h2>
              </div>
              <div className="space-y-4">
                {config.keys.map((key) => {
                  const s = settings.find((s) => s.chave === key);
                  if (!s) return null;
                  const isLong = longFields.includes(key);
                  return (
                    <div key={key} className="glass-effect rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground mb-2 block">{s.descricao}</Label>
                      {isLong ? (
                        <Textarea value={getValue(s)} onChange={(e) => handleChange(s.chave, e.target.value)} rows={3} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                      ) : (
                        <Input value={getValue(s)} onChange={(e) => handleChange(s.chave, e.target.value)} className="focus:ring-primary/30 focus:ring-2 transition-shadow" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSettings;
