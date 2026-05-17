import { NextResponse } from "next/server";

const DEFAULT_INTEREST_WEBHOOK =
  "https://hooks.zapier.com/hooks/catch/2082653/4o3wbbu/";

/**
 * Interest endpoint — captureert leads die brochure / documenten / extra
 * informatie willen. De payload wordt doorgestuurd naar Zapier, die hem
 * vervolgens in Brevo zet (lijst #289 "Hofman (F2) Portaal").
 *
 * Configureer in Vercel:
 *   ZAPIER_INTEREST_WEBHOOK = https://hooks.zapier.com/hooks/catch/2082653/4o3wbbu/
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const payload = {
    ...body,
    receivedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? null,
    referer: request.headers.get("referer") ?? null,
  };

  const webhook = process.env.ZAPIER_INTEREST_WEBHOOK ?? DEFAULT_INTEREST_WEBHOOK;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[interest] zapier non-2xx", res.status, await res.text());
    }
  } catch (err) {
    console.error("[interest] zapier failure", err);
    // We blokkeren de UX niet als Zapier down is; lead is gelogd in Vercel.
  }

  console.log("[interest]", payload);

  return NextResponse.json({ ok: true });
}
