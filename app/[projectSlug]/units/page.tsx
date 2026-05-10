import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug, countByStatus } from "@/lib/projects/de-hofman";
import { formatEuro, formatM2, type Project } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { UnitGrid } from "@/components/unit/UnitGrid";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Alle units",
};

export default async function UnitsOverviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();
  const counts = countByStatus(project);
  const sellable = project.totalUnits - counts.coming_soon;

  return (
    <>
      <Header project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-12 md:pt-20 pb-12">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              {project.name} · Units
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Welke past bij jou?
            </h1>
            <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
              Nog {counts.available + counts.in_optie} van {sellable} beschikbaar.
              Tik op een unit voor specs en reservering.
            </p>
          </div>
        </section>

        <div className="px-5">
          <div className="mx-auto max-w-5xl">
            <UnitGrid project={project} />
          </div>
        </div>

        <UnitTypesSummary project={project} />
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
      <ExitIntentModal project={project} />
    </>
  );
}

function UnitTypesSummary({ project }: { project: Project }) {
  const types = [
    {
      label: "L",
      m2: 105,
      prijs: 239500,
      perks: ["2 lagen", "Vloerbelasting 1.000 kg/m²", "Overheaddeur 4 × 3,5 m"],
    },
    {
      label: "XL",
      m2: 113,
      prijs: 259500,
      perks: ["2 lagen", "Vloerbelasting 1.000 kg/m²", "Overheaddeur 4 × 3,5 m"],
    },
    {
      label: "XXL",
      m2: 191.4,
      prijs: 515500,
      perks: ["3 lagen", "Mogelijk met bedrijfsgebonden woning", "Binnenkort in verkoop"],
    },
  ];
  return (
    <section className="px-5 mt-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
          De drie types
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-repp-navy text-center tracking-tight">
          Ze schalen mee met jou.
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {types.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-repp-gray bg-white p-6"
            >
              <p className="text-5xl font-extrabold text-repp-navy">{t.label}</p>
              <p className="mt-2 text-sm text-repp-navy/60">{formatM2(t.m2)} bvo</p>
              <p className="mt-4 text-2xl font-bold text-repp-navy">
                {t.label === "XXL" ? "vanaf " : ""}
                {formatEuro(t.prijs)}
              </p>
              <p className="text-xs text-repp-navy/60">excl. btw</p>
              <ul className="mt-5 space-y-2 text-sm text-repp-navy/70">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="text-repp-blue">·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href={`/${project.slug}/bereken`}
            className="inline-flex items-center bg-repp-navy text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-repp-blue transition"
          >
            Bereken wat dit jou kost
          </Link>
        </div>
      </div>
    </section>
  );
}
