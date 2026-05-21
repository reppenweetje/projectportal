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
 *  3. POST naar Supabase `portal-resolve` met die portal_token → zet
 *     dh_session + dh_profile cookies via response.
 *  4. POST naar Zapier-webhook (fire-and-forget) zodat de bestaande
 *     automation/CRM-flow getriggerd wordt. Faalt deze, dan blokkeert
 *     het de unlock niet.
 *  5. router.refresh() → server re-rendert, LeadGate ziet cookie, overlay
 *     verdwijnt, content unlock.
 *
 * Geen fallback path nodig: als Supabase lead-upsert faalt blokkeren we
 * (gebruiker ziet error), want zonder portal_token geen unlock. Zapier
 * fail = geen issue.
 */

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";

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
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

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

      // ─── Stap 2: portal-resolve → cookies via Set-Cookie ──────────────
      // We doen de fetch met `credentials: 'include'` zodat de browser de
      // Set-Cookie headers honoreert. CORS staat dehofman.nl + Vercel-
      // preview toe (zie portal-resolve DEFAULT_ALLOWED).
      const resolveRes = await fetch(`${SUPABASE_URL}/functions/v1/portal-resolve`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token: portalToken }),
      });

      if (!resolveRes.ok) {
        console.error("[lead-gate] portal-resolve failed", resolveRes.status);
        // Niet blokkerend voor de zapier-call, maar wel voor de unlock.
        // We tonen een error en laten de bezoeker opnieuw proberen.
        setState({
          kind: "error",
          message: "Even niet beschikbaar. Probeer het opnieuw.",
        });
        return;
      }

      // ─── Stap 3: Zapier webhook (parallel, fire-and-forget) ───────────
      // Bestaand REPP-automation. Faalt deze, dan unlocken we alsnog.
      // CORS van Zapier accepteert `no-cors` mode; response wordt opaque
      // en we kunnen niet de status lezen, maar de POST komt aan.
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

      // ─── Stap 4: analytics + reveal ───────────────────────────────────
      try {
        track("interest_captured", {
          source: "portal_gate",
          context: gateContext,
        });
      } catch {
        // analytics may not be initialized; never break the flow.
      }

      // router.refresh laat Next.js de Server Components opnieuw renderen.
      // LeadGate ziet nu de dh_session cookie en rendert de echte content
      // ipv deze overlay.
      router.refresh();
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
            ref={formRef}
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

            <p className="text-[11px] text-ink-soft text-center mt-2 leading-snug">
              Door op de knop te klikken ga je akkoord met de verwerking van je
              gegevens om je over De Hofman te informeren. Geen ongevraagde
              mailings.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
