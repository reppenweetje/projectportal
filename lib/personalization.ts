"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "repp_lead";
const TTL_DAYS = 90;

export type LeadProfile = {
  /** First name (or full name) from CLP / ad */
  name?: string;
  email?: string;
  phone?: string;
  /** What they said they were looking for in the CLP */
  interests?: string[];
  /** ondernemer | belegger from CLP segmentation */
  modus?: "ondernemer" | "belegger";
  /** Optional preferred unit type from CLP */
  unitType?: "L" | "XL" | "XXL";
  /** Where the lead originated */
  source?: "clp" | "ad" | "email" | "direct" | string;
  /** True once user clicks "Klopt, neem me mee" on /welkom */
  verified?: boolean;
  /** ISO timestamp of verification */
  verifiedAt?: string;
  /** Random session id, useful for activity tracking later */
  sessionId?: string;
};

function readCookie(): LeadProfile | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.slice(COOKIE_NAME.length + 1)));
  } catch {
    return null;
  }
}

function writeCookie(profile: LeadProfile) {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();
  const value = encodeURIComponent(JSON.stringify(profile));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

function profileFromUrl(): Partial<LeadProfile> {
  if (typeof window === "undefined") return {};
  const sp = new URL(window.location.href).searchParams;
  const out: Partial<LeadProfile> = {};
  const name = sp.get("name") ?? sp.get("first_name") ?? sp.get("voornaam");
  const email = sp.get("email") ?? sp.get("e");
  const phone = sp.get("phone") ?? sp.get("tel");
  const modus = sp.get("modus");
  const unitType = sp.get("type");
  const interests = sp.get("interests");
  const source = sp.get("utm_source") ?? sp.get("source");
  if (name) out.name = name;
  if (email) out.email = email;
  if (phone) out.phone = phone;
  if (modus === "ondernemer" || modus === "belegger") out.modus = modus;
  if (unitType === "L" || unitType === "XL" || unitType === "XXL") {
    out.unitType = unitType;
  }
  if (interests) out.interests = interests.split(",").map((s) => s.trim());
  if (source) out.source = source;
  return out;
}

function newSessionId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useLeadProfile(): LeadProfile | null {
  const [profile, setProfile] = useState<LeadProfile | null>(null);

  useEffect(() => {
    const fromUrl = profileFromUrl();
    const fromCookie = readCookie() ?? {};
    const merged: LeadProfile = { ...fromCookie, ...fromUrl };
    if (!merged.sessionId && Object.keys(merged).length > 0) {
      merged.sessionId = newSessionId();
    }
    if (Object.keys(merged).length > 0) {
      writeCookie(merged);
      setProfile(merged);
    }
  }, []);

  return profile;
}

/** Verifies the current profile (called after user confirms gegevens on /welkom) */
export function markVerified(extra?: Partial<LeadProfile>): LeadProfile {
  const current = readCookie() ?? {};
  const next: LeadProfile = {
    ...current,
    ...extra,
    verified: true,
    verifiedAt: new Date().toISOString(),
    sessionId: current.sessionId ?? newSessionId(),
  };
  writeCookie(next);
  return next;
}

/** Update non-verification fields (used by Welcome controle when user edits) */
export function updateProfile(fields: Partial<LeadProfile>): LeadProfile {
  const current = readCookie() ?? {};
  const next: LeadProfile = { ...current, ...fields };
  writeCookie(next);
  return next;
}

export function clearLeadProfile() {
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/** Compose a WhatsApp message that mentions the user's name if known */
export function personalizedWhatsAppMessage(
  baseMessage: string,
  profile: LeadProfile | null,
): string {
  if (!profile?.name) return baseMessage;
  return `Hallo, ik ben ${profile.name}${profile.phone ? ` (${profile.phone})` : ""}. ${baseMessage}`;
}
