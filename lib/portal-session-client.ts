"use client";

/**
 * Client-side portal session reader.
 *
 * Leest de `dh_profile` cookie (geen HttpOnly, signed met HMAC) zodat
 * UI-componenten kunnen personaliseren: "Welkom terug, Flip" of WhatsApp
 * pre-fill met naam.
 *
 * BELANGRIJK: dit is GEEN security check. De server-side `dh_session`
 * cookie (HttpOnly) is het echte auth-bewijs voor gated content. Deze
 * client-side hook leest enkel het UI-hint cookie.
 *
 * HMAC-verificatie gebeurt server-side bij set (in middleware) en server-
 * side bij gate-check (in lib/portal-session.ts getPortalSession). De
 * client vertrouwt het cookie omdat een aanvaller geen geldige signature
 * kan produceren zonder PORTAL_COOKIE_SECRET.
 */

import { useEffect, useState } from "react";
import {
  PROFILE_COOKIE,
  type PortalProfile,
  PROFILE_VERSION,
} from "./portal-session-shared";

export type ClientPortalSession =
  | { isReturning: true; firstName: string | null }
  | { isReturning: false; firstName: null };

function readProfileCookie(): PortalProfile | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${PROFILE_COOKIE}=`));
  if (!raw) return null;
  const value = raw.slice(PROFILE_COOKIE.length + 1);
  // Client doet GEEN HMAC-verificatie (zou PORTAL_COOKIE_SECRET in client
  // bundle vereisen — onveilig). We lezen alleen de payload-helft. Als
  // iemand het cookie vervalst zien ze hooguit hun eigen "Welkom terug"-
  // greeting — geen toegang tot gated content (dat checkt server-side).
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const body = parts[0];
  try {
    const padded = body + "==="; // atob accepts extra padding
    const std = padded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(std);
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    if (
      (p.first_name === null || typeof p.first_name === "string") &&
      typeof p.exp === "number" &&
      typeof p.v === "number" &&
      p.v === PROFILE_VERSION &&
      p.exp > Date.now()
    ) {
      return p as unknown as PortalProfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns null until first effect runs (SSR-safe), dan een ClientPortalSession.
 * Component MOET handelen op `null` als loading-state.
 */
export function usePortalSession(): ClientPortalSession | null {
  const [session, setSession] = useState<ClientPortalSession | null>(null);

  useEffect(() => {
    const profile = readProfileCookie();
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession({ isReturning: true, firstName: profile.first_name });
    } else {
      setSession({ isReturning: false, firstName: null });
    }
  }, []);

  return session;
}
