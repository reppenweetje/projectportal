import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";
import { sendCrmEvents } from "@/lib/crm-events";

export const runtime = "nodejs";

/**
 * Aanmelding voor de laatste unit (LeadFormUnit14). Twee intenties:
 *   - reserveren: de bezoeker wil de laatste unit reserveren
 *   - sparren:    de bezoeker wil eerst sparren over de mogelijkheden
 *
 * Beide zijn hot leads (contactgegevens + concrete unit). De intent, de
 * bedrijfsnaam en de unit 7-wens gaan mee in de attributes-bag zodat sales
 * ze in het CRM ziet. Source blijft `dehofman_portal_xxl` zodat bestaande
 * dashboards en filters (Portal · XXL-interesse) blijven werken.
 */
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
    (body.intent !== "reserveren" && body.intent !== "sparren")
  ) {
    return NextResponse.json({ error: "Gegevens onvolledig" }, { status: 400 });
  }

  const intent = body.intent as "reserveren" | "sparren";
  const unit7Notify = body.unit7Notify === true;

  const result = await upsertWalkinLead({
    source: "dehofman_portal_xxl",
    email: String(body.email),
    first_name: String(body.naam),
    phone: String(body.telefoon),
    unit_id: "unit-14",
    unit_type: "XXL",
    note: typeof body.gebruik === "string" ? body.gebruik : null,
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
      bedrijfsnaam:
        typeof body.bedrijfsnaam === "string" ? body.bedrijfsnaam : null,
      intent,
      unit7_notify: unit7Notify,
      source_label: typeof body.source === "string" ? body.source : "unit14",
      form_context:
        typeof body.formContext === "string" ? body.formContext : null,
    },
  });

  if (!result.ok) console.error("[lead-unit14] lead-sync failed", result.error);

  // CRM-signaal: een reservering op de XXL-unit telt als "unit gereserveerd via
  // het portaal"; sparren is een interesse-signaal. Best-effort.
  await sendCrmEvents({
    clpSession: typeof body.clpSession === "string" ? body.clpSession : null,
    email: String(body.email),
    events: [
      {
        event_type: intent === "reserveren" ? "unit:reserved" : "portal:interest",
        url_path: typeof body.path === "string" ? body.path : "/xxl",
        payload: { unit: "Unit 14", intent, unit7_notify: unit7Notify },
      },
    ],
  }).catch((err) => {
    console.error("[lead-unit14] crm-events failed", err);
  });

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
