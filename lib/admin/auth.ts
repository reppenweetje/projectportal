import { cookies } from "next/headers";

const SESSION_COOKIE = "repp_admin";
const SESSION_VALUE = "ok";
const SESSION_TTL_DAYS = 7;

/** Default password if no env var set. Change ADMIN_PASSWORD in Vercel for production. */
const DEFAULT_PASSWORD = "hofman2026";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, SESSION_VALUE, {
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
