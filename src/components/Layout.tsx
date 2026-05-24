import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import OfflineIndicator from "./OfflineIndicator";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const Layout = ({ children }: { children: ReactNode }) => {
  useSmoothScroll();

  return (
    <div className="min-h-dvh flex flex-col">
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
