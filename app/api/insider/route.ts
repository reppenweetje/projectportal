import { NextResponse } from "next/server";
import { upsertWalkinLead } from "@/lib/lead-sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const modus =
    body.modus === "ondernemer" || body.modus === "belegger"
      ? body.modus
      : null;

  const result = await upsertWalkinLead({
    source: "dehofman_portal_insider",
    email: String(body.email),
    first_name: typeof body.name === "string" ? body.name : null,
    modus,
    temperature: "warm",
    attributes: {
      topic: typeof body.topic === "string" ? body.topic : null,
      source_label: typeof body.source === "string" ? body.source : "insider",
    },
  });

  if (!result.ok) console.error("[insider] lead-sync failed", result.error);

  return NextResponse.json({
    ok: true,
    portal_token: result.portal_token ?? null,
  });
}
