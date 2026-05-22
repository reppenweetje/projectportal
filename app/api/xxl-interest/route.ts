import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.naam !== "string" ||
    typeof body.telefoon !== "string"
  ) {
    return NextResponse.json({ error: "Gegevens onvolledig" }, { status: 400 });
  }

  // XXL interesse = waitlist voor de 2 nog-niet-aangeboden units (7, 14).
  // Hot lead want concrete unit-interesse + 3-veld contact.
  const result = await upsertWalkinLead({
    source: "dehofman_portal_xxl",
    email: String(body.email),
    first_name: String(body.naam),
    phone: String(body.telefoon),
    unit_type: "XXL",
    note: typeof body.gebruik === "string" ? body.gebruik : null,
    contact_moment:
      body.contactMoment === "asap" ||
      body.contactMoment === "this_week" ||
      body.contactMoment === "no_pref"
        ? body.contactMoment
        : null,
    temperature: "hot",
    attributes: {
      project: typeof body.project === "string" ? body.project : "de-hofman",
      bedrijfsnaam:
        typeof body.bedrijfsnaam === "string" ? body.bedrijfsnaam : null,
      source_label: typeof body.source === "string" ? body.source : "xxl",
    },
  });

  if (!result.ok) console.error("[xxl-interest] lead-sync failed", result.error);

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
