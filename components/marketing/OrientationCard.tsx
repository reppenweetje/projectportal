import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";

export function OrientationCard({ project }: { project: Project }) {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-8">
      <div className="bg-surface-muted border border-repp-gray rounded-xl p-5 md:p-6">
        <p className="text-xs uppercase tracking-wider text-repp-blue font-semibold">
          Voor het eerst hier? In 30 seconden
        </p>
        <h2 className="mt-1 text-xl md:text-2xl font-bold text-repp-navy">
          Wat is {project.name}?
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-ink-soft">
          <li className="flex gap-2">
            <span className="text-repp-blue font-bold">01</span>
            <span>
              {project.totalUnits} nieuwe bedrijfsunits in de Waarderpolder,
              Haarlem. 3 minuten van de A9.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-repp-blue font-bold">02</span>
            <span>
              Drie types: L (105 m², {formatEuro(239500)}), XL (113 m²,{" "}
              {formatEuro(259500)}), XXL (191 m², vanaf {formatEuro(435000)}).
              Alle prijzen excl. BTW.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-repp-blue font-bold">03</span>
            <span>
              Voor eigen gebruik óf belegging. Reserveren via deze portal met 5%
              aanbetaling op de notarisrekening.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
