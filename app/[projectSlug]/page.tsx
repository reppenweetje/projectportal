import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { MinimalHero } from "@/components/marketing/MinimalHero";
import { USPHighlights } from "@/components/marketing/USPHighlights";
import { TrustStack } from "@/components/marketing/TrustStack";
import { Testimonials } from "@/components/marketing/Testimonials";
import { HeroCalculator } from "@/components/calculator/HeroCalculator";
import { LossAversion } from "@/components/marketing/LossAversion";
import { KeyDocuments } from "@/components/marketing/KeyDocuments";
import { Gallery } from "@/components/marketing/Gallery";
import { VideoBlock } from "@/components/marketing/VideoBlock";
import { HomeOutro } from "@/components/marketing/HomeOutro";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { PersonalizationBanner } from "@/components/marketing/PersonalizationBanner";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";

type Params = { projectSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) return { title: "Project niet gevonden" };
  return {
    title: `${project.name}, ${project.city}`,
    description: `${project.name} in ${project.city}. ${project.tagline} ${project.totalUnits} hoogwaardige bedrijfsunits.`,
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

  return (
    <>
      <Header project={project} />
      <PersonalizationBanner project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        {/* 1. Hook — sfeerbeeld + intent CTAs */}
        <MinimalHero project={project} />

        {/* 1b. USP-bullets direct na de hero — vier-zes redenen waarom */}
        <USPHighlights project={project} />

        {/* 1c. Sfeer-carrousel direct na de USP-bullets zodat bezoeker
            visueel meteen kan inzoomen op het pand voordat 'ie verder leest. */}
        <Gallery project={project} />

        {/* 2. Trust — partners */}
        <TrustStack project={project} />

        {/* 3. Social proof — kopers aan het woord */}
        <Testimonials project={project} />

        {/* 4. Qualify financially — embedded calculator */}
        <HeroCalculator project={project} />

        {/* 5. Loss aversion — wat het kost om niet te kiezen */}
        <LossAversion project={project} />

        {/* 6. Video block voor diepere project-context */}
        <VideoBlock project={project} />

        {/* 7. Key documents — concrete download / leesbaar */}
        <KeyDocuments project={project} />

        {/* 8. Last-mile CTA */}
        <HomeOutro project={project} />
      </main>
      <Footer project={project} />
      <StickyCTA project={project} showReserve={false} />
      <ExitIntentModal project={project} />
    </>
  );
}
