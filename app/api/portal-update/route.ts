/**
 * POST /api/portal-update
 *
 * Sync de bij-gewerkte lead-gegevens naar Supabase + Brevo (+ Zapier)
 * wanneer een ingelogde gebruiker z'n account-info aanpast op /welkom.
 *
 * Brevo dedup't op email → vorige Brevo-contact wordt geupdate met de
 * nieuwe waardes (FIRSTNAME, PHONE/SMS/WHATSAPP, PERSONA, INTENT).
 * Supabase krijgt een nieuwe rij met source=`dehofman_portal_update`
 * zodat sales kan zien WANNEER de user zelf data bijwerkte (vs. CLP-
 * initial of walk-in-signup).
 *
 * Body: { name?, email, phone?, modus?, intent? }
 * 200:  { ok: true }
 * 400:  invalid payload (geen email)
 */

import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json(
      { error: "invalid_payload" },
      { status: 400 },
    );
  }

  // Map modus → persona zoals lead-upsert verwacht. "ondernemer" wordt
  // server-side gemapt naar persona "eigen_gebruiker" door upsertWalkinLead.
  const modus =
    body.modus === "ondernemer" || body.modus === "belegger"
      ? body.modus
      : null;

  // Intent is optioneel; valid values matchen flow.js options.
  const intent =
    typeof body.intent === "string" &&
    ["eigen_bedrijf", "belegging", "beide", "huur", "weet_niet"].includes(
      body.intent,
    )
      ? body.intent
      : null;

  const result = await upsertWalkinLead({
    source: "dehofman_portal_other", // type-check; betekent profile-update
    email: String(body.email),
    first_name: typeof body.name === "string" ? body.name : null,
    phone: typeof body.phone === "string" ? body.phone : null,
    modus,
    temperature: "warm",
    attributes: {
      kind: "profile-update",
      intent_id: intent,
      updated_via: "welkom-controle",
      updated_at: new Date().toISOString(),
    },
  });

  if (!result.ok) {
    console.error("[portal-update] lead-sync failed", result.error);
    // Niet faal — lead heeft z'n cookie al geupdate. Server-side sync
    // is best-effort, sales kan via Vercel logs reconstrueren.
  }

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
