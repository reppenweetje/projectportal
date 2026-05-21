/**
 * Middleware — portal token resolve + clean URLs.
 *
 * Twee verantwoordelijkheden, in volgorde:
 *
 *  A. PORTAL TOKEN / SESSION RESOLVE (nieuw, fase 3)
 *     - URL bevat `?t=PORTAL_TOKEN` → fetch `portal-resolve` op Supabase
 *       met dat token → zet `dh_session` (HttpOnly) + `dh_profile` (signed)
 *       cookies → 308-redirect naar dezelfde URL zonder `?t=` (zodat de
 *       token niet in browser history / mail-forwards blijft hangen).
 *     - `dh_session` cookie aanwezig zonder `?t=` → fetch `portal-resolve`
 *       voor sliding-renewal (refresh expiry). Best-effort: bij netwerk-
 *       fout laten we de cookie staan zoals 'ie was (zachte degradatie).
 *     - Geen van beide → niets doen, door naar clean-URL logic.
 *
 *  B. CLEAN URLS (bestaand)
 *     - Zie originele middleware-comment hieronder.
 *
 * Volgorde is belangrijk: token-resolve moet vóór de clean-URL rewrite
 * draaien, anders zit `?t=` al weg en kan de mail-link niet meer worden
 * herkend.
 *
 * Runtime: edge (default voor middleware in Next.js 16). Edge fetch werkt
 * naar Supabase Functions zonder extra config.
 *
 * Toekomstig: Next.js 16 marked `middleware` als deprecated ten gunste van
 * `proxy.ts` (nodejs runtime). Voor nu houden we middleware aan; codemod
 * kan dit later automatisch migreren.
 */

import { NextResponse, type NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  PROFILE_COOKIE,
  COOKIE_MAX_AGE_SECONDS,
  signProfile,
} from './lib/portal-session';

const DEFAULT_PROJECT = process.env.NEXT_PUBLIC_DEFAULT_PROJECT?.trim();

// ─── Portal-resolve helpers ─────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

type ResolveProfile = {
  first_name: string | null;
  email: string | null;
  phone: string | null;
  persona: string | null;       // ondernemer | belegger | null
  size_id: string | null;       // L | XL | XXL | null
  intent_id: string | null;
  temperature: string | null;
  stage: string | null;
  score: number | null;
};

type ResolveResult = {
  ok: true;
  session_token: string;
  expires_at: string;
  profile: ResolveProfile;
} | {
  ok: false;
};

const LEAD_COOKIE = 'repp_lead';
const LEAD_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90d, mirrors client-side TTL_DAYS

