import Link from "next/link";
import type { Project } from "@/lib/types";
import { countByStatus } from "@/lib/projects/de-hofman";
import { buildWhatsAppLink } from "@/lib/utils";

export function HomeOutro({ project }: { project: Project }) {
  const counts = countByStatus(project);
  const stillAvailable = counts.available;
  // Denominator = totaal (14), niet sellable. Coming-soon units tellen
  // mee in zicht-totaal want bezoeker wil scope van het project zien.
  const totalUnits = project.totalUnits;

  return (
    <section className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
          Niet zeker wat past?
        </p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
          Begin bij de units zelf.
        </h2>
        <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
          Nog {stillAvailable} van {totalUnits} units beschikbaar. Tik op de
          plattegrond om een snelle preview te zien. Dan beslis je of je
          verder kijkt.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${project.slug}/units`}
            className="inline-flex items-center bg-repp-navy text-white font-semibold px-6 py-3.5 rounded-full hover:bg-repp-blue transition"
          >
            Bekijk de plattegrond →
          </Link>
          <a
            href={buildWhatsAppLink(
              project.whatsAppNumber,
              `Hallo, ik heb een vraag over ${project.name}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-repp-navy hover:text-repp-blue text-sm font-semibold py-2"
          >
            Of WhatsApp ons direct →
          </a>
        </div>
      </div>
    </section>
  );
}
