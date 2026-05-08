import type { Project } from "@/lib/types";

const features = [
  { titel: "3 minuten", body: "naar de A9 via de A200" },
  { titel: "20 minuten", body: "naar Amsterdam, Schiphol of de Zuidas" },
  { titel: "Aan het water", body: "naast groen en sportvoorzieningen" },
  { titel: "OV op loopafstand", body: "Station Spaarnwoude + R-net buslijnen" },
  { titel: "Eigen parkeerplaats", body: "+ ruim gratis parkeren in de straat" },
  { titel: "Glasvezel + bewaakt", body: "via Parkmanagement Waarderpolder" },
];

export function Locatie({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-extrabold text-repp-navy tracking-tight">
          {project.address}
        </h3>
        <p className="mt-2 text-repp-navy/70">
          Waarderpolder: het grootste bedrijventerrein van Zuid-Kennemerland.
          Ruim 1.000 bedrijven, 14.000 banen, professioneel beheerd.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((f) => (
          <div
            key={f.titel}
            className="rounded-2xl border border-repp-gray bg-white p-5"
          >
            <p className="text-lg font-bold text-repp-navy">{f.titel}</p>
            <p className="text-sm text-repp-navy/60 mt-1">{f.body}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-repp-gray bg-surface-muted aspect-[16/9] grid place-items-center text-repp-navy/40 text-sm">
        [Kaart Waarderpolder volgt; Mapbox/Google Maps embed]
      </div>
    </div>
  );
}
