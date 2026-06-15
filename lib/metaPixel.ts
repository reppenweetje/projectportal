/**
 * Meta Pixel helpers — fire conversie-events vanuit client components.
 *
 * Architecture (zelfde patroon als de CLP):
 *
 *   - Pixel zelf wordt geladen in app/layout.tsx (via Next.js <Script>)
 *     wanneer NEXT_PUBLIC_META_PIXEL_ID env var gezet is. Zonder env var
 *     wordt het script niet geladen en falen onderstaande helpers stil
 *     (no-op). Geen crashes, geen errors in console.
 *
 *   - fireMetaLead = standaard "Lead" event — ALLEEN bij eerste
 *     daadwerkelijke conversie (lead-gegevens-achterlaten via een form).
 *     Max 1× per visitor want Meta's ad-algoritme optimaliseert hierop.
 *
 *   - fireMetaContact = standaard "Contact" event — voor hoog-intent
 *     acties (callback-aanvraag, WhatsApp-open, telefoonnummer-click)
 *     wanneer er al een lead is. Aparte conversie-categorie zodat Lead
 *     niet vervuild raakt met link-clicks.
 *
 *   - fireMetaCustom = custom event (geen Meta-standaard, voor analytics
 *     en eigen Custom Conversions in Ads Manager).
 *
 * Unique event-ID elk fire zodat browser-Pixel en server-side CAPI (mocht
 * die later komen) niet dubbel tellen.
 *
 * CONVERSIE-POORT: fireMetaLead en fireMetaContact vuren ALLEEN wanneer de
 * bezoeker via een Meta-advertentie binnenkwam (isMetaOrigin() — fbclid of
 * utm_source=meta/facebook/... in het repp_attr cookie). Walk-ins (direct,
 * organisch, e-mail-portaltoken, Google) tellen dus NIET mee als Meta-conversie,
 * zodat Meta's ad-algoritme niet optimaliseert op verkeer dat het niet zelf
 * leverde. fireMetaCustom en de PageView (in layout.tsx) blijven ongepoort —
 * die zijn puur voor analytics/retargeting, geen conversie-optimalisatie.
 */

import { isMetaOrigin } from "@/lib/attribution";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

// Markering dat er voor deze bezoeker al één Lead-event is gevuurd. Zo telt
// een lead die op meerdere plekken zijn gegevens achterlaat (bv eerst een
// brochure-aanvraag, daarna een reservering) maar één keer mee als conversie.
// TTL ruim — een Lead is een eenmalige eerste-conversie, geen herhaal-event.
const LEAD_FIRED_COOKIE = "repp_lead_fired";
const LEAD_FIRED_TTL_DAYS = 180;

function leadAlreadyFired(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${LEAD_FIRED_COOKIE}=`));
}

function markLeadFired(): void {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + LEAD_FIRED_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${LEAD_FIRED_COOKIE}=1; path=/; expires=${expires}; SameSite=Lax${secure}`;
}

/** Vuurt het Pixel-event. Returnt true als fbq daadwerkelijk is aangeroepen. */
function fireMetaPixelEvent(
  eventName: string,
  reason: string,
  extra: Record<string, unknown> = {},
  isCustom = false,
): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.fbq !== "function") return false;
  try {
    const eventId = `${eventName.toLowerCase()}-${reason}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    window.fbq(
      isCustom ? "trackCustom" : "track",
      eventName,
      { content_name: reason, ...extra },
      { eventID: eventId },
    );
    return true;
  } catch {
    // Pixel-fouten mogen UX nooit blokkeren.
    return false;
  }
}

export function fireMetaLead(
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  // Poort 1: alleen tellen als Meta-conversie wanneer de bezoeker van een
  // Meta-ad kwam. Walk-ins worden niet teruggerekend naar Meta.
  if (!isMetaOrigin()) return;
  // Poort 2: max één Lead per bezoeker. Heeft 'ie al ergens zijn gegevens
  // achtergelaten, dan vuren we niet opnieuw (geen dubbele conversies).
  if (leadAlreadyFired()) return;
  // Pas de cookie zetten als het event echt is gevuurd — zo blokkeren we niet
  // permanent als fbq nog niet geladen was op het moment van submit.
  if (fireMetaPixelEvent("Lead", reason, extra)) {
    markLeadFired();
  }
}

export function fireMetaContact(
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  // Zelfde poort als fireMetaLead — Contact is ook een conversie-categorie.
  if (!isMetaOrigin()) return;
  fireMetaPixelEvent("Contact", reason, extra);
}

export function fireMetaCustom(
  eventName: string,
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  fireMetaPixelEvent(eventName, reason, extra, true);
}
