import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { ReservationForm } from "@/components/conversion/ReservationForm";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Reserveer jouw unit",
};

export default async function ReserverenPage({
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
        <section className="px-5 pt-12 md:pt-16 pb-12">
          <div className="mx-auto max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-repp-navy font-semibold bg-status-available/15 px-3 py-1.5 rounded-full">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-available" />
              Geen kosten · Geen verplichting
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Zet jouw unit op naam
            </h1>
            <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
              Wij bellen je voor een persoonlijk gesprek. Pas daarna, als jij
              klaar bent, gaan we naar een officiële reservering. De 5%
              aanbetaling komt pas op het moment dat jij ja zegt.
            </p>
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="mx-auto max-w-5xl">
            <Suspense fallback={null}>
              <ReservationForm project={project} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} showReserve={false} />
    </>
  );
}
