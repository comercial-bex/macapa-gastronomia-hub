import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { useI18n } from "@/lib/i18n";

const NotFound = () => {
  const { t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title={t("seo.404_title")}
        description={t("seo.404_desc")}
        noindex
      />
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-2 text-xl font-semibold">{t("nf.title")}</p>
        <p className="mb-4 text-muted-foreground">{t("nf.text")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t("nf.back")}
        </a>
      </div>
    </div>
    </>
  );
};

export default NotFound;
