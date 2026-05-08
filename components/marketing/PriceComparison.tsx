import type { Project } from "@/lib/types";

export function PriceComparison({ project }: { project: Project }) {
  const { marktPerM2Min, marktPerM2Max, eigenPerM2 } = project.prijsVergelijking;
  const savingsMin = marktPerM2Min - eigenPerM2;

  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      <div className="rounded-xl bg-repp-navy text-white p-6 md:p-8">
        <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
          Waar voor je geld
        </p>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold">
          Onder het nieuwbouwniveau van Haarlem.
        </h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-white/10 p-5">
            <p className="text-sm text-white/60">
              Vergelijkbare nieuwbouw Waarderpolder
            </p>
            <p className="mt-2 text-2xl font-bold text-white/70 line-through">
              €{marktPerM2Min.toLocaleString("nl-NL")} – €
              {marktPerM2Max.toLocaleString("nl-NL")} / m²
            </p>
            <p className="mt-3 text-xs text-white/50">
              Excl. nutsaansluitingen (~ €3.000 – €5.000 per unit).
            </p>
          </div>
          <div className="rounded-lg border-2 border-repp-yellow p-5 bg-white/5">
            <p className="text-sm text-repp-yellow font-semibold">
              {project.name}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white">
              €{eigenPerM2.toLocaleString("nl-NL")} / m²
            </p>
            <p className="mt-3 text-xs text-white/70">
              Inclusief nutsaansluitingen, eigen parkeerplaats en v.o.n.
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-white/80">
          Dat scheelt minimaal{" "}
          <span className="text-repp-yellow font-bold">
            €{savingsMin.toLocaleString("nl-NL")} per m²
          </span>{" "}
          ; bij een unit van 105 m² is dat ruim{" "}
          <span className="text-repp-yellow font-bold">
            €{(savingsMin * 105).toLocaleString("nl-NL")}
          </span>{" "}
          die in jouw eigen investering blijft zitten.
        </p>
      </div>
    </section>
  );
}
