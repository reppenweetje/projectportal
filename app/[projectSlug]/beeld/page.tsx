import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { USE_CASES } from "@/lib/use-cases";
import type { ProjectImage } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ImageGrid } from "@/components/marketing/ImageGrid";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/site-config";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Zo wordt het: alle impressies",
  description:
    "Alle impressies van De Hofman op één pagina: het gebouw buiten, de laatste XXL-unit en voorbeelden van hoe je de drie lagen kunt inrichten.",
  alternates: { canonical: "/beeld" },
};

export default async function BeeldPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  // Het gebouw en de unit komen uit de projectdata, de invullingen uit de
  // use-cases. Dedupe op src, want een paar beelden staan in allebei.
  const gebouw = [...project.gallery].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );
  const gebouwSrcs = new Set(gebouw.map((i) => i.src));
  const invullingen: ProjectImage[] = USE_CASES.filter(
    (u) => !gebouwSrcs.has(u.src),
  ).map((u) => ({ src: u.src, alt: u.alt, caption: u.title }));

  return (
    <>
      <Header project={project} />
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-12 md:pt-20 pb-10 md:pb-12 bg-white">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Zo wordt het
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Alle impressies op een rij
            </h1>
            <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
              Tik op een beeld voor een grotere weergave. {gebouw.length +
                invullingen.length}{" "}
              impressies van het gebouw, de laatste unit en hoe je de drie
              lagen kunt indelen.
            </p>
          </div>
        </section>

        <section className="px-5 py-12 md:py-16 bg-surface-muted">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight text-center mb-8">
              Het gebouw en de unit
            </h2>
            <ImageGrid images={gebouw} />
          </div>
        </section>

        <section className="px-5 py-12 md:py-16 bg-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight text-center mb-8">
              Zo kun je de unit inrichten
            </h2>
            <ImageGrid images={invullingen} />
          </div>
        </section>

        <section className="px-5 py-14 md:py-16 bg-surface-muted">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
              Zie je het voor je?
            </h2>
            <p className="mt-3 text-repp-navy/70">
              Er is nog één unit te koop: de XXL op de kop van het blok, ca.
              190 m² over drie lagen.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href={PRIMARY_CTA_HREF}
                data-cta="beeld"
                className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-6 py-3 rounded-full hover:brightness-95 transition"
              >
                {PRIMARY_CTA_LABEL}
              </Link>
            </div>
            <p className="mt-8 text-[11px] text-repp-navy/40">
              Impressies. Aan afbeeldingen kunnen geen rechten worden ontleend.
            </p>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
      <ExitIntentModal project={project} />
    </>
  );
}
