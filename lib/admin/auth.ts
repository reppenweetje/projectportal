import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "repp_admin";
const SESSION_TTL_DAYS = 7;

/**
 * Admin-wachtwoord uit env. GEEN hardcoded fallback in productie meer:
 * zonder ADMIN_PASSWORD kan niemand inloggen (fail closed). Lokaal mag een
 * dev-default zodat ontwikkelen niet blokkeert. Vroeger stond het echte
 * wachtwoord ("hofman2026") in de broncode én bundle — dat was lekbaar.
 */
export function getAdminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD?.trim();
  if (p) return p;
  if (process.env.NODE_ENV !== "production") return "hofman2026";
  return null;
}

/**
 * Server-secret voor het ondertekenen van de admin-sessie. Hergebruikt
 * PORTAL_COOKIE_SECRET (al gezet in Vercel voor dh_profile-signing). Null
 * als ontbrekend/te kort → auth faalt closed.
 */
function sessionSecret(): string | null {
  const s = process.env.PORTAL_COOKIE_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

/**
 * Ondertekende sessie-waarde: `<exp_ms>.<HMAC-SHA256("admin:"+exp_ms)>`.
 * Zonder het server-secret valt dit niet te vervalsen. Het oude constante
 * "ok" kon iedereen handmatig als cookie zetten en zo de login skippen.
 */
function signSession(expMs: number, secret: string): string {
  const body = String(expMs);
  const sig = createHmac("sha256", secret).update(`admin:${body}`).digest("base64url");
  return `${body}.${sig}`;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;

  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return false;

  const [body, sig] = raw.split(".");
  if (!body || !sig) return false;

  const exp = Number(body);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const expected = createHmac("sha256", secret)
    .update(`admin:${body}`)
    .digest("base64url");

  // Timing-safe vergelijking; ongelijke lengte = direct false.
  const got = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

export async function setAdminSession() {
  const secret = sessionSecret();
  if (!secret) {
    throw new Error(
      "PORTAL_COOKIE_SECRET ontbreekt of is te kort (min. 32 chars); " +
        "admin-sessie kan niet ondertekend worden. Stel hem in via Vercel env vars.",
    );
  }
  const expMs = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(expMs, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
