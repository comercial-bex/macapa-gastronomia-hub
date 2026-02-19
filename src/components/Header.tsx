import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Portfólio", path: "/portfolio" },
  { label: "Cardápio", path: "/cardapio" },
  { label: "Unidades", path: "/unidades" },
  { label: "Trabalhe Conosco", path: "/trabalhe-conosco" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { getSetting } = useSiteSettings();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-lg border-border/50"
          : "bg-transparent border-transparent backdrop-blur-none"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/">
          <img src={logoMacapaba} alt="Macapabá" className="h-10" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : isTransparent ? "text-white/90" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`https://wa.me/${getSetting("whatsapp_numero", "5596981054789")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm transition-colors hover:text-primary ${isTransparent ? "text-white/90" : "text-foreground/70"}`}
          >
            <Phone className="h-4 w-4" />
            <span>{getSetting("telefone_principal", "(96) 98105-4789")}</span>
          </a>
          <a
            href="/#reserva"
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === "/") {
                document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.href = "/#reserva";
              }
            }}
          >
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide uppercase text-xs px-6">
              Reserva
            </Button>
          </a>
        </div>

        <button
          className={`lg:hidden ${isTransparent ? "text-white" : "text-foreground"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium uppercase py-2 transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/#reserva"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  if (location.pathname === "/") {
                    document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/#reserva";
                  }
                }}
              >
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase text-xs mt-2">
                  Reserva
                </Button>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
