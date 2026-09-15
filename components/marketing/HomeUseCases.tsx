import Image from "next/image";
import { USE_CASES } from "@/lib/use-cases";
import { XxlUseCases } from "./XxlUseCases";

/**
 * "Zo kun je unit 14 inrichten": laat zien wat er met de drie lagen en het
 * dakterras kan, zodat een ondernemer zichzelf in de unit ziet zitten.
 *
 * Desktop toont alle invullingen tegelijk in een grid, met het dakterras als
 * brede afsluiter. Mobiel hergebruikt de swipe-carrousel van /xxl. Zelfde
 * patroon als de referenties: grid op groot, swipen op klein.
 */
export function HomeUseCases() {
  const grid = USE_CASES.slice(0, USE_CASES.length - 1);
  const wide = USE_CASES[USE_CASES.length - 1];

  return (
    <section className="px-5 py-16 md:py-24 bg-surface-muted">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Voor wie is unit 14?
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Zo kun je unit 14 inrichten.
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto">
            Drie lagen plus een eigen dakterras bieden alle ruimte. Deze
            voorbeelden laten zien hoe je de unit kunt indelen: van werkplaats
            en opslag tot showroom, studio of kantoor.
          </p>
        </div>

        {/* Desktop: alles in één keer in beeld */}
        <div className="hidden md:block mt-10">
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((uc) => (
              <li
                key={uc.src}
                className="overflow-hidden rounded-2xl border border-repp-gray bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={uc.src}
                    alt={uc.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 text-center">
                  <p className="font-bold text-repp-navy">{uc.title}</p>
                  <p className="mt-1 text-sm text-repp-navy/70 leading-relaxed">
                    {uc.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Dakterras als brede afsluiter */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-repp-gray bg-white">
            <div className="relative aspect-[21/9]">
              <Image
                src={wide.src}
                alt={wide.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <p className="font-bold text-repp-navy text-lg">{wide.title}</p>
              <p className="mt-1 text-sm text-repp-navy/70 max-w-2xl mx-auto leading-relaxed">
                {wide.body}
              </p>
            </div>
          </div>
        </div>

        {/* Mobiel: swipen door dezelfde invullingen */}
        <div className="md:hidden">
          <XxlUseCases />
        </div>
      </div>
    </section>
  );
}
