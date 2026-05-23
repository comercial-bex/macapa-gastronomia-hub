import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Discreet bottom-of-screen badge that appears whenever the browser reports
 * the connection is offline. Pairs with the PWA cache so users browsing the
 * cached menu still get clear feedback that they're offline.
 */
const OfflineIndicator = () => {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/30 px-4 py-2 text-xs text-foreground shadow-lg"
        >
          <WifiOff className="h-3.5 w-3.5 text-primary" />
          Você está offline — exibindo conteúdo salvo
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;