import Link from "next/link";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/site-config";
import { Unit14SpecList } from "@/components/unit/Unit14Specs";
import { Unit14Floors } from "./Unit14Floors";

/**
 * "Dit is de laatste unit": wat het is en wat je er kunt doen, in één sectie.
 * Eerst de specs, daarna de doorklik per verdieping. Zo leest een bezoeker
 * eerst wat hij koopt en ziet hij zich er meteen in zitten, zonder dat het
 * twee losse blokken worden.
 *
 * Bewust geen render van het pand hier: die staat al in de hero, één scherm
 * hoger. Twee paginabrede beelden onder elkaar leest te zwaar, dus het
 * enige beeld in deze sectie is de carrousel per verdieping.
 */
export function Unit14Intro() {
  return (
    <section className="px-5 py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
          De laatste unit
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
          De XXL op de kop van het blok
        </h2>
        <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto text-center">
          Werkplaats en opslag op de begane grond, kantoor of showroom op de
          eerste en tweede verdieping, en een eigen dakterras van 42,5 m²
          bovenop. Grote glasgevel en eigen entree aan de A. Hofmanweg.
        </p>

        <div className="mt-8">
          <Unit14SpecList tone="light" />
        </div>

        <Unit14Floors />

        <div className="mt-10 flex justify-center">
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
            Alle details van de laatste unit →
          </Link>
        </div>
      </div>
    </section>
  );
}
