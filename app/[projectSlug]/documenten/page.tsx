import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { InfoTabs } from "@/components/info/InfoTabs";
import { FAQ } from "@/components/marketing/FAQ";
import { Documents } from "@/components/marketing/Documents";
import { Locatie } from "@/components/info/Locatie";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Alle documenten",
};

export default async function DocumentenPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const docCount = project.documents.length;

  return (
    <>
      <Header project={project} />
      <main className="flex-1 has-sticky-cta">
        {/* Quiet hero with a subtle accent */}
        <section className="relative overflow-hidden border-b border-repp-gray bg-surface-muted">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,15,112,1) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          <div className="relative px-5 pt-14 md:pt-20 pb-10 md:pb-14">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-baseline gap-3">
                <span className="inline-block w-1 h-8 rounded-full bg-repp-navy" />
                <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                  {project.name} · Voor jouw aankoop
                </p>
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
                Alle documenten
              </h1>
              <p className="mt-3 text-repp-navy/70 max-w-xl">
                {docCount} stukken, van de brochure tot de
                koop-aannemingsovereenkomst. Klik om te bekijken of te downloaden.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-10 md:py-14">
          <div className="mx-auto max-w-5xl">
            {/* Lijst is publiek, popup verschijnt pas bij klik op een
                document-kaart — zie Documents component voor de gate. */}
            <InfoTabs
              documenten={<Documents project={project} />}
              faq={<FAQ project={project} />}
              locatie={<Locatie project={project} />}
            />
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
    </>
  );
}
