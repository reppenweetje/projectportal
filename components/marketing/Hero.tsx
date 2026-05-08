import Link from "next/link";
import type { Project } from "@/lib/types";

export function Hero({ project }: { project: Project }) {
  return (
    <section className="relative bg-hofman-deep text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-repp-navy via-hofman-deep to-black opacity-90" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-repp-yellow text-sm font-semibold uppercase tracking-wider">
            {project.city} · Waarderpolder
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            {project.name}
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-white/90">
            {project.tagline}
          </p>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl">
            14 hoogwaardige bedrijfsunits aan de A. Hofmanweg. Een eigen pand op
            een toplocatie, voor wie vooruitkijkt en voor wie investeert in
            schaarste.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${project.slug}#units`}
              className="inline-flex items-center bg-repp-yellow text-repp-navy font-semibold px-5 py-3 rounded-md hover:brightness-95 transition"
            >
              Bekijk beschikbare units
            </Link>
            <Link
              href={`/${project.slug}#calculator`}
              className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-md transition"
            >
              Bereken je maandlast
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <span>v.o.n. zonder overdrachtsbelasting</span>
            <span>·</span>
            <span>BTW terugvorderbaar</span>
            <span>·</span>
            <span>Inclusief nuts &amp; parkeerplaats</span>
          </div>
        </div>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-white/5 grid place-items-center">
          <div className="text-white/40 text-sm">
            [Foto/render De Hofman bij avond]
          </div>
          <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur rounded px-3 py-2 text-xs text-white/80">
            Impressie. Aan afbeelding kunnen geen rechten worden ontleend.
          </div>
        </div>
      </div>
    </section>
  );
}
