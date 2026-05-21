/**
 * Shared portal-session constants, types, en HMAC helpers.
 *
 * Géén imports uit `next/headers` of andere server-only modules — dit
 * bestand kan veilig in zowel server components, edge middleware, als
 * client components / hooks worden geladen.
 *
 * Server-only logic (read cookies via next/headers) staat in
 * `portal-session.ts`. Client-side helpers in `portal-session-client.ts`.
 */

export const SESSION_COOKIE = "dh_session";
export const PROFILE_COOKIE = "dh_profile";

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

export type PortalSession =
  | {
      /** Heeft een geldige session token cookie (dh_session). */
      isReturning: true;
      /** Profielgegevens uit dh_profile (kan deels leeg zijn). */
      profile: PortalProfile;
      /** Raw session_token waarde — alleen voor server-side gebruik. */
      sessionToken: string;
    }
  | {
      isReturning: false;
      profile: null;
      sessionToken: null;
    };

// ─── HMAC helpers (Web Crypto, werkt in edge én nodejs runtime én browser) ──
// Browser-context gebruikt deze NIET voor verify (zou PORTAL_COOKIE_SECRET in
// client bundle vereisen — onveilig). Maar de helpers zelf zijn neutral.

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const std = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(std);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64urlEncode(new Uint8Array(sig));
}

async function hmacVerify(
  secret: string,
  message: string,
  signature: string,
): Promise<boolean> {
  const key = await hmacKey(secret);
  try {
    const sigBytes = base64urlDecode(signature);
    const ab = new Uint8Array(sigBytes);
    return crypto.subtle.verify("HMAC", key, ab, encoder.encode(message));
  } catch {
    return false;
  }
}

/**
 * Sign een profile-payload tot een cookie-waarde.
 * Format: `<base64url(JSON)>.<base64url(HMAC-SHA256(JSON))>`
 *
 * Te gebruiken vanuit middleware (server-edge) en Node route handlers.
 * NIET geschikt voor browser — die mag de secret niet zien.
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
  const parts = cookieValue.split(".");
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
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    (o.first_name === null || typeof o.first_name === "string") &&
    typeof o.exp === "number" &&
    typeof o.v === "number"
  );
}

function requireSecret(): string {
  const s = process.env.PORTAL_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "PORTAL_COOKIE_SECRET ontbreekt of is te kort (minimaal 32 chars). " +
        "Stel hem in via Vercel env vars (server-only, geen NEXT_PUBLIC_ prefix).",
    );
  }
  return s;
}
