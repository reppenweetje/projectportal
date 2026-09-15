import Image from "next/image";
import Link from "next/link";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/site-config";
import { Unit14SpecList } from "@/components/unit/Unit14Specs";

/**
 * "Dit is unit 14": gecentreerde kop en tekst, daaronder het beeld op volle
 * breedte en de specs. Zelfde opbouw als de secties op /xxl.
 *
 * Beeld is bewust het dakterras en niet de voorgevel: die staat al in de
 * hero, twee schermen hoger.
 */
export function Unit14Intro() {
  return (
    <section className="px-5 py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
          Unit 14
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
          De XXL op de kop van het blok
        </h2>
        <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto text-center">
          Werkplaats en opslag op de begane grond, kantoor of showroom op de
          eerste en tweede verdieping, en een eigen dakterras van 42,5 m²
          bovenop. Grote glasgevel en eigen entree aan de A. Hofmanweg.
        </p>

        <figure className="mt-8 overflow-hidden rounded-2xl border border-repp-gray bg-surface-muted">
          <Image
            src="/images/hofman/xxl/xxl-dakterras.jpg"
            alt="Het eigen dakterras van XXL unit 14 met zitplek en uitzicht over de Waarderpolder"
            width={1840}
            height={1035}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="w-full h-auto"
          />
        </figure>

        <div className="mt-8">
          <Unit14SpecList tone="light" />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="unit14"
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-6 py-3 rounded-full hover:brightness-95 transition"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/xxl"
            className="text-sm font-semibold text-repp-navy/70 hover:text-repp-navy"
          >
            Alle details van unit 14 →
          </Link>
        </div>
      </div>
    </section>
  );
}
