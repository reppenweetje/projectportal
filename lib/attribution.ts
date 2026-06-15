"use client";

/**
 * Marketing-attributie — herken waar een bezoeker vandaan komt zodat we
 * conversie-events (Meta Lead/Contact, later Google/CAPI) ALLEEN vuren voor
 * betaald advertentieverkeer en NIET voor walk-ins (direct, organisch,
 * e-mail-portaltoken).
 *
 * Werking:
 *   - Bij de eerste pageview leest captureAttribution() de UTM-params en de
 *     click-ids (fbclid voor Meta, gclid/wbraid/gbraid voor Google) uit de
 *     URL en schrijft die naar het `repp_attr` cookie.
 *   - "Last paid click wins": komt iemand later via een nieuwe ad binnen,
 *     dan overschrijven we met de verse herkomst (dat is wat Meta/Google
 *     binnen hun attributie-window ook doen). Een latere DIRECTE sessie
 *     overschrijft niets — dan blijft de laatst bekende ad-herkomst staan,
 *     zolang het cookie leeft (90 dagen).
 *   - isMetaOrigin() / isGoogleOrigin() lezen het cookie op het conversie-
 *     moment terug. De pixel-helpers in lib/metaPixel.ts gebruiken dit als
 *     poort.
 *
 * Geen PII in dit cookie — puur campagne-herkomst. Veilig voor SSR (alle
 * functies zijn no-op zonder document/window).
 */

const COOKIE_NAME = "repp_attr";
const TTL_DAYS = 90;

export type Attribution = {
  /** utm_source, lowercased. bv "meta", "google", "newsletter" */
  source?: string;
  /** utm_medium. bv "paid_social", "cpc", "email" */
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** Meta click-id — door Meta automatisch achter de ad-URL geplakt */
  fbclid?: string;
  /** Google click-id — door Google automatisch achter de ad-URL geplakt */
  gclid?: string;
  /** Google iOS/in-app click-ids (vervangen gclid in bepaalde gevallen) */
  wbraid?: string;
  gbraid?: string;
  /** Pad van de eerste landing, handig voor debugging/rapportage */
  landingPath?: string;
  /** ISO-timestamp van het moment dat deze herkomst is vastgelegd */
  capturedAt?: string;
};

// Welke utm_source-waarden tellen als Meta resp. Google. Bewust ruim zodat
// een typo of variant ("facebook" ipv "meta") niet stilletjes de poort
// dichthoudt.
const META_SOURCES = new Set([
  "meta",
  "facebook",
  "fb",
  "instagram",
  "ig",
  "messenger",
  "audience_network",
]);
const GOOGLE_SOURCES = new Set([
  "google",
  "google_ads",
  "googleads",
  "adwords",
  "youtube",
  "gdn",
  "google-display",
]);

function readCookie(): Attribution | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.slice(COOKIE_NAME.length + 1)));
  } catch {
    return null;
  }
}

function writeCookie(attr: Attribution): void {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();
  const value = encodeURIComponent(JSON.stringify(attr));
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Lax${secure}`;
}

/** Leest de huidige opgeslagen attributie (of null als er niks bekend is). */
export function getAttribution(): Attribution | null {
  return readCookie();
}

/**
 * Heeft deze bezoeker een ad-klik in de huidige URL? UTM-params alleen
 * tellen óók — bv een handmatig getagde nieuwsbrieflink — maar voor de
 * conversie-poort kijken we straks specifiek naar Meta/Google.
 */
function urlHasAttributionSignal(sp: URLSearchParams): boolean {
  return (
    sp.has("utm_source") ||
    sp.has("fbclid") ||
    sp.has("gclid") ||
    sp.has("wbraid") ||
    sp.has("gbraid")
  );
}

/**
 * Lees herkomst uit de huidige URL en sla 'm op. Aanroepen bij de eerste
 * client-render (AttributionTracker). Overschrijft alleen als de huidige
 * URL daadwerkelijk een herkomst-signaal heeft — anders blijft de bestaande
 * attributie staan (zodat een directe vervolgsessie de ad-herkomst niet wist).
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const sp = new URL(window.location.href).searchParams;

  const existing = readCookie();
  if (!urlHasAttributionSignal(sp)) {
    // Geen nieuw signaal — laat bestaande herkomst met rust.
    return existing;
  }

  const lower = (v: string | null) => (v ? v.toLowerCase() : undefined);
  const raw = (v: string | null) => (v ? v : undefined);

  const next: Attribution = {
    source: lower(sp.get("utm_source")),
    medium: lower(sp.get("utm_medium")),
    campaign: raw(sp.get("utm_campaign")),
    content: raw(sp.get("utm_content")),
    term: raw(sp.get("utm_term")),
    fbclid: raw(sp.get("fbclid")),
    gclid: raw(sp.get("gclid")),
    wbraid: raw(sp.get("wbraid")),
    gbraid: raw(sp.get("gbraid")),
    landingPath: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };

  // Strip undefined-keys zodat het cookie compact blijft.
  (Object.keys(next) as (keyof Attribution)[]).forEach((k) => {
    if (next[k] === undefined) delete next[k];
  });

  writeCookie(next);
  return next;
}

/**
 * Kwam deze bezoeker van een Meta-advertentie? True bij utm_source uit
 * META_SOURCES óf een aanwezige fbclid. Dit is de poort voor het Meta
 * Lead/Contact conversie-event.
 */
export function isMetaOrigin(attr: Attribution | null = getAttribution()): boolean {
  if (!attr) return false;
  if (attr.fbclid) return true;
  if (attr.source && META_SOURCES.has(attr.source)) return true;
  return false;
}

/**
 * Kwam deze bezoeker van een Google-advertentie? True bij utm_source uit
 * GOOGLE_SOURCES óf een aanwezige gclid/wbraid/gbraid. Klaar voor wanneer
 * we Google Ads conversie-tracking toevoegen.
 */
export function isGoogleOrigin(
  attr: Attribution | null = getAttribution(),
): boolean {
  if (!attr) return false;
  if (attr.gclid || attr.wbraid || attr.gbraid) return true;
  if (attr.source && GOOGLE_SOURCES.has(attr.source)) return true;
  return false;
}
