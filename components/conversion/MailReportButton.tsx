"use client";

import { useState } from "react";
import { readLeadProfile, useLeadProfile } from "@/lib/personalization";
import type { Project } from "@/lib/types";
import { track } from "@/lib/track";
import { useLeadCapture } from "@/lib/use-lead-capture";

type State = "idle" | "sending" | "done" | "error";

/**
 * MailReportButton — verstuurt een calculator-rapport per mail.
 *
 * Voor walk-in bezoekers zonder lead-cookie: klik triggert eerst de
 * LeadCaptureDialog (vraagt naam + email + telefoon optioneel + uitlegt
 * waarom). Na succesvolle submit: rapport wordt direct gestuurd naar het
 * net opgegeven email-adres.
 *
 * Voor terugkerende bezoekers met cookie: direct verzenden zonder popup.
 */
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
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { gateOrRun, dialog } = useLeadCapture({
    gateContext: `bereken-${reportType}`,
    title:
      reportType === "maandlast"
        ? "Stuur me het maandlast-rapport"
        : "Stuur me het rendement-rapport",
    description:
      "Vul je naam en e-mailadres in en we sturen het rapport meteen toe. " +
      "Zo kun je 'm later rustig doorlezen, of meenemen naar je accountant " +
      "of partner. Telefoonnummer is optioneel — alleen handig als je het " +
      "fijn vindt om kort contact te hebben bij vragen.",
    submitLabel: "Stuur me het rapport",
  });

  async function send() {
    // Lees profiel SYNCHROON uit cookie. useLeadProfile-state kan
    // achterlopen direct na gate-submit (useEffect zonder deps draait
    // niet opnieuw). readLeadProfile() pakt de actuele cookie-waarde,
    // dus we hebben hier altijd de net opgegeven email.
    const fresh = readLeadProfile() ?? profile;
    const target = fresh?.email;
    if (!target) {
      setError("Geen e-mailadres bekend, probeer opnieuw.");
      setState("error");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          reportType,
          email: target,
          name: fresh?.name,
          phone: fresh?.phone,
          sessionId: fresh?.sessionId,
          context,
        }),
      });
      if (!res.ok) throw new Error("Verzenden mislukt");
      track("report_requested", { reportType });
      setSentTo(target);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setState("error");
    }
  }

  function onClick() {
    if (state === "sending") return;
    if (profile?.email) {
      // Bekende email → direct sturen, geen popup nodig.
      send();
    } else {
      // Trigger gate; na succes: send() runt met verse cookie-data.
      gateOrRun(() => send());
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 text-xs text-repp-yellow text-center font-semibold">
        ✓ Rapport onderweg naar {sentTo}
      </p>
    );
  }

  const knownEmail = profile?.email;
  const buttonLabel = knownEmail
    ? `Stuur dit rapport naar ${knownEmail}`
    : "Stuur dit rapport naar mijn mail";

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
      {dialog}
    </div>
  );
}
