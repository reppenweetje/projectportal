/**
 * Portal session — SERVER-ONLY helpers (gebruikt `next/headers`).
 *
 * Voor shared constants/types/HMAC: zie `portal-session-shared.ts`.
 * Voor client-side hook: zie `portal-session-client.ts`.
 *
 * Twee cookies werken samen voor de portal-experience op dehofman.nl:
 *
 *  1. `dh_session`  (HttpOnly, Secure, SameSite=Lax, Max-Age=60d)
 *     Bevat de Supabase `session_token` (random UUID). Bearer-token. Niet
 *     leesbaar voor client-side JS (XSS-resistent). Wordt gerefreshed door
 *     de middleware bij elke portal-visit.
 *
 *  2. `dh_profile`  (Secure, SameSite=Lax, Max-Age=60d, LEESBAAR voor JS)
 *     Bevat signed JSON `{ first_name, exp, v }` + HMAC. Client-side leesbaar
 *     voor UI-personalisatie ("Welkom terug, Flip"). Tampering wordt ge-
 *     detecteerd via HMAC en behandeld als "geen profiel".
 *
 * BELANGRIJK: dh_profile is geen security-laag voor gated content. De gate
 * controleert ALTIJD het server-side dh_session cookie via portal-resolve.
 * dh_profile is puur UX/UI.
 */

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  PROFILE_COOKIE,
  PROFILE_VERSION,
  verifyProfile,
  type PortalSession,
} from "./portal-session-shared";

// Re-export constants + helpers zodat externe imports niet hoeven te switchen.
export {
  SESSION_COOKIE,
  PROFILE_COOKIE,
  COOKIE_MAX_AGE_SECONDS,
  PROFILE_VERSION,
  signProfile,
  verifyProfile,
} from "./portal-session-shared";
export type { PortalProfile, PortalSession } from "./portal-session-shared";

/**
 * Lees de portal-sessie uit de inkomende request-cookies.
 *
 * Gebruik in een Server Component om te bepalen of een bezoeker terugkeert:
 *
 *   const session = await getPortalSession();
 *   if (session.isReturning) { ... }
 *
 * Gate-checks moeten kijken naar `sessionToken` (cryptografisch bewijs van
 * een geldige Supabase-row), niet naar `profile` (dat is UI-hint).
 */
export async function getPortalSession(): Promise<PortalSession> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const profileRaw = cookieStore.get(PROFILE_COOKIE)?.value ?? null;

  if (!sessionToken) {
    return { isReturning: false, profile: null, sessionToken: null };
  }

  const profile = await verifyProfile(profileRaw);
  return {
    isReturning: true,
    profile: profile ?? { first_name: null, exp: 0, v: PROFILE_VERSION },
    sessionToken,
  };
}
