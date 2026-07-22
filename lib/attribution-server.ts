/**
 * Server-side lezer voor het `repp_attr` attributie-cookie.
 *
 * De client-kant (lib/attribution.ts, gemount via AttributionTracker) schrijft
 * dit cookie bij de eerste pageview met een herkomst-signaal. Het is bewust
 * geen HttpOnly-cookie — de client moet 'm zelf kunnen schrijven en lezen voor
 * de pixel-poort — dus komt 'ie gewoon mee met elke same-origin request en is
 * hij hier in een route handler leesbaar.
 *
 * Gebruikt door lead-sync.ts om de herkomst op de leadrij vast te leggen, zodat
 * sales bij het bellen ziet via welk platform iemand binnenkwam. Zonder dit
 * bleef attributie hangen in Plausible: anoniem en niet aan een naam te koppelen.
 *
 * Faalt nooit hard — een ontbrekend of stuk cookie levert null, en de lead
 * wordt gewoon zonder herkomst weggeschreven.
 */

import { cookies } from "next/headers";
import type { Attribution } from "./attribution";

const COOKIE_NAME = "repp_attr";

export async function readAttributionCookie(): Promise<Attribution | null> {
  try {
    const raw = (await cookies()).get(COOKIE_NAME)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Attribution;
  } catch {
    return null;
  }
}
