/**
 * POST /api/portal-session
 *
 * Same-origin endpoint die een portal_token inwisselt voor dh_session +
 * dh_profile cookies op het dehofman.nl-domain.
 *
 * Waarom een eigen route ipv direct vanuit de browser naar Supabase
 * portal-resolve? Browsers blokkeren Set-Cookie van een third-party origin
 * (supabase.co) op de hoofd-domain (dehofman.nl). Door deze route door
 * de Next.js server (same-origin) te laten lopen kan Set-Cookie wél
 * landen — en blijft de gebruiker op de huidige pagina staan zonder
 * `?t=`-redirect of refresh.
 *
 * Body:  { "token": "<portal_token uuid>" }
 * 200:   { "ok": true, "profile": { "first_name": string | null } }
 * 400:   invalid_token
 * 401:   token_not_found (portal-resolve gaf 401)
 * 500:   server_misconfigured (env vars missen)
 *
 * De Supabase service-call zelf gaat server-to-server, geen CORS-issues.
 */

import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  PROFILE_COOKIE,
  COOKIE_MAX_AGE_SECONDS,
  signProfile,
} from "@/lib/portal-session";

export const runtime = "nodejs"; // Node-runtime voor stabiele fetch + Web Crypto

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const token =
    body && typeof body === "object" && (body as Record<string, unknown>).token;
  if (typeof token !== "string" || token.length < 16) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "server_misconfigured" },
      { status: 500 },
    );
  }

  let resolveData: {
    ok?: boolean;
    session_token?: string;
    expires_at?: string;
    profile?: { first_name?: string | null };
  } | null = null;

  try {
    const resolveRes = await fetch(
      `${SUPABASE_URL}/functions/v1/portal-resolve`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ token }),
      },
    );
    if (!resolveRes.ok) {
      return NextResponse.json(
        { error: "token_not_found" },
        { status: 401 },
      );
    }
    resolveData = await resolveRes.json();
  } catch (err) {
    console.error("[portal-session] portal-resolve fetch failed", err);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  if (!resolveData?.ok || typeof resolveData.session_token !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const firstName = resolveData.profile?.first_name ?? null;
  const profileCookie = await signProfile({ first_name: firstName });

  const response = NextResponse.json({
    ok: true,
    profile: { first_name: firstName },
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: resolveData.session_token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  response.cookies.set({
    name: PROFILE_COOKIE,
    value: profileCookie,
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
