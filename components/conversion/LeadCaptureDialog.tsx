"use client";

/**
 * LeadCaptureDialog — modal-popup voor action-getriggerde lead-capture.
 *
 * Wordt geopend wanneer een walk-in bezoeker iets gated probeert te doen
 * (document openen / rapport mailen). Vraagt voornaam + email + (optioneel)
 * telefoonnummer, met copy die uitlegt WAAROM we de gegevens vragen — dat
 * verhoogt conversie significant.
 *
 * Na succesvol submit:
 *   1. cookies zijn geset op dehofman.nl (via /api/portal-session)
 *   2. lead staat in Brevo lijst 289 + Supabase
 *   3. onSuccess() callback runt — caller voert de oorspronkelijke
 *      actie uit (doc openen, rapport sturen, etc.)
 *
 * Bij sluiten zonder submit: niets gebeurt.
 */

import { useEffect, useRef } from "react";
import { LeadCaptureForm } from "./LeadCaptureForm";

export function LeadCaptureDialog({
  open,
  onClose,
  onSuccess,
  gateContext,
  title,
  description,
  submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gateContext: string;
  title: string;
  description: string;
  submitLabel?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus de close-knop bij open (a11y) + handle ESC.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    // Lock body-scroll terwijl dialog open is.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leadcapture-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-repp-navy/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-card bg-white shadow-2xl border border-repp-gray p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-repp-navy/60 mb-1">
              De Hofman
            </p>
            <h2
              id="leadcapture-title"
              className="text-2xl font-bold text-repp-navy leading-tight"
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="shrink-0 -mt-1 -mr-1 w-9 h-9 rounded-full grid place-items-center text-repp-navy/50 hover:bg-repp-gray/40 hover:text-repp-navy transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed mb-5">
          {description}
        </p>

        <LeadCaptureForm
          gateContext={gateContext}
          onSuccess={onSuccess}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  );
}
