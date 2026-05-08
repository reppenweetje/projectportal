import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";

export function ScarcityBar({ project }: { project: Project }) {
  const counts = countByStatus(project);
  const sellable = project.totalUnits - counts.coming_soon;
  const stillAvailable = counts.available + counts.in_optie;
  const soldPercent = Math.round((counts.sold / sellable) * 100);

  return (
    <div className="bg-repp-yellow text-repp-navy">
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-repp-navy animate-pulse" />
          <span>
            Nog <span className="font-extrabold">{stillAvailable}</span> van{" "}
            {sellable} units beschikbaar
          </span>
          <span className="hidden sm:inline text-repp-navy/70">
            · {soldPercent}% verkocht
          </span>
        </div>
        {counts.coming_soon > 0 && (
          <div className="text-repp-navy/80 text-xs sm:text-sm">
            {counts.coming_soon} XXL-units · binnenkort in verkoop
          </div>
        )}
      </div>
    </div>
  );
}
