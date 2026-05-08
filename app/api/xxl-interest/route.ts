import { NextResponse } from "next/server";

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

  // TODO: persist XXL waitlist subscription, notify makelaar via Slack/email,
  // tag in CRM, send confirmation mail via Resend.
  console.log("[xxl-interest]", {
    ...body,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
