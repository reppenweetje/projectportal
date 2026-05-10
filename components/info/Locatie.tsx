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
  const fullAddress = `${project.address}, ${project.city}`;
  const mapQuery = encodeURIComponent(fullAddress);
  const embedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  const openMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

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

      <div>
        <div className="rounded-2xl border border-repp-gray overflow-hidden bg-repp-gray/30 aspect-[16/9] relative">
          <iframe
            src={embedUrl}
            title={`Kaart van ${fullAddress}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-repp-navy text-white font-semibold px-4 py-2 rounded-full hover:bg-repp-blue transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Routebeschrijving
          </a>
          <a
            href={openMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-repp-navy hover:text-repp-blue font-semibold"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </div>
  );
}
