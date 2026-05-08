import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // TODO: replace with real persistence (Resend audience, Supabase, CRM, etc.)
  console.log("[interest]", {
    project: body.project,
    email: body.email,
    source: body.source,
    context: body.context,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
