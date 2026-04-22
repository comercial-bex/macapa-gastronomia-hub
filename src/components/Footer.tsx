import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { getSetting } = useSiteSettings();

  return (
    <footer className="border-t border-border/30">
      <div className="container mx-auto px-4 py-12">
        {/* Single horizontal row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
           <img src={logoMacapaba} alt="Macapaba" className="h-8" />

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: "Portfólio", path: "/portfolio" },
              { label: "Cardápio", path: "/cardapio" },
              { label: "Unidades", path: "/unidades" },
              { label: "Trabalhe Conosco", path: "/trabalhe-conosco" },
              { label: "Reserva", path: "/reserva" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact + Social */}
          <div className="flex items-center gap-5">
            <span className="text-xs text-muted-foreground/40">{getSetting("email_contato", "restaurantemacapaba123@gmail.com")}</span>
            <div className="flex gap-3">
              <a href={getSetting("instagram_url", "https://instagram.com/restaurantemacapaba")} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={getSetting("facebook_url", "https://facebook.com/restaurantemacapaba")} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20 py-5 text-center text-[10px] text-muted-foreground/30 flex items-center justify-center gap-4 uppercase tracking-wider">
         <span>© {new Date().getFullYear()} Restaurante Macapaba</span>
        <Link to="/admin/login" className="hover:text-muted-foreground/50 transition-colors">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
