/**
 * POST /api/portal-magic-link
 *
 * Same-origin proxy naar Supabase portal-magic-link Edge Function. De
 * Edge Function gebruikt service-role-key om leads op te zoeken; dat
 * kunnen we niet vanuit de client doen. Vandaar deze server-route die
 * het verzoek doorzet.
 *
 * Body:  { "email": "flip@example.nl" }
 * 200:   { "ok": true }   — altijd, ongeacht of email bestaat (geen leak)
 * 400:   { "error": "invalid_email" }
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !ANON_KEY) {
    return NextResponse.json(
      { error: "server_misconfigured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/portal-magic-link`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify(body),
      },
    );
    if (res.status === 400) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal-magic-link] upstream fetch failed", err);
    // Geen leak van interne fouten — client krijgt nog steeds ok zodat
    // 'ie geen aanvalsvlak heeft om Supabase-status te peilen.
    return NextResponse.json({ ok: true });
  }
}
