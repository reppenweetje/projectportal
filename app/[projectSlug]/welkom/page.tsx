import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WelcomeControle } from "@/components/conversion/WelcomeControle";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Welkom",
  robots: { index: false },
};

export default async function WelkomPage({
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
      <main className="flex-1 bg-surface-muted">
        <section className="px-5 py-12 md:py-20">
          <div className="mx-auto max-w-2xl">
            <Suspense fallback={null}>
              <WelcomeControle project={project} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer project={project} />
    </>
  );
}
