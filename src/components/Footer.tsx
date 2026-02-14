import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import logoMacapaba from "@/assets/logo-macapaba.png";

const Footer = () => (
  <footer className="bg-secondary border-t border-border">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <img src={logoMacapaba} alt="Macapabá" className="h-12 mb-4" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sabor e tradição em Macapá desde 1998. Uma casa feita de encontros, histórias e pratos que viram memória.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com/restaurantemacapaba" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://facebook.com/restaurantemacapaba" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Links</h4>
          <nav className="flex flex-col gap-2">
            {[
              { label: "Portfólio", path: "/portfolio" },
              { label: "Cardápio", path: "/cardapio" },
              { label: "Unidades", path: "/unidades" },
              { label: "Trabalhe Conosco", path: "/trabalhe-conosco" },
              { label: "Reserva", path: "/reserva" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Unidade 1</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span>Av. Ernestino Borges, N 39-B</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>(96) 988011317</span>
            </div>
          </div>
          <h4 className="font-display text-lg font-semibold mb-4">Unidade 2 <span className="text-primary text-sm">(Em breve)</span></h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span>Av. Ataíde Teive 644 - Centro</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>(96) 988011317</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>restaurantemacapaba123@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Restaurante Macapabá. Todos os direitos reservados.
    </div>
  </footer>
);

export default Footer;
