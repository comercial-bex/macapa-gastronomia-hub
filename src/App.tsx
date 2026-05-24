import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { I18nProvider } from "@/lib/i18n";

// Code-split secondary routes for faster first paint
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Cardapio = lazy(() => import("./pages/Cardapio"));
const Unidades = lazy(() => import("./pages/Unidades"));
const TrabalheConosco = lazy(() => import("./pages/TrabalheConosco"));
const Reserva = lazy(() => import("./pages/Reserva"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div
    className="min-h-[60vh] flex items-center justify-center text-muted-foreground/60 text-xs uppercase tracking-widest"
    role="status"
    aria-live="polite"
    aria-label="Carregando página"
  >
    <span className="animate-pulse">Carregando…</span>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/unidades" element={<Unidades />} />
              <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
              <Route path="/reserva" element={<Reserva />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
