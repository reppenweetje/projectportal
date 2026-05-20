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
 * Stuur een custom event naar Plausible.
 * Faalt nooit — analytics-fouten mogen nooit user-flow breken.
 */
export function track(event: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { plausible?: PlausibleFn };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Slik analytics-fouten — silent fail beter dan crash.
  }
}
