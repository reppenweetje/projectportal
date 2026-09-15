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
 * Homepage-hero. Zelfde opbouw als de hero op /xxl: beeld boven
 * hofman-deep met gradient, content gecentreerd. Het vooraanzicht van
 * unit 14 is een lichte render (witte lucht, grijze gevel), dus de
 * verdonkering is iets zwaarder dan op /xxl om de witte tekst leesbaar
 * te houden. Eén boodschap, één primaire knop. De schaarste staat al in
 * de sitebrede status-banner, dus hier geen extra chip.
 */
export function MinimalHero({ project }: { project: Project }) {
  return (
    <section className="relative overflow-hidden bg-hofman-deep text-white flex flex-col justify-center min-h-[68vh]">
      <div className="absolute inset-0">
        <Image
          src={UNIT14_IMAGE}
          alt="Vooraanzicht van XXL unit 14 van De Hofman met grote glasgevel en eigen entree"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hofman-deep/45 via-hofman-deep/50 to-hofman-deep/85" />
      </div>

      <div className="relative px-5 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold text-center">
            {project.name} · {project.city} · Waarderpolder
          </p>
          <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-center">
            Nog één unit
            <br />
            te koop
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/85 font-light max-w-2xl mx-auto text-center">
            XXL unit 14: {XXL_AREA_LABEL} over 3 lagen, op de kop van het blok
            aan de zichtzijde. {formatEuro(XXL_PRICE)} v.o.n., zonder
            overdrachtsbelasting.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/90">
            <Check>Vergunning onherroepelijk</Check>
            <Check>Sloop afgerond, bouwstart oktober 2026</Check>
            <Check>v.o.n. · btw terugvorderbaar</Check>
          </ul>

          <div className="mt-8 flex justify-center">
            <Link
              href={PRIMARY_CTA_HREF}
              data-cta="hero"
              className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-6 py-3 rounded-full hover:brightness-95 transition shadow-lg"
            >
              {PRIMARY_CTA_LABEL}
            </Link>
          </div>
          <div className="mt-3 text-center">
            <Link
              href="/units"
              className="text-sm font-semibold text-white/80 hover:text-white"
            >
              Bekijk de plattegrond →
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-white/70">
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
