import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { getPortalSession } from "@/lib/portal-session";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DocIcon } from "@/components/marketing/DocIcon";
import { LeadGate } from "@/components/conversion/LeadGate";
import { DocumentViewTracker } from "@/components/marketing/DocumentViewTracker";

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

  // Is deze bezoeker een gepasseerde lead? Bepaalt of we het
  // document_opened-event vuren (alleen voor echte, ingelogde views —
  // niet voor de geblurde gate-weergave). De LeadGate hieronder doet
  // dezelfde check nog eens voor de daadwerkelijke afscherming.
  const session = await getPortalSession();

  // ALLE PDF-toegang loopt via de sessie-gated /api/download/<slug> route;
  // de bestanden staan niet meer publiek in /public. `?inline=1` levert de
  // PDF met Content-Disposition: inline voor de iframe-preview; zonder query
  // forceert de route een download met nette "De Hofman <label>.pdf"-naam.
  const inlineHref = `/api/download/${doc.slug}?inline=1`;
  const downloadHref = `/api/download/${doc.slug}`;
  const downloadName = `${project.name} ${doc.label.toLowerCase()}.pdf`;

  return (
    <>
      <Header project={project} />
      <main className="flex-1 flex flex-col">
        <LeadGate
          gateContext="documenten"
          title="Bekijk het document"
          description="Laat je naam en e-mailadres achter om de brochure en alle projectdocumenten te bekijken. We sturen je geen ongewenste mail."
        >
        {session.isReturning && (
          <DocumentViewTracker slug={doc.slug} type={doc.group} />
        )}
        <section className="px-4 sm:px-5 pt-6 pb-4 border-b border-repp-gray">
          <div className="mx-auto max-w-6xl">
            <Link
              href={`/${project.slug}/documenten`}
              className="text-sm text-repp-navy/60 hover:text-repp-navy inline-flex items-center gap-1"
            >
              ← Alle documenten
            </Link>
            <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
                  {doc.label}
                </h1>
                <p className="mt-1 text-sm text-repp-navy/60">{doc.body}</p>
              </div>
              {/* Desktop actions only — mobile gets prominent buttons below */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <a
                  href={inlineHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-repp-navy hover:text-repp-blue font-semibold px-4 py-2 rounded-full border border-repp-gray hover:border-repp-navy transition"
                >
                  Open in nieuw tabblad
                </a>
                <a
                  href={downloadHref}
                  download={downloadName}
                  className="inline-flex items-center gap-1.5 bg-repp-navy text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-repp-blue transition"
                >
                  <DownloadIcon />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 bg-surface-muted">
          <div className="mx-auto max-w-6xl px-4 sm:px-5 py-5 md:py-6 h-full">
            {/* Mobile: prominent action card (iframe rendert vaak slecht op iOS) */}
            <div className="md:hidden rounded-2xl border border-repp-gray bg-white p-5">
              <div className="flex items-center gap-4">
                <DocIcon slug={doc.slug} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-repp-navy">{doc.label}</p>
                  <p className="text-xs text-repp-navy/60 truncate">
                    PDF · {doc.body}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <a
                  href={inlineHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-repp-yellow text-repp-navy font-bold py-3.5 rounded-full hover:brightness-95 transition"
                >
                  Open PDF →
                </a>
                <a
                  href={downloadHref}
                  download={downloadName}
                  className="flex items-center justify-center gap-2 w-full bg-repp-navy text-white font-semibold py-3 rounded-full hover:bg-repp-blue transition"
                >
                  <DownloadIcon />
                  Download naar je telefoon
                </a>
              </div>
              <p className="mt-4 text-[11px] text-repp-navy/50 text-center leading-relaxed">
                Op een laptop of tablet zie je de PDF direct in beeld; op je
                telefoon werkt openen of downloaden vaak prettiger.
              </p>
            </div>

            {/* Desktop: in-page iframe viewer. Was eerder <object> maar
                Chrome rendert <object data="...pdf"> regelmatig niet meer
                inline (toont fallback content terwijl Content-Type +
                X-Frame-Options correct zijn). <iframe> is universeel
                betrouwbaarder voor PDF embedding. */}
            <div className="hidden md:block">
              <div className="rounded-2xl border border-repp-gray bg-white overflow-hidden h-[calc(100vh-300px)] min-h-[520px]">
                <iframe
                  src={`${inlineHref}#view=FitH&toolbar=1`}
                  title={doc.label}
                  className="w-full h-full block border-0"
                />
              </div>
              <p className="mt-3 text-xs text-repp-navy/50 text-center">
                Tip: download de PDF om hem op je telefoon of tablet te bewaren.
              </p>
            </div>
          </div>
        </section>
        </LeadGate>
      </main>
      <Footer project={project} />
    </>
  );
}

function DownloadIcon() {
  return (
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
  );
}
