"use client";

import { useEffect, useState } from "react";
import { useLeadProfile } from "@/lib/personalization";
import { EmailCaptureForm } from "./EmailCaptureForm";
import type { Project } from "@/lib/types";

const SESSION_KEY = "repp:exitIntentShown";

export function ExitIntentModal({ project }: { project: Project }) {
  const profile = useLeadProfile();
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);

  // Arm after 15 seconds (don't fire on first-second-bounce)
  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 15000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!armed) return;
    if (profile?.email) return; // already captured
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    // Desktop only — skip on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !open) {
        setOpen(true);
        window.sessionStorage.setItem(SESSION_KEY, "1");
      }
    }
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [armed, profile?.email, open]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7 md:p-9 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Sluiten"
          className="absolute top-3 right-3 text-repp-navy/40 hover:text-repp-navy text-xl w-8 h-8 grid place-items-center"
        >
          ×
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
          Voor je vertrekt
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight">
          Houd De Hofman in de gaten
        </h2>
        <p className="mt-2 text-sm text-repp-navy/70 leading-relaxed">
          Laat je mailadres achter. Je krijgt de brochure, prijslijst en
          updates zodra een unit verandert van status. Uitschrijven voor de
          mailing is altijd mogelijk.
        </p>
        <div className="mt-5">
          <EmailCaptureForm
            source="exit-intent"
            context={{ project: project.slug }}
            ctaLabel="Houd me op de hoogte"
            successText="Top, je staat erin. Tot snel."
            tone="light"
          />
        </div>
        <p className="mt-3 text-[11px] text-repp-navy/50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="underline hover:text-repp-navy"
          >
            Nee dank je, ik kijk nog even rond
          </button>
        </p>
      </div>
    </div>
  );
}
