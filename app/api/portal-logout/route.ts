/**
 * POST /api/portal-logout
 *
 * Logt de bezoeker uit door alle 3 portal-cookies te wissen:
 *   - dh_session (HttpOnly) — server-side auth voor gated content
 *   - dh_profile (signed)   — UI personalisatie via usePortalSession
 *   - repp_lead (plain)     — UI personalisatie via useLeadProfile
 *
 * dh_session en dh_profile kunnen alleen server-side worden gewist (HttpOnly
 * of cross-cookie behavior). Vandaar deze same-origin route.
 *
 * Client-side wist de caller daarnaast nog repp_lead via clearLeadProfile()
 * en doet een hard-reload naar /. Met cookies weg + reload start de gebruiker
 * met een schone slate; volgende bezoek triggert geen sliding-refresh meer.
 */

import { NextResponse } from "next/server";
import { SESSION_COOKIE, PROFILE_COOKIE } from "@/lib/portal-session";

export const runtime = "nodejs";

const LEAD_COOKIE = "repp_lead";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Cookies wissen door ze met max-age=0 te overschrijven. Path + secure
  // moeten matchen met hoe ze gezet zijn anders blijft de oude staan.
  for (const name of [SESSION_COOKIE, PROFILE_COOKIE, LEAD_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    });
  }

  return response;
}
