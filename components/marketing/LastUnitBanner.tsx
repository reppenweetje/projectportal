import Link from "next/link";
import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";

/**
 * LastUnitBanner — oranje "laatste kans"-kaart bovenin de homepage-hero
 * zodra er nog maar één of enkele units te koop zijn. Zelfde vormtaal als
 * de rest van de site (afgeronde kaart, pill-knoppen, navy op accentkleur).
 * Copy volgt de live unitstatus en de kaart verdwijnt vanzelf bij 0.
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
    ? `De laatste ${last.type}-unit: unit ${last.number}${
        last.type === "XXL" ? ", ca. 190 m² over 3 lagen" : ""
      }, pal aan de zichtzijde.`
    : allXxl
      ? "De laatste XXL-units, pal aan de zichtzijde."
      : "De laatste units van De Hofman.";

  const primaryHref = allXxl ? `/${project.slug}/xxl` : `/${project.slug}/units`;
  const primaryLabel = last
    ? `Bekijk de laatste ${last.type} →`
    : "Bekijk de laatste units →";

  return (
    <div
      role="region"
      aria-label="Laatste unit te koop"
      className="rounded-2xl sm:rounded-3xl bg-hofman-orange text-repp-navy shadow-2xl shadow-black/30 ring-1 ring-white/20 p-5 sm:p-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
    >
      <div className="flex-1 min-w-0">
        <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold text-repp-navy/80">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-repp-navy animate-pulse" />
          Laatste kans · {sold} van {project.totalUnits} verkocht
        </p>
        <h2 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm sm:text-base md:text-lg font-medium text-repp-navy/85">
          {subtitle}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm font-semibold">
          <Chip>Vergunning onherroepelijk</Chip>
          <Chip>Sloop en bouw gestart</Chip>
          <Chip>v.o.n. · BTW terugvorderbaar</Chip>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center bg-repp-navy text-white text-sm sm:text-base font-bold px-6 py-3 sm:py-3.5 rounded-full hover:bg-repp-blue transition text-center"
        >
          {primaryLabel}
        </Link>
        <Link
          href={`/${project.slug}/units`}
          className="inline-flex items-center justify-center bg-white/25 border border-repp-navy/30 text-repp-navy text-sm sm:text-base font-bold px-6 py-3 sm:py-3.5 rounded-full hover:bg-white/40 transition text-center"
        >
          Alle units →
        </Link>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-repp-navy/10 px-3 py-1">
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {children}
    </li>
  );
}
