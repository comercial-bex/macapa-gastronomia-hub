import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerSW";

createRoot(document.getElementById("root")!).render(<App />);

registerServiceWorker();

// Auto-recover from stale dynamic-import chunks after a new deploy.
// When the HTML references a chunk hash that no longer exists, the browser
// throws "Importing a module script failed." A one-time reload fetches the
// fresh index.html and the new chunk graph.
if (typeof window !== "undefined") {
  const reloadOnce = () => {
    const key = "__chunk_reload__";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  };
  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (
      msg.includes("Importing a module script failed") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("error loading dynamically imported module")
    ) {
      reloadOnce();
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    const msg = String((event.reason && (event.reason.message || event.reason)) || "");
    if (
      msg.includes("Importing a module script failed") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("error loading dynamically imported module")
    ) {
      reloadOnce();
    }
  });
}
