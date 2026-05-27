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
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

function fireMetaPixelEvent(
  eventName: string,
  reason: string,
  extra: Record<string, unknown> = {},
  isCustom = false,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  try {
    const eventId = `${eventName.toLowerCase()}-${reason}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    window.fbq(
      isCustom ? "trackCustom" : "track",
      eventName,
      { content_name: reason, ...extra },
      { eventID: eventId },
    );
  } catch {
    // Pixel-fouten mogen UX nooit blokkeren.
  }
}

export function fireMetaLead(
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  fireMetaPixelEvent("Lead", reason, extra);
}

export function fireMetaContact(
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  fireMetaPixelEvent("Contact", reason, extra);
}

export function fireMetaCustom(
  eventName: string,
  reason: string,
  extra: Record<string, unknown> = {},
): void {
  fireMetaPixelEvent(eventName, reason, extra, true);
}
