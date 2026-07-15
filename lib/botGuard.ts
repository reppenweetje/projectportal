/**
 * Lichtgewicht bot-afweer voor de publieke lead-formulieren. Geen externe
 * dependency, geen CAPTCHA-frictie voor echte bezoekers — puur een honeypot.
 *
 * Werking: elk formulier rendert een veld dat een mens nooit ziet (visueel
 * verborgen, aria-hidden, tabindex -1, autocomplete uit). Form-spam bots
 * renderen de pagina en vullen blind élk veld in, dus zij vullen ook dit
 * lokveld. Komt er een waarde binnen in het honeypot-veld → bot → weigeren.
 *
 * De veldnaam is bewust NIET "company"/"organization"/"bedrijf" o.i.d.:
 * password managers (1Password) en browser-/in-app-autofill herkennen zulke
 * identity-tokens en vullen ze automatisch in als een echte bezoeker z'n
 * naam/e-mail laat autofillen. Dat tript de honeypot voor ECHTE mensen →
 * lead geblokkeerd. Daarom een neutrale, betekenisloze naam die geen enkele
 * autofill-heuristiek matcht, maar die dom-scriptende form-spam bots (die
 * blind elk <input> vullen) wél invullen. Client-side bailt het formulier
 * stil (bot ziet "succes", er wordt niets verzonden); server-side weigeren de
 * API-routes als extra laag, voor het geval een bot direct POST't.
 */

export const HONEYPOT_FIELD = "contact_ref";

/** True als de honeypot is ingevuld — d.w.z. vrijwel zeker een bot. */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}
