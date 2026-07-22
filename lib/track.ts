/**
 * Plausible custom events — typed wrapper.
 *
 * Plausible auto-tracks page views; deze helper is voor conversion events.
 * Definieer alle event-namen in `EventName` zodat we typo's vangen.
 *
 * Plausible loader staat in app/layout.tsx; deze module is veilig voor
 * SSR (geen-op tijdens server render).
 */

export type EventName =
  | "reservation_started"     // gebruiker opent reserveer-formulier
  | "reservation_submitted"   // reserveer-formulier succesvol verzonden
  | "interest_captured"       // soft-conversion lead (e-mail/naam-capture)
  | "insider_signed_up"       // Insider-list opgegeven
  | "xxl_interest"            // XXL-interesse formulier ingediend
  | "report_requested"        // calculator-rapport per mail aangevraagd
  | "document_opened"         // document geopend / gedownload
  | "unit_favorited"          // unit toegevoegd aan favorieten
  | "calculator_completed"    // calculator-result gegenereerd
  | "cta_clicked";            // generic CTA-tracking (alleen voor key paden)

type EventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

type PlausibleFn = (
  name: string,
  options?: { props?: EventProps; callback?: () => void }
) => void;

/**
 * Stuur een custom event naar Plausible, de GTM dataLayer én — als de
 * bezoeker ingelogd is — naar ons eigen per-lead eventlog via /api/track.
 * Faalt nooit — analytics-fouten mogen nooit user-flow breken.
 *
 * De dataLayer-push maakt elk event beschikbaar als Custom Event-trigger in
 * Google Tag Manager (bv. om een Google Ads-conversie te vuren). Pushen mag
 * altijd: het slaat niets op. Of de resulterende Google-tag daadwerkelijk
 * cookies zet, bepaalt Consent Mode v2 (default-denied tot de banner-keuze).
 *
 * De /api/track-post is het enige kanaal dat gedrag aan een concrete lead
 * koppelt: die route leest server-side het HttpOnly dh_session-cookie en
 * schrijft — alléén voor ingelogde leads — naar de Supabase-tabel
 * `lead_events`, zodat het CRM per lead kan tonen wat iemand deed. Plausible/
 * GTM blijven anoniem/aggregaat. Uitgelogde bezoekers: no-op server-side.
 */
export type TrackOptions = {
  /**
   * Portal-token van de lead. Meegeven op conversie-momenten waar het
   * dh_session-cookie nog NIET gezet is — met name de gate-submit, waar de
   * cookies pas na de `?t=`-redirect landen. Zonder dit zou juist het
   * belangrijkste event (de conversie zelf) nooit aan een lead gekoppeld
   * worden. Server-side resolvet dit naar hetzelfde lead_id als de sessie.
   */
  portalToken?: string;
};

export function track(
  event: EventName,
  props?: EventProps,
  opts?: TrackOptions,
): void {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    plausible?: PlausibleFn;
    dataLayer?: Record<string, unknown>[];
  };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Slik analytics-fouten — silent fail beter dan crash.
  }
  try {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...(props ?? {}) });
  } catch {
    // idem — dataLayer-push mag de flow nooit breken.
  }
  try {
    trackLeadEvent(event, props, opts);
  } catch {
    // Per-lead logging is best-effort; nooit de flow breken.
  }
}

/**
 * Best-effort POST naar /api/track. `keepalive` zodat het event ook afgaat
 * als de gebruiker meteen wegnavigeert (bv. na een download of CTA-klik).
 * Antwoord wordt bewust genegeerd — de server bepaalt zelf of er (ingelogd)
 * iets gelogd wordt. Fouten worden geslikt.
 */
function trackLeadEvent(
  event: EventName,
  props?: EventProps,
  opts?: TrackOptions,
): void {
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event,
      props: props ?? {},
      // Alleen meesturen als de caller 'm heeft; anders valt de server
      // terug op het dh_session-cookie.
      ...(opts?.portalToken ? { portal_token: opts.portalToken } : {}),
    }),
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    // Silent fail — analytics mag de UX nooit raken.
  });
}