async function callPortalResolve(
  body: { token: string } | { session_token: string },
): Promise<ResolveResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[middleware] Supabase env vars ontbreken, portal-resolve overgeslagen');
    return { ok: false };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/portal-resolve`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false };
    }
    const data = await res.json();
    if (data && data.ok && typeof data.session_token === 'string') {
      const p = (data.profile ?? {}) as Partial<ResolveProfile>;
      return {
        ok: true,
        session_token: data.session_token,
        expires_at: data.expires_at,
        profile: {
          first_name: p.first_name ?? null,
          email: p.email ?? null,
          phone: p.phone ?? null,
          persona: p.persona ?? null,
          size_id: p.size_id ?? null,
          intent_id: p.intent_id ?? null,
          temperature: p.temperature ?? null,
          stage: p.stage ?? null,
          score: p.score ?? null,
        },
      };
    }
    return { ok: false };
  } catch (err) {
    console.error('[middleware] portal-resolve fetch failed', err);
    return { ok: false };
  }
}

/**
 * Map persona uit Supabase naar de modus die LeadProfile/PersonalizationBanner
 * verwacht. CLP schrijft `persona` als "ondernemer" of "belegger" (1-op-1
 * dezelfde labels), maar oude leads / handmatige edits kunnen variant-strings
 * bevatten zoals "investor", "gebruiker". Hier normaliseren we naar het
 * client-type zodat de UI niet hoeft te raden.
 */
function normalizeModus(persona: string | null): 'ondernemer' | 'belegger' | undefined {
  if (!persona) return undefined;
  const p = persona.toLowerCase();
  if (p.includes('beleg') || p.includes('invest')) return 'belegger';
  if (p.includes('onder') || p.includes('gebruik') || p.includes('owner')) return 'ondernemer';
  return undefined;
}

function normalizeUnitType(sizeId: string | null): 'L' | 'XL' | 'XXL' | undefined {
  if (!sizeId) return undefined;
  const s = sizeId.toUpperCase();
  if (s === 'L' || s === 'XL' || s === 'XXL') return s;
  return undefined;
}

/**
 * Schrijf het `repp_lead` cookie dat de portal-UI consumeert. Dit is een
 * plain JSON-cookie (geen HMAC) want het is puur UX/personalisatie en
 * gevoelige acties (reserveren, downloads) checken altijd dh_session
 * server-side. `verified: true` is hier intentioneel: aankomen via een
 * uniek per-lead PORTAL_TOKEN uit een Brevo-mail is impliciete bevestiging
 * dat we de juiste persoon te pakken hebben — dus skip de welkom-controle
 * en geef 1-click reserveerflow direct.
 */
function buildLeadCookie(profile: ResolveProfile): string {
  const payload: Record<string, unknown> = {
    source: 'email',
    verified: true,
    verifiedAt: new Date().toISOString(),
  };
  if (profile.first_name) payload.name = profile.first_name;
  if (profile.email) payload.email = profile.email;
  if (profile.phone) payload.phone = profile.phone;
  const modus = normalizeModus(profile.persona);
  if (modus) payload.modus = modus;
  const unitType = normalizeUnitType(profile.size_id);
  if (unitType) payload.unitType = unitType;
  return encodeURIComponent(JSON.stringify(payload));
}

async function applyPortalCookies(
  response: NextResponse,
  result: Extract<ResolveResult, { ok: true }>,
): Promise<void> {
  const profileCookie = await signProfile({ first_name: result.profile.first_name });

  // dh_session: HttpOnly, niet leesbaar voor client JS. Bearer voor gate.
  response.cookies.set({
    name: SESSION_COOKIE,
    value: result.session_token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  // dh_profile: NIET HttpOnly. Client moet 'm kunnen lezen voor UI.
  // HMAC-signed dus tampering wordt server-side gedetecteerd.
  response.cookies.set({
    name: PROFILE_COOKIE,
    value: profileCookie,
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  // repp_lead: NIET HttpOnly, NIET HMAC-signed — puur UX-cookie zodat
  // PersonalizationBanner + ReservationForm + ExitIntent direct kunnen
  // tonen wat we al weten. Auth-checks gaan via dh_session.
  response.cookies.set({
    name: LEAD_COOKIE,
    value: buildLeadCookie(result.profile),
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: LEAD_COOKIE_MAX_AGE,
  });
}

// ─── Main handler ───────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenParam = searchParams.get('t');
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  // ─── A1. ?t=PORTAL_TOKEN aanwezig → resolve + cookies + strip URL ────────
  if (tokenParam && tokenParam.length >= 16) {
    const result = await callPortalResolve({ token: tokenParam });

    // Strip ?t= ALTIJD uit de URL (ook als resolve faalt) zodat de token
    // niet in browser history of via share-links lekt. Bij succes
    // schrijven we cookies; bij falen krijgt de bezoeker gewoon de
    // publieke versie van de pagina.
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete('t');
    const response = NextResponse.redirect(redirectUrl, 307);

    if (result.ok) {
      await applyPortalCookies(response, result);
    }
    return response;
  }

  // ─── A2. dh_session cookie aanwezig (geen ?t=) → sliding refresh ─────────
  // Optimalisatie: alleen refreshen bij navigatie naar een echte pagina,
  // niet bij elke asset-request. De matcher filtert al _next/api/etc.
  if (sessionCookie && sessionCookie.length >= 16) {
    // Fire-and-forget refresh als de cookie meer dan 1 dag oud-genoeg is
    // zou ideaal zijn, maar in middleware kunnen we de oude expiry niet
    // weten (cookie zelf bevat geen exp). Voor MVP: elke nav-request
    // refresht. Latency is ~200ms tegen Supabase Edge, acceptabel.
    //
    // Best-effort: bij netwerkfout laten we de cookie staan. Bij 401
    // (expired/cap-reached/unknown) wissen we de cookies.
    const result = await callPortalResolve({ session_token: sessionCookie });

    if (result.ok) {
      const response = await applyCleanUrlLogic(request);
      await applyPortalCookies(response, result);
      return response;
    }

    // 401-pad: cookies wegen, anders blijft de bezoeker met een dood
    // session_token rondlopen wat elke request een vergeefse Supabase-call
    // kost. Tegelijk: andere routes laten gewoon werken (publieke view).
    const response = await applyCleanUrlLogic(request);
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(PROFILE_COOKIE);
    response.cookies.delete(LEAD_COOKIE);
    return response;
  }

  // ─── B. Clean URLs (origineel gedrag) ────────────────────────────────────
  return applyCleanUrlLogic(request);
}

/**
 * Originele clean-URL logica. Uitgesplitst in eigen functie zodat de
 * portal-resolve paden 'm kunnen hergebruiken (clean URL + cookies erbij).
 */
async function applyCleanUrlLogic(request: NextRequest): Promise<NextResponse> {
  if (!DEFAULT_PROJECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const projectPrefix = `/${DEFAULT_PROJECT}`;

  // 1) /de-hofman exact → redirect naar /
  if (pathname === projectPrefix) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }

  // 2) /de-hofman/X → redirect naar /X (browser URL wordt schoon)
  if (pathname.startsWith(`${projectPrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(projectPrefix.length);
    return NextResponse.redirect(url, 301);
  }

  // 3) / clean → rewrite naar /de-hofman (intern, browser blijft op /)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = projectPrefix;
    return NextResponse.rewrite(url);
  }

  // 4) /X (alle overige) → rewrite naar /de-hofman/X
  const url = request.nextUrl.clone();
  url.pathname = `${projectPrefix}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip:
  //  - /_next (Next.js internals)
  //  - /api (API routes — die staan op root, niet onder [projectSlug])
  //  - /admin (admin dashboard, eigen route)
  //  - /favicon.ico, /robots.txt, /sitemap.xml, /opengraph-image*
  //  - alles met een extensie (.png, .jpg, .svg, etc.) — statische assets
  matcher: [
    '/((?!_next|api|admin|favicon|robots|sitemap|opengraph-image|.*\\..*).*)',
  ],
};
