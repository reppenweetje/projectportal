"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project, ProjectDocument } from "@/lib/types";
import { DocIcon } from "./DocIcon";
import { useLeadCapture } from "@/lib/use-lead-capture";

export function Documents({ project }: { project: Project }) {
  const essentieel = project.documents.filter((d) => d.group === "essentieel");
  const juridisch = project.documents.filter((d) => d.group === "juridisch");
  const router = useRouter();

  // Eén gedeelde lead-capture dialog voor alle document-clicks. De `title`
  // is generiek hier; bij het openen wordt de doclabel dynamisch in de
  // pending-action verwerkt (we navigeren naar de doc-viewer).
  const { gateOrRun, dialog } = useLeadCapture({
    gateContext: "documenten",
    title: "Bekijk het document",
    description:
      "We sturen je het document direct per mail zodat je het later terug kunt vinden.",
    submitLabel: "Bekijk de documenten",
  });

  function openDoc(doc: ProjectDocument) {
    router.push(`/${project.slug}/documenten/${doc.slug}`);
  }

  // Trigger de zip-download via een tijdelijke anchor. De route zet
  // Content-Disposition: attachment, dus de pagina navigeert niet weg.
  function downloadAll() {
    const a = document.createElement("a");
    a.href = "/api/download-all";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <>
      <div className="space-y-8">
        {/* Opvallende banner: hele pakket in één keer, achter dezelfde
            lead-gate als de losse documenten. */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-repp-navy text-white px-5 py-4 md:px-6 md:py-5">
          <div className="min-w-0">
            <p className="font-extrabold text-base md:text-lg">
              Alle documenten in één keer
            </p>
            <p className="text-sm text-white/70 mt-0.5">
              Download alle {project.documents.length} documenten in één
              zip-bestand.
            </p>
          </div>
          <button
            type="button"
            onClick={() => gateOrRun(downloadAll)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-repp-yellow text-repp-navy font-bold px-5 py-3 hover:brightness-95 shadow-md hover:shadow-lg transition"
          >
            <DownloadGlyph />
            Download alles
          </button>
        </div>

        <DocSection
          title="Essentieel"
          subtitle="Project, prijzen, plattegronden en beelden. Start hier."
          docs={essentieel}
          project={project}
          accent="blue"
          onCardClick={(doc) => gateOrRun(() => openDoc(doc))}
        />
        <DocSection
          title="Voor de notaris"
          subtitle="Juridische stukken voor de overdracht."
          docs={juridisch}
          project={project}
          accent="navy"
          onCardClick={(doc) => gateOrRun(() => openDoc(doc))}
        />
      </div>
      {dialog}
    </>
  );
}

function DownloadGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

function DocSection({
  title,
  subtitle,
  docs,
  project,
  accent,
  onCardClick,
}: {
  title: string;
  subtitle: string;
  docs: ProjectDocument[];
  project: Project;
  accent: "blue" | "navy";
  onCardClick: (doc: ProjectDocument) => void;
}) {
  const accentBar = accent === "blue" ? "bg-repp-blue" : "bg-repp-navy";
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className={`inline-block w-1 h-6 rounded-full ${accentBar}`} />
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-repp-navy tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-repp-navy/60 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {docs.map((d) => (
          <li key={d.slug}>
            <DocCard
              doc={d}
              projectSlug={project.slug}
              onClick={() => onCardClick(d)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocCard({
  doc,
  projectSlug,
  onClick,
}: {
  doc: ProjectDocument;
  projectSlug: string;
  onClick: () => void;
}) {
  // Compacte, horizontale card: icoon links, titel + tekst + Bekijk ernaast
  // (zelfde opzet als de USP-tegels). h-full houdt de kaarten per rij even
  // hoog. Cmd/Ctrl+click blijft natural-link gedrag voor nieuwe-tabblad. SEO
  // crawlers krijgen ook de echte URL te zien.
  return (
    <Link
      href={`/${projectSlug}/documenten/${doc.slug}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onClick();
      }}
      className="group flex h-full flex-row gap-3 md:gap-4 rounded-2xl border border-repp-gray bg-white p-4 md:p-5 hover:border-repp-navy hover:shadow-md transition"
    >
      <div className="shrink-0">
        <DocIcon slug={doc.slug} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-repp-navy text-sm md:text-base leading-tight break-words hyphens-auto">
          {doc.label}
        </p>
        <p className="mt-1 text-xs text-repp-navy/60 leading-snug line-clamp-2">
          {doc.body}
        </p>
        <span className="mt-2 text-xs text-repp-blue font-semibold inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Bekijk
          <span className="group-hover:translate-x-0.5 transition">→</span>
        </span>
      </div>
    </Link>
  );
}
