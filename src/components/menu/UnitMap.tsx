import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MapUnit {
  id: string;
  nome: string;
  endereco: string;
  maps_url: string | null;
  telefone?: string | null;
}

interface UnitMapProps {
  units: MapUnit[];
  activeUnitId: string;
  onSelect: (id: string) => void;
  labels: { title: string; hint: string; viewMenu: string; directions: string; all?: string };
  localize: (record: MapUnit, field: string) => string;
}

const mapsEmbed = (address: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(`${address}, Macapá, AP, Brasil`)}&z=15&output=embed`;

const UnitMap = ({ units, activeUnitId, onSelect, labels, localize }: UnitMapProps) => {
  if (units.length === 0) return null;
  const active = units.find((u) => u.id === activeUnitId) ?? units[0];
  const allSelected = !units.some((u) => u.id === activeUnitId);

  return (
    <section aria-labelledby="unidades-mapa" className="mb-6 rounded-xl border border-border bg-secondary/30 p-3 md:p-4">
      <div className="mb-3">
        <h2 id="unidades-mapa" className="font-display text-lg font-bold text-foreground">{labels.title}</h2>
        <p className="text-xs text-muted-foreground">{labels.hint}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_1.2fr]">
        <ul className="space-y-2">
          {labels.all && units.length > 1 && (
            <li>
              <Button
                type="button"
                variant="ghost"
                aria-pressed={allSelected}
                onClick={() => onSelect("all")}
                className={`h-auto w-full justify-start border-l-4 px-3 py-3 text-left ${
                  allSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary/70"
                }`}
              >
                <span className="font-medium text-foreground">{labels.all}</span>
              </Button>
            </li>
          )}
          {units.map((unit) => {
            const selected = !allSelected && unit.id === active.id;
            return (
              <li key={unit.id}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  onClick={() => onSelect(unit.id)}
                  className={`h-auto w-full items-start justify-start gap-3 whitespace-normal border-l-4 px-3 py-3 text-left ${
                    selected ? "border-primary bg-primary/10" : "border-transparent hover:bg-secondary/70"
                  }`}
                >
                  <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{localize(unit, "nome")}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{unit.endereco}</span>
                    {selected && <span className="mt-1 block text-xs font-semibold text-primary">{labels.viewMenu}</span>}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              key={active.id}
              title={`${labels.title} — ${localize(active, "nome")}`}
              src={mapsEmbed(active.endereco)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full border-0 md:h-64"
            />
          </div>
          <a
            href={active.maps_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${active.endereco}, Macapá, AP`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" /> {labels.directions}
          </a>
        </div>
      </div>
    </section>
  );
};

export default UnitMap;
