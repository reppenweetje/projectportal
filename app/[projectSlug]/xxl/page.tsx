import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { XxlInterestForm } from "@/components/conversion/XxlInterestForm";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "XXL-wachtlijst — wonen + werken op één adres",
};

export default async function XxlPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const xxlUnits = project.units.filter((u) => u.type === "XXL");
  const hero = project.gallery[0];

  return (
    <>
      <Header project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        {/* Hero */}
        <section className="relative overflow-hidden bg-hofman-deep text-white">
          {hero && (
            <div className="absolute inset-0">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-hofman-deep/60 via-hofman-deep/70 to-hofman-deep" />
            </div>
          )}
          <div className="relative px-5 pt-16 pb-14 md:pt-24 md:pb-20">
            <div className="mx-auto max-w-5xl">
              <Link
                href={`/${project.slug}/units`}
                className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1"
              >
                ← Alle units
              </Link>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold">
                Coming soon · {xxlUnits.length} units
              </p>
              <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                XXL-unit met
                <br />
                wonen + werken
              </h1>
              <p className="mt-5 text-lg md:text-xl text-white/85 font-light max-w-2xl">
                3 lagen, 191 m², op de hoek van het blok. Bedrijf op de begane
                grond en eerste verdieping, eventueel een bedrijfsgebonden
                woning op de tweede.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <Spec label="Begane grond" value="60,7 m²" />
                <Spec label="1e verdieping" value="60,7 m²" />
                <Spec label="2e verdieping" value="70 m² (woning)" />
                <Spec label="Vrije hoogte BG" value="3,69 m" />
                <Spec label="Vloerbelasting" value="1.000 kg/m²" />
              </div>
            </div>
          </div>
        </section>

        {/* Why XXL */}
        <section className="px-5 py-16 md:py-20 bg-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Wat de XXL anders maakt
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
              Bedrijf, kantoor en thuis op één adres.
            </h2>
            <ul className="mt-8 grid sm:grid-cols-3 gap-4">
              <Card
                title="3 lagen, 191 m²"
                body="Werkplaats &amp; opslag op de begane grond, kantoor of showroom op de eerste, woning op de tweede."
              />
              <Card
                title="Bedrijfsgebonden woning"
                body="We onderzoeken of wonen toegestaan is binnen het bestemmingsplan voor deze twee units. Reageer als je interesse hebt."
                accent
              />
              <Card
                title="Beperkt aanbod"
                body="Slechts 2 XXL-units in heel De Hofman: Unit 7 en Unit 14, op de uiteinden van het blok."
              />
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="px-5 py-12 md:py-16 bg-surface-muted">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                Wachtlijst
              </p>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
                Interesse in een XXL?
              </h2>
              <p className="mt-3 text-repp-navy/70 max-w-xl mx-auto">
                Vul je voorkeur in. Zodra de XXL-units in actieve verkoop gaan
                krijg jij als eerste bericht en voorrang voor jouw scenario.
              </p>
            </div>
            <Suspense fallback={null}>
              <XxlInterestForm project={project} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} showReserve={false} />
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
        {label}
      </p>
      <p className="mt-0.5 font-bold text-white">{value}</p>
    </div>
  );
}

function Card({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <li
      className={`rounded-2xl p-6 ${
        accent
          ? "bg-repp-yellow/15 border border-repp-yellow/40"
          : "bg-surface-muted border border-repp-gray"
      }`}
    >
      <p className="font-bold text-repp-navy">{title}</p>
      <p
        className="mt-2 text-sm text-repp-navy/70 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </li>
  );
}
