import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import OfflineIndicator from "./OfflineIndicator";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useI18n } from "@/lib/i18n";

const Layout = ({ children }: { children: ReactNode }) => {
  useSmoothScroll();
  const { t } = useI18n();

  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        {t("a11y.skip_to_content")}
      </a>
      <Header />
      <main id="main" className="flex-1 pt-16" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <OfflineIndicator />
    </div>
  );
};

export default Layout;
