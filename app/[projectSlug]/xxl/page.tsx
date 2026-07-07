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

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "XXL-units te koop — 3 lagen, 191 m² op één adres",
};

// XXL-specifieke renders (units 7 & 14): begane grond als werkplaats,
// verdiepingen als kantoor/showroom en het eigen dakterras. Geoptimaliseerd
// voor web in public/images/hofman/xxl/.
const xxlImages = [
  {
    src: "/images/hofman/xxl/xxl-werkplaats.jpg",
    alt: "Begane grond van de XXL-unit als werkplaats met gereedschapswand, werkbank en zicht op de polder",
    caption: "Begane grond als werkplaats",
  },
  {
    src: "/images/hofman/xxl/xxl-showroom.jpg",
    alt: "Ruime verdieping van de XXL-unit ingericht als showroom met presentatie-eilanden",
    caption: "Ruimte voor showroom of presentatie",
  },
  {
    src: "/images/hofman/xxl/xxl-kantoor-pantry.jpg",
    alt: "Verdieping van de XXL-unit als kantoor met werkplekken, vergadertafel en pantry",
    caption: "Verdieping als kantoor met pantry",
  },
  {
    src: "/images/hofman/xxl/xxl-werkplekken.jpg",
    alt: "Werkplekken langs de raampartij van de XXL-unit met weids uitzicht over de polder",
    caption: "Werkplekken met weids uitzicht",
  },
  {
    src: "/images/hofman/xxl/xxl-dakterras.jpg",
    alt: "Eigen dakterras van de XXL-unit met loungeset, parasol en beplanting",
    caption: "Eigen dakterras",
  },
  {
    src: "/images/hofman/xxl/xxl-luchtfoto.jpg",
    alt: "Luchtfoto van de XXL-unit op de kop van het blok met het dakterras van bovenaf",
    caption: "De XXL op de kop van het blok",
  },
];

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
                Nu te koop · {xxlUnits.length} units
              </p>
              <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
                XXL-unit met
                <br />
                3 volle lagen
              </h1>
              <p className="mt-5 text-lg md:text-xl text-white/85 font-light max-w-2xl">
                3 lagen, 191 m², op de hoek van het blok. Werkplaats en opslag
                op de begane grond, kantoor of showroom op de eerste en tweede
                verdieping.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <Spec label="Begane grond" value="60,7 m²" />
                <Spec label="1e verdieping" value="60,7 m²" />
                <Spec label="2e verdieping" value="70 m²" />
                <Spec label="Vrije hoogte BG" value="3,69 m" />
                <Spec label="Vloerbelasting" value="1.000 kg/m²" />
              </div>
            </div>
          </div>
        </section>

        {/* Digitale rondleiding */}
        <section className="px-5 py-16 md:py-20 bg-hofman-deep text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold">
              Digitale rondleiding
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight">
              Loop virtueel door de XXL-unit.
            </h2>
            <p className="mt-3 text-white/75 max-w-2xl">
              Bekijk de drie lagen, de vrije hoogtes en de indeling in één
              vloeiende tour — zonder een afspraak te maken.
            </p>
            <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              <iframe
                src="https://www.youtube-nocookie.com/embed/IRB3hLXi2l0"
                title="Digitale rondleiding XXL-unit — De Hofman"
                className="h-full w-full"
                loading="lazy"
                allow="encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Why XXL */}
        <section className="px-5 py-16 md:py-20 bg-hofman-deep text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold">
              Wat de XXL anders maakt
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Werkplaats, kantoor en opslag op één adres.
            </h2>
            <ul className="mt-8 grid sm:grid-cols-3 gap-4">
              <Card
                title="3 lagen, 191 m²"
                body="Werkplaats &amp; opslag op de begane grond, kantoor of showroom op de eerste en tweede verdieping."
              />
              <Card
                title="Een hele extra verdieping"
                body="70 m² extra op de tweede verdieping, bovenop je werkvloer. Ruimte voor kantoor, vergaderen of extra opslag."
                accent
              />
              <Card
                title="Beperkt aanbod"
                body="Slechts 2 XXL-units in heel De Hofman: Unit 7 en Unit 14, op de uiteinden van het blok."
              />
            </ul>
          </div>
        </section>

        {/* Beeld */}
        <section className="px-5 py-16 md:py-20 bg-surface-muted">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              In beeld
            </p>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
              Zo kan jouw XXL eruitzien.
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {xxlImages.map((img) => (
                <figure
                  key={img.src}
                  className="group overflow-hidden rounded-2xl border border-repp-gray bg-white"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="px-4 py-3 text-sm text-repp-navy/70">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="px-5 py-12 md:py-16 bg-white">
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
      className={`rounded-2xl p-6 bg-white/[0.04] border ${
        accent ? "border-repp-yellow/50" : "border-white/10"
      }`}
    >
      <p className={`font-bold ${accent ? "text-repp-yellow" : "text-white"}`}>
        {title}
      </p>
      <p
        className="mt-2 text-sm text-white/65 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </li>
  );
}
