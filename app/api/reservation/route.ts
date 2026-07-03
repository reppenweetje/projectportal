import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";
import { sendCrmEvents } from "@/lib/crm-events";
import { getUnit } from "@/lib/projects/de-hofman";

export const runtime = "nodejs";

// "unit-12" → "Unit 12" als de unit niet in de catalog te vinden is.
function unitSlugToLabel(slug: string): string {
  const m = /^unit-(\d+)$/.exec(slug);
  return m ? `Unit ${m[1]}` : slug;
}

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

  // REPP CRM website-signaal. Een reservering op een beschikbare unit is een
  // 🔥 "Unit gereserveerd via het portaal"; een aanmelding op een verkochte /
  // o.v.b.-unit is een wachtlijst-signaal (portal:waitlist), geen reservering.
  // Best-effort: blokkeert de response niet en mag nooit de flow breken.
  const projectSlug =
    typeof body.project === "string" ? body.project : "de-hofman";
  const unitSlug = String(body.unit);
  const found = getUnit(projectSlug, unitSlug);
  const unitLabel = found ? `Unit ${found.unit.number}` : unitSlugToLabel(unitSlug);
  const isWaitlist =
    found?.unit.status === "sold" || found?.unit.status === "verkocht_ovb";

  await sendCrmEvents({
    clpSession:
      typeof body.clpSession === "string" ? body.clpSession : null,
    email: String(body.email),
    events: [
      {
        event_type: isWaitlist ? "portal:waitlist" : "unit:reserved",
        url_path: typeof body.path === "string" ? body.path : "/reserveren",
        payload: { unit: unitLabel },
      },
    ],
  }).catch((err) => {
    console.error("[reservation] crm-events failed", err);
  });

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
