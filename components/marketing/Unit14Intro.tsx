import Image from "next/image";
import Link from "next/link";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  UNIT14_IMAGE,
} from "@/lib/site-config";
import { Unit14SpecList } from "@/components/unit/Unit14Specs";

/** "Dit is unit 14": beeld links, tekst en specs rechts. */
export function Unit14Intro() {
  return (
    <section className="px-5 py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <figure className="overflow-hidden rounded-2xl border border-repp-gray bg-surface-muted">
          <Image
            src={UNIT14_IMAGE}
            alt="Vooraanzicht van XXL unit 14 met grote glasgevel en eigen entree aan de A. Hofmanweg"
            width={1840}
            height={1081}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-auto"
          />
        </figure>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Unit 14
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            De XXL op de kop van het blok
          </h2>
          <p className="mt-4 text-repp-navy/75 leading-relaxed">
            Werkplaats en opslag op de begane grond, kantoor of showroom op de
            eerste en tweede verdieping, en een eigen dakterras van 42,5 m²
            bovenop. Grote glasgevel en eigen entree aan de A. Hofmanweg.
          </p>
          <div className="mt-6">
            <Unit14SpecList tone="light" />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <Link
              href={PRIMARY_CTA_HREF}
              data-cta="unit14"
              className="inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
            >
              {PRIMARY_CTA_LABEL}
            </Link>
            <Link
              href="/xxl"
              className="text-sm font-semibold text-repp-navy/80 hover:text-repp-navy"
            >
              Alle details van unit 14 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
