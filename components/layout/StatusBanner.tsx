import Link from "next/link";
import {
  PRIMARY_CTA_HREF,
  SCARCITY_LINE,
  SCARCITY_LINE_SHORT,
  XXL_AREA_LABEL,
} from "@/lib/site-config";

/**
 * StatusBanner: sitebrede sticky strook boven de navigatie.
 *
 * Eén schaarste-element voor de hele site. Niet wegklikbaar, blijft staan
 * bij scrollen. Desktop: tekst links, ghost-knop rechts. Mobiel: alleen de
 * korte regel, de hele balk is één link. Hoogte 40 px mobiel, 44 px desktop
 * (zie .status-banner in globals.css; de header schuift daar onder).
 */
export function StatusBanner() {
  return (
    <div
      role="region"
      aria-label="Beschikbaarheid"
      // repp-blue (#1b23aa) boven de navy header: één blauw uit de huisstijl
      // dat als eigen strook leest, zonder extra scheidingslijn of gouden
      // rand.
      className="status-banner sticky top-0 z-40 w-full text-white bg-repp-blue"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Mobiel: hele balk is één link */}
      <Link
        href={PRIMARY_CTA_HREF}
        data-cta="banner"
        className="status-banner-inner flex md:hidden items-center justify-center gap-2 px-4"
      >
        <StatusDot />
        <span className="text-[13px] font-medium tracking-[0.01em]">
          {SCARCITY_LINE_SHORT} →
        </span>
      </Link>

      {/* Desktop: tekst links, ghost-knop rechts */}
      <div className="status-banner-inner hidden md:flex items-center justify-between gap-4 mx-auto max-w-6xl px-4 sm:px-5">
        <p className="flex items-center gap-2.5 text-[13px] lg:text-sm font-medium tracking-[0.01em] min-w-0 truncate">
          <StatusDot />
          <span className="truncate">
            {SCARCITY_LINE} · XXL-unit · {XXL_AREA_LABEL}
          </span>
        </p>
        <Link
          href={PRIMARY_CTA_HREF}
          data-cta="banner"
          className="shrink-0 inline-flex items-center h-7 px-3.5 rounded-full border border-white/70 text-white text-[12px] font-semibold leading-none hover:bg-white hover:text-repp-navy transition"
        >
          Bekijk de laatste unit →
        </Link>
      </div>
    </div>
  );
}

function StatusDot() {
  return (
    <span
      aria-hidden
      className="status-banner-dot inline-block w-2 h-2 rounded-full shrink-0 bg-repp-yellow"
    />
  );
}
