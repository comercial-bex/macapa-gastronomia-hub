import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useI18n } from "@/lib/i18n";

/**
 * Alias de /reserva para a seção de reserva da home.
 *
 * Antes esta rota retornava `null`, então o crawler recebia uma página vazia
 * embora /reserva estivesse declarada no sitemap.xml. Agora aponta o canonical
 * para a home e entrega conteúdo de fallback (visível sem JS e para crawlers
 * que não seguem o redirect).
 *
 * Follow-up: transformar em página própria exige extrair o formulário de
 * Index.tsx, que hoje concentra ~1.000 linhas.
 */
const Reserva = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    navigate("/", { replace: true });
    setTimeout(() => {
      document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [navigate]);

  return (
    <>
      <SEO
        title={`${t("res.title")} — Restaurante Macapabá`}
        description={t("res.subtitle")}
        canonical="https://restaurantemacapaba.com.br/"
      />
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-bold">{t("res.title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t("res.subtitle")}</p>
        <Link to="/#reserva" className="text-sm font-medium text-primary underline">
          {t("cta.reserve")}
        </Link>
      </main>
    </>
  );
};

export default Reserva;
