import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Save, Loader2, User } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const AdminProfile = () => {
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { logAction } = useAuditLog();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email || "");
      const { data } = await supabase.from("profiles").select("nome, avatar_url").eq("id", session.user.id).single();
      if (data) {
        setNome(data.nome || "");
        setAvatarUrl(data.avatar_url || null);
      }
    };
    load();
  }, []);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const ext = file.name.split(".").pop();
      const path = `${session.user.id}.${ext}`;
      await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").update({ avatar_url: url } as any).eq("id", session.user.id);
      setAvatarUrl(url);
      await logAction("perfil", "editou", "Atualizou foto de perfil");
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro no upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("profiles").update({ nome } as any).eq("id", session.user.id);
      await logAction("perfil", "editou", `Atualizou nome para '${nome}'`);
      toast.success("Perfil salvo!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl font-bold mb-6">Meu Perfil</h2>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
        </div>
        <div>
          <p className="font-medium text-lg">{nome || "Admin"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input value={email} disabled className="opacity-60" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default AdminProfile;
