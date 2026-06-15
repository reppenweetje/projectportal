import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";
import { HONEYPOT_FIELD, isHoneypotTripped } from "@/lib/botGuard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Honeypot: bot vulde het verborgen veld in. Doe alsof alles lukte, maar
  // sla niets op en notify niemand.
  if (isHoneypotTripped(body[HONEYPOT_FIELD])) {
    return NextResponse.json({ ok: true, portal_token: null });
  }

  const result = await upsertWalkinLead({
    source: "dehofman_portal_interest",
    email: String(body.email),
    first_name: typeof body.name === "string" ? body.name : null,
    temperature: "warm",
    attributes: {
      project: typeof body.project === "string" ? body.project : "de-hofman",
      context: typeof body.context === "string" ? body.context : null,
      source_label: typeof body.source === "string" ? body.source : "interest",
    },
  });

  if (!result.ok) console.error("[interest] lead-sync failed", result.error);

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
