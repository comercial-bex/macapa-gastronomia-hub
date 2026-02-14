import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Image, Wine, CalendarDays, MapPin, Briefcase, Users, BookOpen, LogOut } from "lucide-react";
import AdminPortfolio from "@/components/admin/AdminPortfolio";
import AdminBeverages from "@/components/admin/AdminBeverages";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminUnits from "@/components/admin/AdminUnits";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminReservations from "@/components/admin/AdminReservations";

const sidebarLinks = [
  { label: "Portfólio", path: "/admin/portfolio", icon: Image },
  { label: "Bebidas", path: "/admin/bebidas", icon: Wine },
  { label: "Cardápio", path: "/admin/cardapio", icon: CalendarDays },
  { label: "Unidades", path: "/admin/unidades", icon: MapPin },
  { label: "Vagas", path: "/admin/vagas", icon: Briefcase },
  { label: "Candidaturas", path: "/admin/candidaturas", icon: Users },
  { label: "Reservas", path: "/admin/reservas", icon: BookOpen },
];

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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-secondary border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="font-display text-xl font-bold text-primary">MACAPABÁ</Link>
          <p className="text-xs text-muted-foreground mt-1">Painel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                location.pathname === link.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
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
            <Route path="*" element={<AdminPortfolio />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
