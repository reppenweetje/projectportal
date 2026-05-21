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
      "We sturen je het document direct per mail zodat je het later terug kunt vinden. Telefoonnummer is optioneel, alleen voor als je gebeld wilt worden bij vragen.",
    submitLabel: "Bekijk de documenten",
  });

  function openDoc(doc: ProjectDocument) {
    router.push(`/${project.slug}/documenten/${doc.slug}`);
  }

  return (
    <>
      <div className="space-y-10">
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
      <ul className="grid sm:grid-cols-2 gap-3">
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
  // We renderen nog steeds een <Link> zodat right-click/middle-click /
  // crawlers de juiste URL pakken. Maar de gewone left-click intercept
  // we voor de gate. Bij gate-success navigeren we programmatisch.
  return (
    <Link
      href={`/${projectSlug}/documenten/${doc.slug}`}
      onClick={(e) => {
        // Laat keyboard-modifiers (cmd+click → nieuw tabblad) gewoon door.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onClick();
      }}
      className="group flex items-center gap-4 rounded-2xl border border-repp-gray bg-white p-4 hover:border-repp-navy hover:shadow-md transition"
    >
      <DocIcon slug={doc.slug} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-repp-navy text-sm md:text-base">
          {doc.label}
        </p>
        <p className="text-xs text-repp-navy/60 truncate">{doc.body}</p>
      </div>
      <span className="text-xs text-repp-blue font-semibold whitespace-nowrap inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
        Bekijk
        <span className="group-hover:translate-x-0.5 transition">→</span>
      </span>
    </Link>
  );
}
