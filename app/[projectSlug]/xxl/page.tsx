import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { XxlInterestForm } from "@/components/conversion/XxlInterestForm";
import { XxlTourVideo } from "@/components/marketing/XxlTourVideo";
import { XxlUseCases } from "@/components/marketing/XxlUseCases";
import { UnitGrid } from "@/components/unit/UnitGrid";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "XXL-units te koop · 3 lagen, 189,16 m² op één adres",
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
  const hero = {
    src: "/images/hofman/xxl/xxl-voorzijde-v3.jpg",
    alt: "Vooraanzicht van de XXL-unit met grote glasgevel en eigen entree aan de straatzijde",
  };

  return (
    <>
      <Header project={project} />
      <main className="flex-1 has-sticky-cta">
        {/* Hero met dezelfde hoogte als de homepage-hero (68vh) zodat de
            render als volwaardige banner in beeld staat; content blijft
            verticaal gecentreerd. min-h i.p.v. vaste hoogte zodat de content
            op kleine schermen nooit wordt afgeknipt. */}
        <section className="relative overflow-hidden bg-hofman-deep text-white flex flex-col justify-center min-h-[68vh]">
          {hero && (
            <div className="absolute inset-0">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center opacity-65"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-hofman-deep/40 via-hofman-deep/55 to-hofman-deep/90" />
            </div>
          )}
          {/* Symmetrische padding zodat de content verticaal in het midden van
              de band staat; de terug-link staat absoluut in de hoek en duwt de
              content dus niet meer omlaag. */}
          <div className="relative px-5 py-12 md:py-16">
            {/* Zelfde container-breedte als de header (max-w-6xl) zodat de
                terug-link exact uitlijnt met het REPP-logo erboven. */}
            <div className="absolute top-5 md:top-6 inset-x-0 z-10 pointer-events-none">
              <div className="mx-auto max-w-6xl px-4 sm:px-5">
                <Link
                  href={`/${project.slug}/units`}
                  className="pointer-events-auto text-sm text-white/70 hover:text-white inline-flex items-center gap-1"
                >
                  ← Alle units
                </Link>
              </div>
            </div>
            <div className="mx-auto max-w-5xl">
              <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold text-center">
                Nu te koop · {xxlUnits.length} units
              </p>
              <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-center">
                XXL-unit aan
                <br />
                de zichtzijde
              </h1>
              <p className="mt-5 text-lg md:text-xl text-white/85 font-light max-w-2xl mx-auto text-center">
                3 lagen, 189,16 m² op de kop van het blok, pal aan de zichtzijde
                van De Hofman. Werkplaats en opslag op de begane grond, kantoor
                of showroom op de eerste en tweede verdieping.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
                <Spec label="Begane grond" value="60,7 m²" />
                <Spec label="1e verdieping" value="60,7 m²" />
                <Spec label="2e verdieping" value="70 m²" />
                <Spec label="Dakterras" value="42,5 m²" />
                <Spec label="Vrije hoogte BG" value="3,69 m" />
              </div>
              <div className="mt-8 flex justify-center">
                <a
                  href="#interesse"
                  className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-6 py-3 rounded-full hover:brightness-95 transition shadow-lg"
                >
                  Interesse? Laat het weten →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Aan de zichtzijde: USP direct onder de banner */}
        <section className="px-5 py-16 md:py-20 bg-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
              De beste plek in het blok
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
              De enige units pal aan de voorzijde.
            </h2>
            <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto text-center">
              De XXL-units (7 en 14) staan op de koppen van het blok, direct aan
              de straatzijde. Een grote glasgevel, eigen entree en volop zicht
              vanaf de weg. Dé plek als je showroom, kantoor of merk gezien mag
              worden.
            </p>
            {/* De voorzijde-render nog een keer volledig in beeld (niet
                bijgesneden zoals in de banner), zodat de gevel goed te zien is. */}
            <figure className="mt-8 overflow-hidden rounded-2xl border border-repp-gray bg-white">
              <Image
                src={hero.src}
                alt={hero.alt}
                width={1840}
                height={1081}
                sizes="(max-width: 1024px) 100vw, 960px"
                className="w-full h-auto"
              />
            </figure>
            <div className="mt-8">
              <UnitGrid
                project={project}
                mode="link"
                highlightSlugs={["unit-7", "unit-14"]}
              />
              <p className="mt-3 text-center text-sm text-repp-navy/60">
                De XXL-units 7 en 14 liggen op de koppen van het blok, pal aan de
                A. Hofmanweg-zijde.
              </p>
            </div>
          </div>
        </section>

        {/* Why XXL */}
        <section className="px-5 py-16 md:py-20 bg-surface-muted">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
              Wat de XXL anders maakt
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
              Werkplaats, kantoor en opslag op één adres.
            </h2>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                title="Aan de zichtzijde"
                body="Op de kop van het blok, pal aan de A. Hofmanweg. Volop zicht vanaf de weg. Dé plek voor showroom of merkzichtbaarheid."
              />
              <Card
                title="3 lagen, 189,16 m²"
                body="Werkplaats &amp; opslag op de begane grond, kantoor of showroom op de eerste en tweede verdieping."
              />
              <Card
                title="Een hele extra verdieping"
                body="70 m² extra op de tweede verdieping, bovenop je werkvloer. Ruimte voor kantoor, vergaderen of extra opslag."
              />
              <Card
                title="Eigen dakterras"
                body="Een eigen dakterras van 42,5 m² bovenop de unit, met vrij uitzicht over de Waarderpolder."
              />
              <Card
                title="Koppelbaar"
                body="Units 7 en 14 zijn samen te koppelen: 121,4 m² begane grond, 121,4 m² eerste verdieping, 140 m² tweede verdieping en 85 m² dakterras."
              />
              <Card
                title="Beperkt aanbod"
                body="Slechts 2 XXL-units in heel De Hofman: Unit 7 en Unit 14, op de uiteinden van het blok."
              />
            </ul>
            <div className="mt-10 flex justify-center">
              <a
                href="#interesse"
                className="inline-flex items-center bg-repp-navy text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-repp-blue transition"
              >
                Interesse in een XXL? →
              </a>
            </div>
          </div>
        </section>

        {/* Digitale rondleiding */}
        <section className="px-5 py-16 md:py-20 bg-hofman-deep text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold text-center">
              Digitale rondleiding
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight text-center">
              Loop virtueel door de XXL-unit.
            </h2>
            <p className="mt-3 text-white/75 max-w-2xl mx-auto text-center">
              Bekijk de 3 lagen, de vrije hoogtes en de indeling in één
              vloeiende tour, zonder een afspraak te maken.
            </p>
            <XxlTourVideo />
          </div>
        </section>

        {/* Voor wie: use-cases in een carrousel */}
        <section className="px-5 py-16 md:py-20 bg-surface-muted">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold text-center">
              Voor wie is de XXL?
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight text-center">
              Zo kun je de XXL inrichten.
            </h2>
            <p className="mt-3 text-repp-navy/70 max-w-2xl mx-auto text-center">
              3 lagen plus een eigen dakterras bieden alle ruimte. Deze
              voorbeelden laten zien hoe je de unit kunt indelen: van werkplaats
              en opslag tot showroom, studio of kantoor.
            </p>
            <XxlUseCases />
          </div>
        </section>

        {/* Form */}
        <section id="interesse" className="px-5 py-12 md:py-16 bg-white scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                Aanmelden
              </p>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
                Interesse in een XXL?
              </h2>
              <p className="mt-3 text-repp-navy/70 max-w-xl mx-auto">
                De XXL-units zijn nu te koop. Vul je voorkeur in, dan nemen we
                contact op om jouw scenario door te spreken.
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
    <div className="text-center">
      <p className="text-xs md:text-[13px] uppercase tracking-wider text-white/60 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-lg md:text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3 items-start rounded-2xl bg-white border border-repp-gray shadow-sm px-5 py-4 md:p-6">
      <div className="shrink-0 w-8 h-8 rounded-full bg-repp-navy text-white grid place-items-center">
        <CheckIcon />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-repp-navy leading-tight">{title}</p>
        <p
          className="mt-1 text-sm text-repp-navy/70 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
