import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocumentLeadBanner } from "@/components/conversion/DocumentLeadBanner";

type Params = { projectSlug: string; docSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { projectSlug, docSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  const doc = project?.documents.find((d) => d.slug === docSlug);
  if (!project || !doc) return { title: "Document niet gevonden" };
  return { title: `${doc.label}, ${project.name}` };
}

export default async function DocumentViewerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug, docSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();
  const doc = project.documents.find((d) => d.slug === docSlug);
  if (!doc) notFound();

  return (
    <>
      <Header project={project} />
      <main className="flex-1 flex flex-col">
        <section className="px-5 pt-8 pb-4 border-b border-repp-gray">
          <div className="mx-auto max-w-6xl flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link
                href={`/${project.slug}/documenten`}
                className="text-sm text-repp-navy/60 hover:text-repp-navy inline-flex items-center gap-1"
              >
                ← Alle documenten
              </Link>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
                {doc.label}
              </h1>
              <p className="mt-1 text-sm text-repp-navy/60">{doc.body}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-repp-navy hover:text-repp-blue font-semibold px-4 py-2 rounded-full border border-repp-gray hover:border-repp-navy transition"
              >
                Open in nieuw tabblad
              </a>
              <a
                href={doc.href}
                download
                className="inline-flex items-center gap-1.5 bg-repp-navy text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-repp-blue transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>
        </section>

        <section className="flex-1 bg-surface-muted">
          <div className="mx-auto max-w-6xl px-5 py-6 h-full">
            <DocumentLeadBanner doc={doc} />
            <div className="rounded-2xl border border-repp-gray bg-white overflow-hidden h-[calc(100vh-340px)] min-h-[480px]">
              <object
                data={doc.href}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="p-8 text-center">
                  <p className="text-repp-navy/70 text-sm">
                    Je browser laat geen PDF in de pagina zien.
                  </p>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center bg-repp-navy text-white text-sm font-semibold px-4 py-2 rounded-full"
                  >
                    Open de PDF
                  </a>
                </div>
              </object>
            </div>
            <p className="mt-3 text-xs text-repp-navy/50 text-center">
              Tip: download de PDF om hem op je telefoon of tablet te bewaren.
            </p>
          </div>
        </section>
      </main>
      <Footer project={project} />
    </>
  );
}
