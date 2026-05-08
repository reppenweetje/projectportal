import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { CalculatorTabs } from "@/components/calculator/CalculatorTabs";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Bereken je maandlast of rendement",
};

export default async function BerekenPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  return (
    <>
      <Header project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-12 md:pt-20 pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                Reken het uit
              </p>
              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
                Is dit voor jou interessant?
              </h1>
              <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
                Schuif met de instellingen, kies een unit, zie je maandlast of
                rendement direct meeveranderen.
              </p>
            </div>
            <div className="mt-12">
              <Suspense fallback={null}>
                <CalculatorTabs project={project} />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
      <ExitIntentModal project={project} />
    </>
  );
}
