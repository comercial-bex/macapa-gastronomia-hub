import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ReservaForm from "@/components/ReservaForm";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useI18n } from "@/lib/i18n";

/**
 * Página de reserva.
 *
 * Antes esta rota apenas redirecionava para a home e retornava `null`, então
 * o crawler recebia uma página vazia embora /reserva estivesse declarada no
 * sitemap.xml — e "reserva" é um dos termos de busca mais valiosos do negócio.
 * Agora serve o mesmo formulário da home, com SEO e dados estruturados
 * próprios.
 */
const Reserva = () => {
  const { getSetting } = useSiteSettings();
  const { t } = useI18n();

  const telefone = getSetting("telefone_principal", "");
  const email = getSetting("email_contato", "");

  return (
    <Layout>
      <SEO
        title={`${t("res.title")} — Restaurante Macapabá`}
        description={t("res.subtitle")}
        canonical="https://restaurantemacapaba.com.br/reserva"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Restaurante Macapabá",
          url: "https://restaurantemacapaba.com.br",
          ...(telefone ? { telephone: telefone } : {}),
          ...(email ? { email } : {}),
          acceptsReservations: "True",
          potentialAction: {
            "@type": "ReserveAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://restaurantemacapaba.com.br/reserva",
              actionPlatform: [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform",
              ],
            },
            result: { "@type": "FoodEstablishmentReservation", name: t("res.title") },
          },
        }}
      />
      <ReservaForm getSetting={getSetting} headingLevel="h1" />
    </Layout>
  );
};

export default Reserva;
