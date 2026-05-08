"use client";

import { useState } from "react";
import { useLeadProfile } from "@/lib/personalization";
import { EmailCaptureForm } from "./EmailCaptureForm";
import type { ProjectDocument } from "@/lib/types";

export function DocumentLeadBanner({ doc }: { doc: ProjectDocument }) {
  const profile = useLeadProfile();
  const [dismissed, setDismissed] = useState(false);

  // If the user has email already, no banner.
  if (profile?.email || dismissed) return null;

  return (
    <div className="rounded-2xl bg-repp-navy text-white px-5 py-4 mb-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:grid w-10 h-10 rounded-full bg-repp-yellow text-repp-navy place-items-center text-lg shrink-0">
          ✉
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white">
            {doc.label} ook in je inbox?
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            We sturen het toe zodat je het later rustig kunt nalezen.
          </p>
        </div>
      </div>
      <div className="flex-1">
        <EmailCaptureForm
          source={`document-${doc.slug}`}
          context={{ doc: doc.slug }}
          ctaLabel="Stuur me"
          successText={`${doc.label} onderweg naar je inbox.`}
          tone="dark"
        />
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Verberg dit"
        className="absolute md:relative right-2 md:right-auto top-2 md:top-auto text-white/40 hover:text-white text-sm md:ml-2 self-end md:self-auto"
      >
        Niet nu
      </button>
    </div>
  );
}
