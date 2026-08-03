import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

const navLinkDefs = [
  { key: "nav.home", path: "/" },
  { key: "nav.portfolio", path: "/portfolio" },
  { key: "nav.menu", path: "/cardapio" },
  { key: "nav.units", path: "/unidades" },
  { key: "nav.careers", path: "/trabalhe-conosco" },
] as const;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { getSetting } = useSiteSettings();
  const { t } = useI18n();

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
           <img src={logoMacapaba} alt="Restaurante Macapaba" className="h-10" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label={t("a11y.nav_main")}>
          {navLinkDefs.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : isTransparent ? "text-white/90" : "text-foreground/70"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher variant={isTransparent ? "light" : "dark"} />
          <a
            href={`https://wa.me/${getSetting("whatsapp_numero", "5596991832460")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm transition-colors hover:text-primary ${isTransparent ? "text-white/90" : "text-foreground/70"}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{getSetting("telefone_principal", "(96) 99183-2460")}</span>
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
              {t("cta.reserve")}
            </Button>
          </a>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher variant={isTransparent ? "light" : "dark"} />
          <button
            type="button"
            className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isTransparent ? "text-white" : "text-foreground"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("cta.menu_close") : t("cta.menu_button")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-3" aria-label={t("a11y.nav_mobile")}>
              {navLinkDefs.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium uppercase py-2 transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {t(link.key)}
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
                  {t("cta.reserve")}
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
