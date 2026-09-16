import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  SECONDARY_CTA_HREF,
  SECONDARY_CTA_LABEL,
  UNIT14_IMAGE,
  XXL_AREA_LABEL,
  XXL_PRICE,
} from "@/lib/site-config";

/**
 * Homepage-hero. Zelfde opbouw als de hero op /xxl: beeld boven
 * hofman-deep met gradient, content gecentreerd. Het vooraanzicht van
 * de XXL-unit is een lichte render (witte lucht, grijze gevel), dus de
 * verdonkering is iets zwaarder dan op /xxl om de witte tekst leesbaar
 * te houden. Eén boodschap, één primaire knop en de vier feiten waar een
 * koper als eerste naar kijkt. Verdiepende links (plattegrond, calculators)
 * staan verderop op de pagina, niet in de hero. De schaarste staat al in
 * de sitebrede status-banner, dus hier geen extra chip.
 */
export function MinimalHero({ project }: { project: Project }) {
  return (
    <section className="relative overflow-hidden bg-hofman-deep text-white flex flex-col justify-center min-h-[68vh]">
      <div className="absolute inset-0">
        <Image
          src={UNIT14_IMAGE}
          alt="Vooraanzicht van de laatste unit van De Hofman, een XXL met grote glasgevel en eigen entree"
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
            Een XXL van {XXL_AREA_LABEL} over 3 lagen, op de kop van het blok
            aan de zichtzijde van de Waarderpolder.
          </p>

          {/* De vier dingen waar een koper als eerste naar zoekt: prijs,
              oppervlakte, wat het bijzonder maakt en wanneer hij erin kan.
              Bewust geen extra links hier: alleen de knop en de sparren-link
              hieronder, zodat de hero rustig blijft. */}
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 max-w-3xl mx-auto">
            <Fact value={formatEuro(XXL_PRICE)} label="v.o.n., excl. btw" />
            <Fact value={XXL_AREA_LABEL} label="over 3 lagen" />
            <Fact value="42,5 m²" label="eigen dakterras" />
            <Fact value="Q3 2027" label="oplevering" />
          </dl>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <Link
              href={PRIMARY_CTA_HREF}
              data-cta="hero"
              className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-6 py-3 rounded-full hover:brightness-95 transition shadow-lg"
            >
              {PRIMARY_CTA_LABEL}
            </Link>
            <Link
              href={SECONDARY_CTA_HREF}
              data-cta="hero-sparren"
              className="text-sm font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline"
            >
              {SECONDARY_CTA_LABEL} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <dt className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/55 whitespace-nowrap">
        {label}
      </dt>
      <dd className="mt-1 text-xl md:text-2xl font-bold tracking-tight">
        {value}
      </dd>
    </div>
  );
}
