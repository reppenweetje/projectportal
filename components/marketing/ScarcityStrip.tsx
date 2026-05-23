import Link from "next/link";
import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";

export function ScarcityStrip({ project }: { project: Project }) {
  const counts = countByStatus(project);
  // Denominator = totaal (14), niet sellable (12). Coming-soon units
  // tellen mee in "X van Y" want bezoekers willen de totaalcapaciteit
  // zien; sold-pct blijft over sellable zodat percentage realistisch
  // blijft (anders nooit 100% want coming_soon zit in noemer).
  const sellable = project.totalUnits - counts.coming_soon;
  const stillAvailable = counts.available + counts.in_optie;
  const soldPct = Math.round((counts.sold / sellable) * 100);
  const totalUnits = project.totalUnits;

  return (
    <div className="bg-repp-navy text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-2.5">
        {/* Mobile: compact one-liner with one chip */}
        <div className="flex md:hidden items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-repp-yellow min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-repp-yellow animate-pulse shrink-0" />
            <span className="truncate">
              {soldPct}% verkocht · nog {stillAvailable} vrij
            </span>
          </span>
          <Link
            href={`/${project.slug}/units`}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-repp-yellow text-repp-navy font-bold text-[11px]"
          >
            Bekijk →
          </Link>
        </div>

        {/* Desktop: 3 chips, linksgealigned (zonder "De verkoop gaat snel"-
            lead-in want die concurreert met de gele banner-message erboven). */}
        <div className="hidden md:flex flex-wrap items-center gap-2 text-sm">
          <Chip
            href={`/${project.slug}/units`}
            label={`Al ${soldPct}% verkocht`}
          />
          <Chip
            href={`/${project.slug}/prijs`}
            label="Scherpste prijs Waarderpolder"
          />
          <Chip
            href={`/${project.slug}/units`}
            label={`Nog ${stillAvailable} van ${totalUnits} beschikbaar`}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-repp-yellow hover:text-repp-navy text-white/95 font-semibold border border-white/15 hover:border-repp-yellow transition"
    >
      <span>{label}</span>
      <span className="text-repp-yellow group-hover:text-repp-navy transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
