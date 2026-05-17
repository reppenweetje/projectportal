"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { useLeadProfile } from "@/lib/personalization";
import { Documents } from "@/components/marketing/Documents";
import { DocumentLeadGate } from "@/components/conversion/DocumentLeadGate";

/**
 * Toont de documentenlijst alleen aan geverifieerde leads.
 *
 * Route 1 (cold lead vanuit ads / Search): er is geen verified-cookie, dus
 * we tonen eerst DocumentLeadGate. Na succesvolle inzending wordt
 * `verified: true` op de cookie gezet en zien ze de documenten direct.
 *
 * Route 2 (warme lead vanuit CLP/welkom-flow of mailing): profile.verified
 * is al `true`, dus de documenten worden meteen getoond.
 */
export function DocumentsGate({ project }: { project: Project }) {
  const profile = useLeadProfile();
  const [justVerified, setJustVerified] = useState(false);

  // Tijdens de allereerste render is profile nog null (SSR + cookie-read in
  // useEffect). Wacht expliciet tot het profile geladen is, anders flitst
  // de gate even in beeld voor warme leads.
  if (profile === null) {
    return (
      <div className="rounded-3xl border border-repp-gray bg-white p-10 text-center text-sm text-repp-navy/50">
        Documenten laden…
      </div>
    );
  }

  if (profile.verified || justVerified) {
    return <Documents project={project} />;
  }

  return (
    <DocumentLeadGate
      project={project}
      onVerified={() => setJustVerified(true)}
    />
  );
}
