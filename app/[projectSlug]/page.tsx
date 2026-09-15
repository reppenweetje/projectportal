import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { MinimalHero } from "@/components/marketing/MinimalHero";
import { StatusStrip } from "@/components/marketing/StatusStrip";
import { Unit14Intro } from "@/components/marketing/Unit14Intro";
import { USPHighlights } from "@/components/marketing/USPHighlights";
import { HeroCalculator } from "@/components/calculator/HeroCalculator";
import { TrustStack } from "@/components/marketing/TrustStack";
import { Testimonials } from "@/components/marketing/Testimonials";
import { WhyStillAvailable } from "@/components/marketing/WhyStillAvailable";
import { HomeFAQ } from "@/components/marketing/HomeFAQ";
import { KeyDocuments } from "@/components/marketing/KeyDocuments";
import { HomeLeadForm } from "@/components/marketing/HomeLeadForm";
import { PersonalizationBanner } from "@/components/marketing/PersonalizationBanner";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";
import { ProjectJsonLd } from "@/components/seo/ProjectJsonLd";
import { getSiteUrl } from "@/lib/site-url";
import { UNIT14_IMAGE } from "@/lib/site-config";

type Params = { projectSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) return { title: "Project niet gevonden" };

  const title = `${project.name}, ${project.city} · Laatste XXL-unit te koop`;
  const description =
    "Nog 1 van 14 units te koop in De Hofman, Waarderpolder Haarlem. XXL unit 14, ca. 190 m² over 3 lagen, € 475.000 v.o.n. zonder overdrachtsbelasting. Verwachte oplevering Q3 2027.";
  const heroImage = UNIT14_IMAGE;
  const heroAlt =
    "Vooraanzicht van XXL unit 14 van De Hofman met grote glasgevel en eigen entree";

  return {
    title: { absolute: title },
    description,
    keywords: [
      "bedrijfsunit kopen",
      "bedrijfsruimte Haarlem",
      "Waarderpolder",
      "De Hofman",
      "REPP Bedrijfsmakelaar",
      "nieuwbouw bedrijfspand",
      "XXL-unit",
      "kavel bedrijventerrein",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "nl_NL",
      siteName: project.name,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProjectHomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const siteUrl = getSiteUrl();

  return (
    <>
      <ProjectJsonLd project={project} baseUrl={siteUrl} />
      {/* Geen login-strook onder de header: de sitebrede status-banner en
          de hero-CTA nemen die plek in. */}
      <Header project={project} loginNudge={false} />
      <PersonalizationBanner project={project} />
      <main className="flex-1 has-sticky-cta">
        {/* 1. Hero: één boodschap, één knop */}
        <MinimalHero project={project} />

        {/* 2. Statusstrook: de drie types en hun status per datum */}
        <StatusStrip />

        {/* 3. Dit is unit 14 */}
        <Unit14Intro />

        {/* 4. Zes redenen */}
        <USPHighlights project={project} />

        {/* 5. Maandlast unit 14 */}
        <HeroCalculator project={project} />

        {/* 6. Partners */}
        <TrustStack project={project} />

        {/* 7. Referenties: je toekomstige buren */}
        <Testimonials project={project} />

        {/* 8. Waarom is unit 14 er nog? */}
        <WhyStillAvailable />

        {/* 9. FAQ */}
        <HomeFAQ />

        {/* 10. Documenten */}
        <KeyDocuments project={project} />

        {/* 11. Aanmeldblok met formulier */}
        <HomeLeadForm project={project} />
      </main>
      <Footer project={project} />
      <StickyCTA project={project} showReserve={false} />
      <ExitIntentModal project={project} />
    </>
  );
}
