import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Image, Wine, CalendarDays, MapPin, Briefcase, Users, BookOpen, LogOut, Settings, ClipboardList, User, Menu, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoMacapaba from "@/assets/logo-macapaba.png";
import AdminPortfolio from "@/components/admin/AdminPortfolio";
import AdminBeverages from "@/components/admin/AdminBeverages";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminUnits from "@/components/admin/AdminUnits";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminProfile from "@/components/admin/AdminProfile";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import AdminDashboard from "@/components/admin/AdminDashboard";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Portfólio", path: "/admin/portfolio", icon: Image },
  { label: "Bebidas", path: "/admin/bebidas", icon: Wine },
  { label: "Cardápio", path: "/admin/cardapio", icon: CalendarDays },
  { label: "Unidades", path: "/admin/unidades", icon: MapPin },
  { label: "Vagas", path: "/admin/vagas", icon: Briefcase },
  { label: "Candidaturas", path: "/admin/candidaturas", icon: Users },
  { label: "Reservas", path: "/admin/reservas", icon: BookOpen },
  { label: "Histórico", path: "/admin/historico", icon: ClipboardList },
  { label: "Configurações", path: "/admin/configuracoes", icon: Settings },
];

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nome: string | null; avatar_url: string | null; email: string }>({ nome: null, avatar_url: null, email: "" });

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, nome, avatar_url").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { navigate("/admin/login"); return; }
      setUserProfile({ nome: (profile as any)?.nome || null, avatar_url: (profile as any)?.avatar_url || null, email: session.user.email || "" });
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    check();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin/login"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img src={logoMacapaba} alt="Macapabá" className="h-12 animate-pulse" />
        <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>Carregando...</p>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <Link to="/"><img src={logoMacapaba} alt="Macapabá" className="h-10 transition-transform duration-200 hover:scale-105" /></Link>
        <p className="text-xs text-muted-foreground mt-2 tracking-[0.15em] uppercase font-medium">Painel Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link, i) => {
          const isActive = location.pathname === link.path;
          return (
            <motion.div key={link.path} custom={i} initial="hidden" animate="visible" variants={sidebarItemVariants}>
              <Link
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-1"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="p-4 border-t border-border space-y-3">
        <Link to="/admin/perfil" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors">
          <div className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
            {userProfile.avatar_url ? (
              <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{userProfile.nome || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
          </div>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive transition-all duration-200">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-secondary border-r border-border hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-secondary border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/"><img src={logoMacapaba} alt="Macapabá" className="h-8" /></Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-secondary border-r border-border flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto lg:pt-0 pt-14">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="bebidas" element={<AdminBeverages />} />
            <Route path="cardapio" element={<AdminMenu />} />
            <Route path="unidades" element={<AdminUnits />} />
            <Route path="vagas" element={<AdminJobs />} />
            <Route path="candidaturas" element={<AdminApplications />} />
            <Route path="reservas" element={<AdminReservations />} />
            <Route path="historico" element={<AdminAuditLog />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="perfil" element={<AdminProfile />} />
            <Route path="*" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
