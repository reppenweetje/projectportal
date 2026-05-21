/**
 * POST /api/portal-session
 *
 * Same-origin endpoint die een portal_token inwisselt voor dh_session +
 * dh_profile + repp_lead cookies op het dehofman.nl-domain.
 *
 * Waarom een eigen route ipv direct vanuit de browser naar Supabase
 * portal-resolve? Browsers blokkeren Set-Cookie van een third-party origin
 * (supabase.co) op de hoofd-domain (dehofman.nl). Door deze route door
 * de Next.js server (same-origin) te laten lopen kan Set-Cookie wél
 * landen — en blijft de gebruiker op de huidige pagina staan zonder
 * `?t=`-redirect of refresh.
 *
 * Body:  { "token": "<portal_token uuid>" }
 * 200:   { "ok": true, "profile": { first_name, email, modus, ... } }
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

const LEAD_COOKIE = "repp_lead";
const LEAD_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90d

function normalizeModus(
  persona: string | null | undefined,
): "ondernemer" | "belegger" | undefined {
  if (!persona) return undefined;
  const p = persona.toLowerCase();
  if (p.includes("beleg") || p.includes("invest")) return "belegger";
  if (p.includes("onder") || p.includes("gebruik") || p.includes("owner"))
    return "ondernemer";
  return undefined;
}

function normalizeUnitType(
  sizeId: string | null | undefined,
): "L" | "XL" | "XXL" | undefined {
  if (!sizeId) return undefined;
  const s = sizeId.toUpperCase();
  if (s === "L" || s === "XL" || s === "XXL") return s;
  return undefined;
}

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
    profile?: {
      first_name?: string | null;
      email?: string | null;
      phone?: string | null;
      persona?: string | null;
      size_id?: string | null;
      intent_id?: string | null;
      temperature?: string | null;
      stage?: string | null;
      score?: number | null;
    };
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

  const profile = resolveData.profile ?? {};
  const firstName = profile.first_name ?? null;
  const profileCookie = await signProfile({ first_name: firstName });

  // Bouw het bredere repp_lead cookie zodat UI direct gepersonaliseerd is.
  const leadPayload: Record<string, unknown> = {
    source: "email",
    verified: true,
    verifiedAt: new Date().toISOString(),
  };
  if (firstName) leadPayload.name = firstName;
  if (profile.email) leadPayload.email = profile.email;
  if (profile.phone) leadPayload.phone = profile.phone;
  const modus = normalizeModus(profile.persona);
  if (modus) leadPayload.modus = modus;
  const unitType = normalizeUnitType(profile.size_id);
  if (unitType) leadPayload.unitType = unitType;

  const response = NextResponse.json({
    ok: true,
    profile: {
      first_name: firstName,
      email: profile.email ?? null,
      modus: modus ?? null,
      unitType: unitType ?? null,
    },
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

  response.cookies.set({
    name: LEAD_COOKIE,
    value: encodeURIComponent(JSON.stringify(leadPayload)),
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: LEAD_COOKIE_MAX_AGE,
  });

  return response;
}
