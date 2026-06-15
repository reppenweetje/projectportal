/**
 * Lichtgewicht bot-afweer voor de publieke lead-formulieren. Geen externe
 * dependency, geen CAPTCHA-frictie voor echte bezoekers — puur een honeypot.
 *
 * Werking: elk formulier rendert een veld dat een mens nooit ziet (visueel
 * verborgen, aria-hidden, tabindex -1, autocomplete uit). Form-spam bots
 * renderen de pagina en vullen blind élk veld in, dus zij vullen ook dit
 * lokveld. Komt er een waarde binnen in het honeypot-veld → bot → weigeren.
 *
 * De veldnaam is bewust "company": klinkt voor een bot als een logisch,
 * invulbaar veld, terwijl geen van deze formulieren een echt bedrijfsveld
 * heeft. Client-side bailt het formulier stil (bot ziet "succes", er wordt
 * niets verzonden); server-side weigeren de API-routes als extra laag, voor
 * het geval een bot direct POST't met het veld ingevuld.
 */

export const HONEYPOT_FIELD = "company";

/** True als de honeypot is ingevuld — d.w.z. vrijwel zeker een bot. */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}
