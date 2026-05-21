import type { Project } from "@/lib/types";

// project-prop blijft voor toekomst (per-project USP-set), nu nog ongebruikt.

/**
 * USPHighlights — bullet-grid met de belangrijkste USPs direct na de hero
 * banner. Geeft bezoekers in 1 oogopslag de redenen om verder te lezen.
 *
 * Per user-feedback PDF Feedback Landingspagina item 2: "Misschien is het
 * een idee om na de banner direct bulletpoints met USP's te benoemen,
 * zodat de bezoeker direct meer info heeft over het project."
 *
 * USPs gebaseerd op De Hofman project-data + scarpe verkoopargumenten.
 * Toekomstig: USPs naar lib/projects/<slug>.ts verplaatsen zodat ze per
 * project verschillen.
 */

type USP = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

function USPSet(): USP[] {
  return [
    {
      icon: <CheckIcon />,
      title: "v.o.n. zonder overdrachtsbelasting",
      body: "Geen 10,4% extra koopkosten. Direct €25.000+ besparing op een L-unit.",
    },
    {
      icon: <CheckIcon />,
      title: "Toplocatie Waarderpolder",
      body: "Direct aan de A. Hofmanweg, vlak naast A9 en A200. Vijf minuten van Haarlem-centrum.",
    },
    {
      icon: <CheckIcon />,
      title: "Eigen parkeerplaats",
      body: "Eén plek per unit, voor de deur. Geen vergunningen of gedoe met laden en lossen.",
    },
    {
      icon: <CheckIcon />,
      title: "Plug-and-play opgeleverd",
      body: "Nutsaansluitingen al inbegrepen. Geen extra €3-5k aan installatie achteraf.",
    },
    {
      icon: <CheckIcon />,
      title: "Oplevering Q3 2027",
      body: "Bouwvergunning rond, casco eind 2026 klaar. Binnen 18 maanden in je eigen pand.",
    },
    {
      icon: <CheckIcon />,
      title: "Vanaf €239.500",
      body: "Scherpste prijs per m² in de Waarderpolder. L-unit van 105 m² incl. parkeerplaats.",
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function USPHighlights({ project }: { project: Project }) {
  const usps = USPSet();
  return (
    <section className="bg-surface-muted py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Waarom De Hofman
          </p>
          <h2 className="mt-2 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
            Zes redenen om vandaag te kiezen.
          </h2>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4">
          {usps.map((usp) => (
            <li
              key={usp.title}
              className="flex gap-3 items-start rounded-xl bg-white border border-repp-gray px-4 py-3 md:p-5"
            >
              <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-repp-navy text-white grid place-items-center">
                {usp.icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-repp-navy text-sm md:text-[15px] leading-tight">
                  {usp.title}
                </p>
                <p className="mt-1 text-[13px] md:text-sm text-repp-navy/70 leading-snug">
                  {usp.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 md:w-5 md:h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
