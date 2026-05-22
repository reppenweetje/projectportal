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
    typeof body.telefoon !== "string" ||
    typeof body.unit !== "string"
  ) {
    return NextResponse.json({ error: "Gegevens onvolledig" }, { status: 400 });
  }

  // Reserveringen zijn hot-leads — koper geeft contact + concrete unit op.
  const result = await upsertWalkinLead({
    source: "dehofman_portal_reservation",
    email: String(body.email),
    first_name: String(body.naam),
    phone: String(body.telefoon),
    unit_id: String(body.unit),
    note: typeof body.opmerking === "string" ? body.opmerking : null,
    contact_moment:
      body.contactMoment === "asap" ||
      body.contactMoment === "this_week" ||
      body.contactMoment === "no_pref"
        ? body.contactMoment
        : null,
    temperature: "hot",
    session_id:
      typeof body.sessionId === "string" && body.sessionId.length >= 8
        ? body.sessionId
        : undefined,
    attributes: {
      project: typeof body.project === "string" ? body.project : "de-hofman",
      verified: !!body.verified,
      source_label: typeof body.source === "string" ? body.source : "direct",
    },
  });

  if (!result.ok) {
    console.error("[reservation] lead-sync failed", result.error);
  }

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
