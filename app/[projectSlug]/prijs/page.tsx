import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { formatEuro, formatM2 } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { PriceComparisonChart } from "@/components/marketing/PriceComparisonChart";
import { LeadGate } from "@/components/conversion/LeadGate";

const REPRESENTATIVE_M2 = 105;

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Scherpste prijs van de Waarderpolder",
};

export default async function PrijsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const cheapestHofman = Math.min(
    ...project.prijsBenchmarks.filter((b) => b.isHofman).map((b) => b.pricePerM2),
  );
  const cheapestRest = Math.min(
    ...project.prijsBenchmarks.filter((b) => !b.isHofman).map((b) => b.pricePerM2),
  );
  const savingsPerM2 = cheapestRest - cheapestHofman;
  const savingsLUnit = savingsPerM2 * REPRESENTATIVE_M2;

  return (
    <>
      <Header project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-12 md:pt-20 pb-8 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Waar voor je geld
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              De scherpste prijs van
              <br className="hidden md:inline" />{" "}
              de Waarderpolder.
            </h1>
            <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
              Hieronder de daadwerkelijke prijzen per m² van vergelijkbare
              bedrijfsunits in de buurt. De Hofman zit consequent onder het
              marktniveau.
            </p>
          </div>
        </section>

        <LeadGate
          gateContext="prijs"
          title="Toegang tot de prijsvergelijking"
          description="Vul je gegevens in om de prijzen per m², de concrete besparing en alle voordelen van De Hofman te zien."
        >
          {/* The real comparison chart */}
          <section className="px-5">
            <div className="mx-auto max-w-4xl">
              <PriceComparisonChart benchmarks={project.prijsBenchmarks} />
            </div>
          </section>

          {/* The savings — big number */}
          <section className="px-5 mt-10">
            <div className="mx-auto max-w-4xl rounded-3xl bg-repp-yellow/15 border-2 border-repp-yellow/40 p-6 md:p-10 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-repp-navy font-semibold">
                Dat scheelt concreet
              </p>
              <p className="mt-3 text-5xl md:text-7xl font-extrabold text-repp-navy tracking-tight tabular-nums">
                €{savingsPerM2}/m²
              </p>
              <p className="mt-3 text-repp-navy/80 max-w-xl mx-auto">
                Bij een L-unit van {formatM2(REPRESENTATIVE_M2)} houd je daarmee{" "}
                <span className="font-bold text-repp-navy">
                  {formatEuro(savingsLUnit)}
                </span>{" "}
                direct in je eigen vermogen, in plaats van in de aankoopprijs.
              </p>
            </div>
          </section>

          {/* What you get on top */}
          <section className="px-5 mt-12">
            <div className="mx-auto max-w-4xl">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold mb-5">
                Bovendien al inbegrepen
              </p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Perk title="V.o.n." body="Geen 10,4% overdrachtsbelasting" />
                <Perk
                  title="BTW-teruggave"
                  body="21% volledig terug bij zakelijk gebruik of verhuur"
                />
                <Perk
                  title="Nutsaansluitingen"
                  body="Niet apart te betalen, anders €3-5k extra"
                />
                <Perk
                  title="Parkeerplaats"
                  body="1 eigen plek voor de deur"
                />
              </ul>
            </div>
          </section>
        </LeadGate>

        {/* Calculator teaser */}
        <section className="px-5 mt-16 mb-20">
          <div className="mx-auto max-w-4xl rounded-3xl bg-surface-muted border border-repp-gray p-8 md:p-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Voor jouw situatie
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
              Reken het uit voor jezelf.
            </h2>
            <p className="mt-3 text-repp-navy/70 max-w-xl mx-auto">
              Vul je huidige huur of beoogde inbreng in. Je ziet direct wat een
              eigen pand jou per maand kost en wat je per jaar overhoudt.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${project.slug}/bereken?modus=ondernemer`}
                className="inline-flex items-center bg-repp-navy text-white font-bold px-6 py-3.5 rounded-full hover:bg-repp-blue transition"
              >
                Bereken maandlast →
              </Link>
              <Link
                href={`/${project.slug}/bereken?modus=belegger`}
                className="inline-flex items-center text-repp-navy hover:text-repp-blue font-semibold px-4 py-3.5"
              >
                Bereken rendement →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
    </>
  );
}

function Perk({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl bg-white border border-repp-gray p-4">
      <p className="font-bold text-repp-navy text-sm">✓ {title}</p>
      <p className="text-xs text-repp-navy/60 mt-1 leading-relaxed">{body}</p>
    </li>
  );
}
