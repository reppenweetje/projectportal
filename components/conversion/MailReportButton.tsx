"use client";

import { useState } from "react";
import { updateProfile, useLeadProfile } from "@/lib/personalization";
import type { Project } from "@/lib/types";

type State = "idle" | "ask" | "sending" | "done" | "error";

export function MailReportButton({
  project,
  reportType,
  context,
}: {
  project: Project;
  reportType: "maandlast" | "rendement";
  context: Record<string, unknown>;
}) {
  const profile = useLeadProfile();
  const [state, setState] = useState<State>("idle");
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  const knownEmail = profile?.email;
  const buttonLabel = knownEmail
    ? `Stuur dit rapport naar ${knownEmail}`
    : "Stuur dit rapport naar mijn mail";

  async function send(targetEmail: string, targetName?: string) {
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          reportType,
          email: targetEmail,
          name: targetName ?? profile?.name,
          phone: profile?.phone,
          sessionId: profile?.sessionId,
          context,
        }),
      });
      if (!res.ok) throw new Error("Verzenden mislukt");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setState("error");
    }
  }

  function onClick() {
    if (knownEmail) {
      send(knownEmail);
    } else {
      setState("ask");
    }
  }

  async function onSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    updateProfile({
      name: name.trim() || profile?.name,
      email: email.trim(),
      source: profile?.source ?? "calculator-report",
    });
    await send(email.trim(), name.trim() || profile?.name);
  }

  if (state === "done") {
    return (
      <p className="mt-4 text-xs text-repp-yellow text-center font-semibold">
        ✓ Rapport onderweg naar {email || knownEmail}
      </p>
    );
  }

  if (state === "ask") {
    return (
      <form onSubmit={onSubmitForm} className="mt-4 space-y-2">
        <p className="text-xs text-white/80">
          Vul je gegevens in en we sturen het rapport meteen toe.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/50 px-4 py-2.5 text-sm focus:bg-white/15 focus:ring-2 focus:ring-repp-yellow focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="jouw@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/50 px-4 py-2.5 text-sm focus:bg-white/15 focus:ring-2 focus:ring-repp-yellow focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
          >
            Stuur me het rapport →
          </button>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="text-xs text-white/60 hover:text-white"
          >
            Annuleer
          </button>
        </div>
        {error && <p className="text-xs text-rose-200">⚠ {error}</p>}
      </form>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={state === "sending"}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        {state === "sending" ? "Versturen…" : buttonLabel}
      </button>
      {error && <p className="mt-2 text-xs text-rose-300">⚠ {error}</p>}
    </div>
  );
}
