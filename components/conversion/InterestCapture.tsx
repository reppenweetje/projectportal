"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { track } from "@/lib/track";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";

type Variant = "default" | "compact" | "card";

export function InterestCapture({
  project,
  source,
  variant = "default",
  context,
}: {
  project: Project;
  /** Identifier where the user filled this out, for analytics later */
  source: string;
  variant?: Variant;
  context?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          email,
          source,
          context: context ?? null,
        }),
      });
      if (!res.ok) throw new Error("Verzenden mislukt");
      track("interest_captured", { source, context: context ?? null });
      setDone(true);
    } catch {
      setError("Er ging iets mis, probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className={
          variant === "card"
            ? "rounded-2xl border border-status-available/40 bg-status-available/10 p-5"
            : "rounded-xl bg-status-available/10 p-4 text-sm text-repp-navy"
        }
      >
        <p className="font-semibold text-repp-navy">Top, je staat op de lijst.</p>
        <p className="mt-1 text-sm text-repp-navy/70">
          We sturen je relevante updates over {project.name}. Geen spam, beloofd.
        </p>
      </div>
    );
  }

  const labelText =
    variant === "compact"
      ? "Hou me op de hoogte"
      : "Niet nu, maar wel nieuwsgierig";
  const helper =
    variant === "compact"
      ? "We mailen alleen bij belangrijke updates."
      : `We sturen alleen relevante updates over ${project.name}, niet meer dan 1× per maand.`;

  return (
    <form
      onSubmit={onSubmit}
      className={
        variant === "card"
          ? "rounded-2xl border border-repp-gray bg-white p-5"
          : "rounded-xl bg-repp-gray/30 p-4"
      }
    >
      <p
        className={
          variant === "card"
            ? "text-sm font-bold text-repp-navy"
            : "text-sm font-semibold text-repp-navy"
        }
      >
        {labelText}
      </p>
      <p className="mt-1 text-xs text-repp-navy/60">{helper}</p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="jouw@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-repp-gray bg-white px-4 py-2.5 text-sm text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-repp-navy text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-repp-blue transition disabled:opacity-60"
        >
          {busy ? "…" : "Inschrijven"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <PrivacyConsent
        tone="muted"
        actionLabel="inschrijven"
        className="mt-2"
      />
    </form>
  );
}
