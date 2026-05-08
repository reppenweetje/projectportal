import Link from "next/link";
import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";

export function ScarcityStrip({ project }: { project: Project }) {
  const counts = countByStatus(project);
  const sellable = project.totalUnits - counts.coming_soon;
  const stillAvailable = counts.available + counts.in_optie;
  // "Verkocht" telt strikt: alleen daadwerkelijk verkochte units. Verkocht
  // onder voorbehoud blijft buiten dit percentage.
  const soldPct = Math.round((counts.sold / sellable) * 100);

  return (
    <div className="bg-repp-navy text-white">
      <div className="mx-auto max-w-6xl px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          <span className="font-bold text-repp-yellow inline-flex items-center gap-2 mr-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-repp-yellow animate-pulse" />
            De verkoop gaat snel.
          </span>

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
            label={`Nog ${stillAvailable} van ${sellable} beschikbaar`}
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
