import { Unit14Floors } from "./Unit14Floors";

/**
 * "Zo kun je unit 14 inrichten": per verdieping zien wat er kan, zodat een
 * ondernemer zichzelf in de unit ziet zitten. Tekst gecentreerd, zelfde
 * sectie-opbouw als de rest van de homepage.
 */
export function HomeUseCases() {
  return (
    <section className="px-5 py-16 md:py-24 bg-surface-muted">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Voor wie is unit 14?
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Zo kun je unit 14 inrichten.
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto">
            Klik door de drie lagen en zie wat er op elke verdieping kan, van
            werkplaats en opslag tot showroom, kantoor en het eigen dakterras.
          </p>
        </div>
        <Unit14Floors />
      </div>
    </section>
  );
}
