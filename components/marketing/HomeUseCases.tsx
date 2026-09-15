import { XxlUseCases } from "./XxlUseCases";

/**
 * "Zo kun je unit 14 inrichten": hergebruikt de use-case-carrousel van /xxl,
 * zodat een ondernemer zichzelf in de unit ziet zitten. Zelfde sectie-opbouw
 * als de rest van de homepage, tekst gecentreerd.
 */
export function HomeUseCases() {
  return (
    <section className="px-5 py-16 md:py-20 bg-surface-muted">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
          Voor wie is unit 14?
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
          Zo kun je unit 14 inrichten.
        </h2>
        <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto text-center">
          Drie lagen plus een eigen dakterras bieden alle ruimte. Deze
          voorbeelden laten zien hoe je de unit kunt indelen: van werkplaats en
          opslag tot showroom, studio of kantoor.
        </p>
        <XxlUseCases />
      </div>
    </section>
  );
}
