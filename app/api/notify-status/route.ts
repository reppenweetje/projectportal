import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body.email !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await upsertWalkinLead({
    source: "dehofman_portal_notify",
    email: String(body.email),
    first_name: typeof body.name === "string" ? body.name : null,
    temperature: "warm",
    attributes: {
      project: typeof body.project === "string" ? body.project : "de-hofman",
      unit_id: typeof body.unitSlug === "string" ? body.unitSlug : null,
      reason: typeof body.reason === "string" ? body.reason : "status-change",
      source_label: typeof body.source === "string" ? body.source : "notify",
    },
  });

  if (!result.ok) console.error("[notify-status] lead-sync failed", result.error);

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
