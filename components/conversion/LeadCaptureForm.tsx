"use client";

/**
 * LeadCaptureForm — gedeelde form-logica voor zowel de page-gate-overlay
 * als de action-trigger dialog.
 *
 * Submit-flow:
 *  1. POST naar Supabase lead-upsert (source: dehofman_portal) → portal_token
 *  2. POST naar Zapier-webhook (fire-and-forget) — bestaande REPP automation
 *  3. POST naar same-origin /api/portal-session → cookies geset op dehofman.nl
 *  4. track('interest_captured') voor Plausible
 *  5. onSuccess() callback — caller bepaalt wat er gebeurt (close dialog +
 *     run pending action, of router.refresh voor overlay)
 *
 * Geen redirects meer — alles inline, gebruiker blijft op de huidige pagina.
 */

import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { updateProfile } from "@/lib/personalization";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ZAPIER_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_ZAPIER_LEAD_WEBHOOK_URL ??
  "https://hooks.zapier.com/hooks/catch/2082653/4o5tlcc/";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function LeadCaptureForm({
  gateContext,
  onSuccess,
  submitLabel = "Bekijk de informatie",
}: {
  gateContext: string;
  onSuccess: () => void;
  submitLabel?: string;
}) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: bots vullen vaak elk veld in. Mensen zien dit niet.
    const honeypot = String(data.get("company") ?? "");
    if (honeypot) {
      // Doe alsof het lukt; bots krijgen geen feedback.
      setState({ kind: "submitting" });
      setTimeout(() => onSuccess(), 500);
      return;
    }

    const firstName = String(data.get("first_name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (!email || !email.includes("@")) {
      setState({ kind: "error", message: "Vul een geldig e-mailadres in." });
      return;
    }
    if (!firstName) {
      setState({ kind: "error", message: "Vul je voornaam in." });
      return;
    }

    setState({ kind: "submitting" });

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setState({
        kind: "error",
        message: "Server niet bereikbaar. Probeer het later.",
      });
      return;
    }

    try {
      const sessionId = generateSessionId();
      const now = new Date().toISOString();

      // ─── 1. lead-upsert → portal_token ─────────────────────────────
      const upsertRes = await fetch(
        `${SUPABASE_URL}/functions/v1/lead-upsert`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            session_id: sessionId,
            source: "dehofman_portal",
            email,
            first_name: firstName,
            phone: phone || null,
            status: "lead_captured",
            started_at: now,
            last_event_at: now,
            attributes: {
              gateContext,
              source_page:
                typeof window !== "undefined"
                  ? window.location.pathname
                  : null,
            },
            consents: [
              {
                scope: "lead-capture-portal",
                granted: true,
                detail: {
                  gateContext,
                  ua:
                    typeof navigator !== "undefined" ? navigator.userAgent : null,
                },
              },
            ],
          }),
        },
      );

      if (!upsertRes.ok) {
        const text = await upsertRes.text().catch(() => "");
        console.error("[lead-gate] lead-upsert failed", upsertRes.status, text);
        setState({
          kind: "error",
          message: "Er ging iets mis bij het opslaan. Probeer het opnieuw.",
        });
        return;
      }

      const upsertJson = await upsertRes.json();
      const portalToken: string | undefined = upsertJson?.portal_token;
      if (!portalToken) {
        console.error("[lead-gate] geen portal_token in response", upsertJson);
        setState({
          kind: "error",
          message: "Er ging iets mis bij het opslaan. Probeer het opnieuw.",
        });
        return;
      }

      // ─── 2. Zapier webhook (parallel, fire-and-forget) ──────────────
      fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: firstName,
          phone: phone || null,
          source: "dehofman_portal",
          gate_context: gateContext,
          portal_token: portalToken,
          referrer:
            typeof window !== "undefined" ? window.location.href : null,
          submitted_at: now,
        }),
      }).catch((err) => {
        console.warn("[lead-gate] zapier webhook fetch error (non-blocking)", err);
      });

      // ─── 3. Same-origin cookie set via /api/portal-session ──────────
      const sessionRes = await fetch("/api/portal-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: portalToken }),
      });
      if (!sessionRes.ok) {
        console.error(
          "[lead-gate] /api/portal-session failed",
          sessionRes.status,
        );
        setState({
          kind: "error",
          message: "Cookie kon niet worden geset. Herlaad de pagina.",
        });
        return;
      }

      // ─── 4. Update client-side repp_lead cookie ────────────────────
      // Houd het bestaande personalization-systeem in sync zodat
      // useLeadProfile() en bestaande UI-componenten (greeting, WhatsApp-
      // prefill, calc-prefill, MailReportButton) de net opgegeven
      // gegevens direct zien.
      try {
        updateProfile({
          name: firstName,
          email,
          phone: phone || undefined,
          source: "portal-gate",
          verified: true,
          verifiedAt: now,
        });
      } catch {
        // niet kritiek, gaat alleen om UI-hint
      }

      // ─── 5. Analytics ──────────────────────────────────────────────
      try {
        track("interest_captured", {
          source: "portal_gate",
          context: gateContext,
        });
      } catch {
        // never break flow on analytics
      }

      // ─── 6. Success ────────────────────────────────────────────────
      onSuccess();
    } catch (err) {
      console.error("[lead-gate] submit failed", err);
      setState({ kind: "error", message: "Er ging iets mis. Probeer het opnieuw." });
    }
  }

  const submitting = state.kind === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-repp-navy">Voornaam</span>
        <input
          name="first_name"
          type="text"
          required
          autoComplete="given-name"
          disabled={submitting}
          placeholder="Jan"
          className="rounded-full px-4 py-2.5 border border-repp-gray bg-white text-repp-navy placeholder-repp-navy/40 focus:outline-none focus:ring-2 focus:ring-repp-blue disabled:opacity-60"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-repp-navy">E-mailadres</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          disabled={submitting}
          placeholder="jan@bedrijf.nl"
          className="rounded-full px-4 py-2.5 border border-repp-gray bg-white text-repp-navy placeholder-repp-navy/40 focus:outline-none focus:ring-2 focus:ring-repp-blue disabled:opacity-60"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-repp-navy">
          Telefoonnummer{" "}
          <span className="text-ink-soft font-normal">(optioneel)</span>
        </span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          disabled={submitting}
          placeholder="06 ..."
          className="rounded-full px-4 py-2.5 border border-repp-gray bg-white text-repp-navy placeholder-repp-navy/40 focus:outline-none focus:ring-2 focus:ring-repp-blue disabled:opacity-60"
        />
      </label>

      {/* Honeypot — visueel verborgen, bots vullen 'm wel. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Bedrijfsnaam
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.kind === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 px-6 py-3 rounded-full bg-repp-navy text-white text-sm font-bold hover:bg-repp-blue transition disabled:opacity-60"
      >
        {submitting ? "Bezig…" : submitLabel}
      </button>

      <p className="text-[11px] text-ink-soft text-center mt-1 leading-snug">
        Geen ongevraagde mailings. We delen je gegevens niet.
      </p>
    </form>
  );
}
