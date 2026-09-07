import Link from "next/link";
import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";

/**
 * LastUnitBanner — grote oranje banner bovenaan de homepage zodra er nog
 * maar één of enkele units te koop zijn. Copy volgt de live unitstatus:
 * verdwijnt vanzelf als alles is vergeven.
 */
export function LastUnitBanner({ project }: { project: Project }) {
  const counts = countByStatus(project);
  const available = project.units.filter((u) => u.status === "available");
  if (available.length === 0) return null;

  const sold = counts.sold + counts.verkocht_ovb;
  const last = available.length === 1 ? available[0] : null;
  const allXxl = available.every((u) => u.type === "XXL");

  const title =
    available.length === 1
      ? "Nog maar 1 unit te koop"
      : `Nog maar ${available.length} units te koop`;

  const subtitle = last
    ? `De laatste ${last.type}-unit: unit ${last.number}, ${
        last.type === "XXL" ? "ca. 190 m² over 3 lagen, " : ""
      }pal aan de zichtzijde van De Hofman.`
    : allXxl
      ? "De laatste XXL-units, pal aan de zichtzijde van De Hofman."
      : "De laatste units van De Hofman.";

  const primaryHref = allXxl ? `/${project.slug}/xxl` : `/${project.slug}/units`;
  const primaryLabel = last
    ? `Bekijk de laatste ${last.type} →`
    : "Bekijk de laatste units →";

  return (
    <section
      className="bg-hofman-orange text-repp-navy"
      aria-label="Laatste unit te koop"
    >
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="flex-1 min-w-0">
          <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-repp-navy animate-pulse" />
            Laatste kans · {sold} van {project.totalUnits} verkocht
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.95] tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-lg md:text-2xl font-semibold leading-snug">
            {subtitle}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base font-bold">
            <li className="inline-flex items-center gap-1.5">
              <Check /> Vergunning onherroepelijk
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check /> Sloop en bouw gestart
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check /> Levering v.o.n., BTW terugvorderbaar
            </li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center bg-repp-navy text-white font-bold px-7 py-4 rounded-full hover:bg-repp-blue transition text-center"
          >
            {primaryLabel}
          </Link>
          <Link
            href={`/${project.slug}/units`}
            className="inline-flex items-center justify-center border-2 border-repp-navy text-repp-navy font-bold px-7 py-4 rounded-full hover:bg-repp-navy hover:text-white transition text-center"
          >
            Alle units →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
