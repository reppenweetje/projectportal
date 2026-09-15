import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  UNIT14_IMAGE,
  XXL_AREA_LABEL,
  XXL_PRICE,
} from "@/lib/site-config";

/**
 * Homepage-hero. Eén boodschap, één primaire knop: unit 14. De schaarste
 * staat al in de sitebrede status-banner, dus hier geen extra chip.
 */
export function MinimalHero({ project }: { project: Project }) {
  return (
    <section className="relative">
      <div className="relative min-h-[68vh] sm:min-h-[520px] w-full overflow-hidden bg-hofman-deep flex flex-col">
        <Image
          src={UNIT14_IMAGE}
          alt="Vooraanzicht van XXL unit 14 van De Hofman met grote glasgevel en eigen entree"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hofman-deep/40 via-hofman-deep/55 to-hofman-deep/90" />

        <div className="relative flex-1 flex flex-col justify-end">
          <div className="px-5 pt-16 pb-8 sm:pb-14 md:pb-20">
            <div className="mx-auto max-w-5xl">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                {project.name} · {project.city} · Waarderpolder
              </p>
              <h1 className="mt-2 text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[0.98] tracking-tight">
                Nog één unit te koop
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-xl md:text-2xl text-white/85 font-light max-w-2xl">
                XXL unit 14: {XXL_AREA_LABEL} over 3 lagen, op de kop van het
                blok aan de zichtzijde. {formatEuro(XXL_PRICE)} v.o.n., zonder
                overdrachtsbelasting.
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-white/90">
                <Check>Vergunning onherroepelijk</Check>
                <Check>Sloop afgerond, bouwstart oktober 2026</Check>
                <Check>v.o.n. · btw terugvorderbaar</Check>
              </ul>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <Link
                  href={PRIMARY_CTA_HREF}
                  data-cta="hero"
                  className="inline-flex items-center justify-center bg-repp-yellow text-repp-navy text-sm sm:text-base font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
                >
                  {PRIMARY_CTA_LABEL}
                </Link>
                <Link
                  href="/units"
                  className="inline-flex items-center justify-center sm:justify-start text-sm font-semibold text-white/85 hover:text-white"
                >
                  Bekijk de plattegrond →
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-white/70">
                <span>Eerst rekenen?</span>
                <Link
                  href="/bereken?modus=ondernemer"
                  className="font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline"
                >
                  Voor mijn bedrijf →
                </Link>
                <Link
                  href="/bereken?modus=belegger"
                  className="font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline"
                >
                  Als belegging →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 shrink-0 text-repp-yellow"
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
