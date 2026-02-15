import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Image, Wine, CalendarDays, MapPin, Briefcase, Users, BookOpen, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";
import logoMacapaba from "@/assets/logo-macapaba.png";
import AdminPortfolio from "@/components/admin/AdminPortfolio";
import AdminBeverages from "@/components/admin/AdminBeverages";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminUnits from "@/components/admin/AdminUnits";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminSettings from "@/components/admin/AdminSettings";

const sidebarLinks = [
  { label: "Portfólio", path: "/admin/portfolio", icon: Image },
  { label: "Bebidas", path: "/admin/bebidas", icon: Wine },
  { label: "Cardápio", path: "/admin/cardapio", icon: CalendarDays },
  { label: "Unidades", path: "/admin/unidades", icon: MapPin },
  { label: "Vagas", path: "/admin/vagas", icon: Briefcase },
  { label: "Candidaturas", path: "/admin/candidaturas", icon: Users },
  { label: "Reservas", path: "/admin/reservas", icon: BookOpen },
  { label: "Configurações", path: "/admin/configuracoes", icon: Settings },
];

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { navigate("/admin/login"); return; }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    check();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img src={logoMacapaba} alt="Macapabá" className="h-12 animate-pulse" />
        <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <aside className="w-64 bg-secondary border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/">
            <img src={logoMacapaba} alt="Macapabá" className="h-10 transition-transform duration-200 hover:scale-105" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2 tracking-[0.15em] uppercase font-medium">
            Painel Admin
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.div
                key={link.path}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={sidebarItemVariants}
              >
                <Link
                  to={link.path}
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

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="bebidas" element={<AdminBeverages />} />
            <Route path="cardapio" element={<AdminMenu />} />
            <Route path="unidades" element={<AdminUnits />} />
            <Route path="vagas" element={<AdminJobs />} />
            <Route path="candidaturas" element={<AdminApplications />} />
            <Route path="reservas" element={<AdminReservations />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="*" element={<AdminPortfolio />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
