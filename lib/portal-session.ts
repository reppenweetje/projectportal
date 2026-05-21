/**
 * Portal session helpers.
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
 * De HMAC voorkomt dat een bezoeker zelf een dh_profile cookie schrijft om
 * een gepersonaliseerde view te triggeren — alleen de server (met
 * PORTAL_COOKIE_SECRET) kan een geldige signature genereren.
 *
 * BELANGRIJK: dh_profile is geen security-laag voor gated content. De gate
 * controleert ALTIJD het server-side dh_session cookie via portal-resolve.
 * dh_profile is puur UX/UI.
 */

import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'dh_session';
export const PROFILE_COOKIE = 'dh_profile';

export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 dagen

export const PROFILE_VERSION = 1;

export type PortalProfile = {
  /** Voornaam uit Supabase lead-row. Null als onbekend. */
  first_name: string | null;
  /** Unix ms timestamp waarop het cookie verloopt (zelfde als Max-Age). */
  exp: number;
  /** Format-versie. Voor toekomstige migraties. */
  v: number;
};

export type PortalSession = {
  /** Heeft een geldige session token cookie (dh_session). */
  isReturning: true;
  /** Profielgegevens uit dh_profile (kan deels leeg zijn). */
  profile: PortalProfile;
  /** Raw session_token waarde — alleen voor server-side gebruik. */
  sessionToken: string;
} | {
  isReturning: false;
  profile: null;
  sessionToken: null;
};

// ─── HMAC helpers (Web Crypto, werkt in edge én nodejs runtime) ────────────

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  // Standaard btoa met URL-safe alfabet en geen padding.
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input: string): Uint8Array {
  // Pad terug naar multiples van 4 zodat atob het accepteert.
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const std = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(std);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return base64urlEncode(new Uint8Array(sig));
}

async function hmacVerify(secret: string, message: string, signature: string): Promise<boolean> {
  const key = await hmacKey(secret);
  try {
    const sigBytes = base64urlDecode(signature);
    // Verify expects BufferSource met ArrayBuffer (niet SharedArrayBuffer).
    // Een verse Uint8Array gebouwd vanuit array geeft een gegarandeerd
    // ArrayBuffer-backed view, vermijdt het TS2345 type-conflict.
    const ab = new Uint8Array(sigBytes);
    return crypto.subtle.verify('HMAC', key, ab, encoder.encode(message));
  } catch {
    return false;
  }
}

// ─── Profile cookie sign/verify ─────────────────────────────────────────────

/**
 * Sign een profile-payload tot een cookie-waarde.
 * Format: `<base64url(JSON)>.<base64url(HMAC-SHA256(JSON))>`
 */
export async function signProfile(
  payload: { first_name: string | null },
  options?: { expSeconds?: number; secret?: string },
): Promise<string> {
  const secret = options?.secret ?? requireSecret();
  const expSeconds = options?.expSeconds ?? COOKIE_MAX_AGE_SECONDS;
  const profile: PortalProfile = {
    first_name: payload.first_name,
    exp: Date.now() + expSeconds * 1000,
    v: PROFILE_VERSION,
  };
  const json = JSON.stringify(profile);
  const body = base64urlEncode(encoder.encode(json));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

/**
 * Verifieer een cookie-waarde en return de payload, of null bij elke fout
 * (tampered, expired, wrong format).
 */
export async function verifyProfile(
  cookieValue: string | undefined | null,
  options?: { secret?: string },
): Promise<PortalProfile | null> {
  if (!cookieValue) return null;
  const secret = options?.secret ?? requireSecret();
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const valid = await hmacVerify(secret, body, sig);
  if (!valid) return null;

  let payload: unknown;
  try {
    const json = new TextDecoder().decode(base64urlDecode(body));
    payload = JSON.parse(json);
  } catch {
    return null;
  }

  if (!isPortalProfile(payload)) return null;
  if (payload.exp < Date.now()) return null;
  if (payload.v !== PROFILE_VERSION) return null;
  return payload;
}

function isPortalProfile(x: unknown): x is PortalProfile {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    (o.first_name === null || typeof o.first_name === 'string') &&
    typeof o.exp === 'number' &&
    typeof o.v === 'number'
  );
}

function requireSecret(): string {
  const s = process.env.PORTAL_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      'PORTAL_COOKIE_SECRET ontbreekt of is te kort (minimaal 32 chars). ' +
      'Stel hem in via Vercel env vars (server-only, geen NEXT_PUBLIC_ prefix).',
    );
  }
  return s;
}

// ─── Server-side reader (Server Components / Route Handlers) ────────────────

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
  // session_token cookie is HttpOnly en wordt server-side gevalideerd via
  // portal-resolve in de middleware. Hier vertrouwen we erop dat als het
  // cookie aanwezig is, de middleware 'm zojuist (of recent) heeft gezet
  // na een geldige Supabase-lookup. Sliding-renewal happens in middleware.
  return {
    isReturning: true,
    profile: profile ?? { first_name: null, exp: 0, v: PROFILE_VERSION },
    sessionToken,
  };
}
