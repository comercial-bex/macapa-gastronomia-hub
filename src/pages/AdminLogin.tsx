import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profile?.role === "admin") navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("Acesso negado. Apenas administradores.");
        return;
      }
      toast.success("Login realizado!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/15 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-[50%] left-[50%] w-[25%] h-[25%] rounded-full bg-primary/12 blur-[80px] animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <motion.img
            src={logoMacapaba}
            alt="Macapabá"
            className="h-14 mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm tracking-[0.2em] uppercase font-medium"
          >
            Painel Administrativo
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-effect rounded-xl p-6 shadow-lg shadow-primary/5"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao site
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
