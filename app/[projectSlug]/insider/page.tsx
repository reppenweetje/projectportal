import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { InsiderSignup } from "@/components/conversion/InsiderSignup";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Hofman Insider — als eerste op de hoogte",
};

export default async function InsiderPage({
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
        <section className="px-5 pt-12 md:pt-20 pb-8 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-repp-navy font-semibold bg-repp-yellow/30 px-3 py-1.5 rounded-full">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-repp-navy" />
              Hofman Insider
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Als eerste op de hoogte.
            </h1>
            <p className="mt-4 text-repp-navy/70 max-w-xl mx-auto">
              Geen verplichting, geen spam. Wij mailen je alleen als er iets
              speelt rond {project.name} dat voor jou relevant is.
            </p>
          </div>
        </section>

        <section className="px-5 mt-6 mb-12">
          <div className="mx-auto max-w-3xl">
            <ul className="grid sm:grid-cols-2 gap-3">
              <Benefit
                title="Statuswijzigingen"
                body="Komt een unit weer vrij omdat een reservering afvalt? Jij hoort het direct."
              />
              <Benefit
                title="Start XXL-verkoop"
                body="Zodra de XXL-units in actieve verkoop gaan krijgen Insiders voorrang."
              />
              <Benefit
                title="Prijsindexaties"
                body="Voor De Hofman of vergelijkbare nieuwbouw in de Waarderpolder."
              />
              <Benefit
                title="Bouwupdates"
                body="Mijlpalen en een korte stand van zaken zodra de bouw start."
              />
            </ul>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl bg-white border border-repp-gray p-6 md:p-10 shadow-xl shadow-repp-navy/5">
              <InsiderSignup
                project={project}
                variant="full"
                source="insider-page"
              />
            </div>
            <p className="mt-4 text-[11px] text-repp-navy/45 text-center leading-relaxed">
              Door je in te schrijven ga je akkoord dat we je gegevens gebruiken
              om je relevante updates te sturen over {project.name}. Uitschrijven
              kan altijd via een link in iedere mail.
            </p>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} showReserve={false} />
    </>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-repp-gray bg-white p-5">
      <p className="font-bold text-repp-navy text-sm">✓ {title}</p>
      <p className="mt-1 text-xs text-repp-navy/65 leading-relaxed">{body}</p>
    </li>
  );
}
