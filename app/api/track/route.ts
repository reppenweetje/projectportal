/**
 * POST /api/track
 *
 * Same-origin schrijfpad voor per-lead gedragsevents. Wordt aangeroepen
 * door `lib/track.ts` náást Plausible/GTM. Het HttpOnly `dh_session`-cookie
 * gaat automatisch mee (same-origin); wij lezen 'm hier server-side uit en
 * forwarden de `session_token` naar de Supabase edge function `portal-event`,
 * die 'm resolvet naar een lead en in `lead_events` schrijft.
 *
 * Waarom via de edge function en niet direct naar Supabase? De portal heeft
 * alleen de anon-key. Inserts gekoppeld aan een lead_id moeten via de service
 * role (in de edge function) zodat de client dit niet kan vervalsen. Zelfde
 * scheiding als /api/portal-session -> portal-resolve.
 *
 * Uitgelogde bezoeker (geen dh_session) -> stille no-op, 200 { logged: false }.
 * Tracking mag nooit de UX blokkeren en mag geen leadbestaan lekken.
 *
 * Body:  { "event": "<event_name>", "props"?: object }
 * 200:   { ok: true, logged: boolean }
 * 400:   bad_json / invalid_event
 */

import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-session";

// 1-op-1 met EventName in lib/track.ts en de whitelist in de edge function.
const ALLOWED_EVENTS = new Set<string>([
  "reservation_started",
  "reservation_submitted",
  "interest_captured",
  "insider_signed_up",
  "xxl_interest",
  "report_requested",
  "document_opened",
  "unit_favorited",
  "calculator_completed",
  "cta_clicked",
]);

export const runtime = "nodejs"; // next/headers cookies + stabiele fetch

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const b = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const event = typeof b.event === "string" ? b.event.trim() : "";
  const props =
    b.props && typeof b.props === "object" && !Array.isArray(b.props)
      ? (b.props as Record<string, unknown>)
      : {};

  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  // Sessie server-side uitlezen. Geen sessie -> uitgelogd -> niets loggen.
  const { sessionToken } = await getPortalSession();
  if (!sessionToken) {
    return NextResponse.json({ ok: true, logged: false });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Niet geconfigureerd: stil falen, tracking is nooit kritiek.
    return NextResponse.json({ ok: true, logged: false });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/portal-event`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        session_token: sessionToken,
        event_name: event,
        props,
        project: "de-hofman",
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: true, logged: false });
    }
    const data = (await res.json().catch(() => null)) as {
      logged?: boolean;
    } | null;
    return NextResponse.json({ ok: true, logged: Boolean(data?.logged) });
  } catch (err) {
    console.error("[track] portal-event forward failed", err);
    // Nooit hard falen — de client negeert dit sowieso.
    return NextResponse.json({ ok: true, logged: false });
  }
}
