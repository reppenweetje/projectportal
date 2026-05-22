import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const reportType = typeof body.reportType === "string" ? body.reportType : null;

  const result = await upsertWalkinLead({
    source: "dehofman_portal_report",
    email: String(body.email),
    first_name: typeof body.name === "string" ? body.name : null,
    temperature: "warm",
    attributes: {
      project: typeof body.project === "string" ? body.project : "de-hofman",
      report_type: reportType,
      context: body.context ?? null,
      source_label: typeof body.source === "string" ? body.source : "report",
    },
  });

  if (!result.ok) console.error("[report] lead-sync failed", result.error);

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
