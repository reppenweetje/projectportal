"use client";

/**
 * LeadGateOverlay — modal-style lead capture voor walk-in bezoekers.
 *
 * Server-side LeadGate beslist of deze overlay nodig is. Hier renderen we
 * de gated content geblurd op de achtergrond + een centered card met form.
 *
 * Submit-flow:
 *  1. Genereer client-side session_id (UUID).
 *  2. POST naar Supabase `lead-upsert` met source="dehofman_portal" →
 *     levert portal_token op.
 *  3. POST naar Zapier-webhook (fire-and-forget) parallel zodat de
 *     bestaande automation/CRM-flow getriggerd wordt. Faalt deze, dan
 *     blokkeert het de unlock niet.
 *  4. window.location → huidige pad + `?t=PORTAL_TOKEN`. De **middleware**
 *     (same-origin) doet dan de cookie-set via portal-resolve en
 *     307-redirect naar dezelfde URL zonder ?t=. Cookies landen op
 *     dehofman.nl-domain en zijn HttpOnly.
 *
 * Waarom redirect ipv direct fetch naar portal-resolve?
 * Browsers staan geen Set-Cookie van een third-party origin
 * (supabase.co) toe op de hoofd-domain (dehofman.nl). Cross-origin
 * cookies vereisen SameSite=None + Secure én een trustrelatie die we
 * niet hebben. Via de middleware-redirect zit alles in same-origin.
 *
 * Geen fallback path nodig: als Supabase lead-upsert faalt blokkeren we
 * (gebruiker ziet error), want zonder portal_token geen unlock. Zapier
 * fail = geen issue.
 */

import { useState, type FormEvent } from "react";
import { track } from "@/lib/track";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";

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
  // Fallback voor oudere browsers: tijdstempel + random suffix.
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function LeadGateOverlay({
  gateContext,
  title,
  description,
  children,
}: {
  gateContext: string;
  title: string;
  description: string;
  children: React.ReactNode;
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
      // Doe alsof alles is gelukt om bots niet wijzer te maken.
      setState({ kind: "submitting" });
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
        message: "Verbinding met de server is niet geconfigureerd. Probeer het later.",
      });
      return;
    }

    try {
      const sessionId = generateSessionId();
      const now = new Date().toISOString();

      // ─── Stap 1: lead-upsert → portal_token ───────────────────────────
      const upsertRes = await fetch(`${SUPABASE_URL}/functions/v1/lead-upsert`, {
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
          attributes: { gateContext, source_page: typeof window !== "undefined" ? window.location.pathname : null },
          consents: [
            {
              scope: "lead-capture-portal",
              granted: true,
              detail: { gateContext, ua: typeof navigator !== "undefined" ? navigator.userAgent : null },
            },
          ],
        }),
      });

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
        console.error("[lead-gate] geen portal_token in lead-upsert response", upsertJson);
        setState({
          kind: "error",
          message: "Er ging iets mis bij het opslaan. Probeer het opnieuw.",
        });
        return;
      }

      // ─── Stap 2: Zapier webhook (parallel, fire-and-forget) ───────────
      // Bestaand REPP-automation. Faalt deze, dan unlocken we alsnog.
      // `no-cors` zorgt dat de browser de POST verzendt zonder preflight;
      // response wordt opaque (we kunnen status niet lezen, maar Zapier
      // ontvangt het payload wel).
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
          referrer: typeof window !== "undefined" ? window.location.href : null,
          submitted_at: now,
        }),
      }).catch((err) => {
        console.warn("[lead-gate] zapier webhook fetch error (non-blocking)", err);
      });

      // ─── Stap 3: analytics ────────────────────────────────────────────
      try {
        track("interest_captured", {
          source: "portal_gate",
          context: gateContext,
        });
      } catch {
        // analytics may not be initialized; never break the flow.
      }

      // ─── Stap 4: redirect met ?t= zodat middleware cookies zet ────────
      // Cross-origin Set-Cookie van supabase.co naar dehofman.nl werkt
      // niet (browser-security). De middleware draait same-origin, dus
      // door naar /pad?t=TOKEN te navigeren laten we de bestaande
      // portal-resolve flow uit middleware.ts de cookies correct zetten.
      // Direct daarna 307't middleware terug naar /pad (zonder ?t=) met
      // de cookies geinstalleerd → LeadGate ziet sessie, rendert content.
      if (typeof window !== "undefined") {
        const here = window.location.pathname + window.location.search;
        const sep = window.location.search ? "&" : "?";
        window.location.href = `${here}${sep}t=${encodeURIComponent(portalToken)}`;
      }
    } catch (err) {
      console.error("[lead-gate] submit failed", err);
      setState({
        kind: "error",
        message: "Er ging iets mis. Probeer het opnieuw.",
      });
    }
  }

  const submitting = state.kind === "submitting";

  return (
    <div className="relative">
      {/* Achtergrond: gated content, geblurd en niet-interactief */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-sm opacity-40"
      >
        {children}
      </div>

      {/* Overlay-card: centered modal-stijl */}
      <div className="absolute inset-0 flex items-start justify-center pt-20 pb-12 px-5 bg-white/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-card bg-white shadow-2xl border border-repp-gray p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-repp-navy/60 mb-2">
            De Hofman
          </p>
          <h2 className="text-2xl font-bold text-repp-navy leading-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{description}</p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3"
            noValidate
          >
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
                Telefoon <span className="text-ink-soft font-normal">(optioneel)</span>
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

            {/* Honeypot: visueel verborgen, voor bots wel beschikbaar. */}
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
                <input
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
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
              {submitting ? "Bezig…" : "Bekijk de informatie"}
            </button>

            <PrivacyConsent
              tone="muted"
              actionLabel="bekijken"
              className="text-center mt-2"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
