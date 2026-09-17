import Link from "next/link";
import { Unit14Floors } from "./Unit14Floors";

/**
 * "Zo kun je de XXL-unit inrichten": per verdieping zien wat er kan, zodat een
 * ondernemer zichzelf in de unit ziet zitten. Tekst gecentreerd, zelfde
 * sectie-opbouw als de rest van de homepage.
 */
export function HomeUseCases() {
  return (
    <section className="px-5 py-14 md:py-16 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Voor wie is de XXL-unit?
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
            Zo kun je de XXL-unit inrichten.
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto">
            Klik door de drie lagen en zie wat er op elke verdieping kan, van
            werkplaats en opslag tot showroom, kantoor en het eigen dakterras.
          </p>
        </div>
        <Unit14Floors />

        {/* Eén ingang naar alle beelden: de rest van de impressies staat op
            een eigen pagina, zodat de homepage niet volloopt met beeld. */}
        <div className="mt-8 text-center">
          <Link
            href="/beeld"
            data-cta="beeld"
            className="inline-flex items-center rounded-full border border-repp-navy/20 px-5 py-2.5 text-sm font-semibold text-repp-navy hover:border-repp-navy hover:bg-white transition"
          >
            Bekijk alle impressies →
          </Link>
        </div>
      </div>
    </section>
  );
}
