import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useI18n } from "@/lib/i18n";

const Footer = () => {
  const { getSetting } = useSiteSettings();
  const { t } = useI18n();
  const email = getSetting("email_contato", "restaurantemacapaba123@gmail.com");
  const links = [
    { key: "nav.portfolio", path: "/portfolio" },
    { key: "nav.menu", path: "/cardapio" },
    { key: "nav.units", path: "/unidades" },
    { key: "nav.careers", path: "/trabalhe-conosco" },
    { key: "nav.reservation", path: "/reserva" },
  ] as const;

  return (
    <footer className="border-t border-border/30">
      <div className="container mx-auto px-4 py-12">
        {/* Single horizontal row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
           <img src={logoMacapaba} alt={t("a11y.logo_home")} className="h-8" />

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label={t("a11y.nav_footer")}>
            {links.map((link) => (
              <Link key={link.path} to={link.path} className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider">
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Contact + Social */}
          <div className="flex items-center gap-5">
            <a
              href={`mailto:${email}`}
              className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {email}
            </a>
            <div className="flex gap-3">
              <a href={getSetting("instagram_url", "https://instagram.com/restaurantemacapaba")} target="_blank" rel="noopener noreferrer" aria-label="Instagram do Restaurante Macapaba" className="text-muted-foreground/40 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={getSetting("facebook_url", "https://facebook.com/restaurantemacapaba")} target="_blank" rel="noopener noreferrer" aria-label="Facebook do Restaurante Macapaba" className="text-muted-foreground/40 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20 py-5 text-center text-[10px] text-muted-foreground/30 flex items-center justify-center gap-4 uppercase tracking-wider">
         <span>© {new Date().getFullYear()} Restaurante Macapaba — {t("footer.rights")}</span>
        <Link to="/admin/login" className="hover:text-muted-foreground/50 transition-colors">
          {t("footer.admin")}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
