import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { FavoritesPanel } from "@/components/unit/FavoritesPanel";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Mijn favorieten",
};

export default async function FavorietenPage({
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
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-12 md:pt-20 pb-12">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Bewaard om op terug te komen
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Mijn favorieten
            </h1>
          </div>
        </section>
        <section className="px-5 pb-20">
          <div className="mx-auto max-w-5xl">
            <FavoritesPanel project={project} />
          </div>
        </section>
      </main>
      <Footer project={project} />
      <StickyCTA project={project} />
    </>
  );
}
