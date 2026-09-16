import Link from "next/link";
import type { Project } from "@/lib/types";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  SECONDARY_CTA_HREF,
  SECONDARY_CTA_LABEL,
} from "@/lib/site-config";

/**
 * USPHighlights: zes redenen om nu voor de XXL-unit te kiezen. Feitelijk,
 * zonder urgentietaal. Eindigt in de primaire CTA.
 */

type USP = { title: string; body: string };

const USPS: USP[] = [
  {
    title: "€ 475.000 v.o.n., inclusief parkeerplaats en nutsaansluitingen",
    body: "Eén prijs, geen verrassingen. Eigen parkeerplaats voor de deur en nutsaansluitingen zijn inbegrepen.",
  },
  {
    title: "Geen overdrachtsbelasting",
    body: "Nieuwbouw v.o.n. betekent geen 10,4% overdrachtsbelasting. Op € 475.000 is dat € 49.400 die je niet betaalt.",
  },
  {
    title: "Drie lagen en een dakterras",
    body: "Ca. 190 m² over drie verdiepingen, plus 42,5 m² eigen dakterras. Het grootste type in De Hofman, en er zijn er maar twee van.",
  },
  {
    title: "Aan de zichtzijde",
    body: "Op de kop van het blok, pal aan de A. Hofmanweg. Grote glasgevel en eigen entree. Dé plek als je bedrijf gezien mag worden.",
  },
  {
    title: "Toplocatie Waarderpolder",
    body: "Direct aan de A. Hofmanweg, vlak bij de A9 en A200. Vijf minuten van Haarlem-centrum.",
  },
  {
    title: "Verwachte oplevering Q3 2027",
    body: "Sloop afgerond, bouwstart oktober 2026. Plug-and-play opgeleverd.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function USPHighlights({ project }: { project: Project }) {
  return (
    <section className="bg-surface-muted py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Waarom deze XXL-unit
          </p>
          <h2 className="mt-2 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
            Zes redenen om nu te kiezen.
          </h2>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4">
          {USPS.map((usp) => (
            <li
              key={usp.title}
              className="flex gap-3 items-start rounded-xl bg-white border border-repp-gray px-4 py-3 md:p-5"
            >
              <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-repp-navy text-white grid place-items-center">
                <CheckIcon />
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
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="redenen"
            className="inline-flex items-center bg-repp-yellow text-repp-navy font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
          <Link
            href={SECONDARY_CTA_HREF}
            data-cta="redenen-sparren"
            className="text-sm font-semibold text-repp-navy/70 hover:text-repp-navy"
          >
            {SECONDARY_CTA_LABEL} →
          </Link>
        </div>
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
