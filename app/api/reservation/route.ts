import { NextResponse } from "next/server";

const DEFAULT_RESERVATION_WEBHOOK =
  "https://hooks.zapier.com/hooks/catch/2082653/4o3w4tw/";

/**
 * Reservation endpoint — captureert leads die een unit op naam willen of
 * zich op de wachtlijst willen zetten. De payload wordt doorgestuurd naar
 * Zapier, die hem in Brevo zet (lijst #290 "Hofman (F2) Portaal
 * Registraties") en de transactionele mail #1249 verstuurt.
 *
 * Configureer in Vercel:
 *   ZAPIER_RESERVATION_WEBHOOK = https://hooks.zapier.com/hooks/catch/2082653/4o3w4tw/
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
    typeof body.unit !== "string"
  ) {
    return NextResponse.json({ error: "Gegevens onvolledig" }, { status: 400 });
  }

  const payload = {
    ...body,
    receivedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? null,
    referer: request.headers.get("referer") ?? null,
  };

  const webhook =
    process.env.ZAPIER_RESERVATION_WEBHOOK ?? DEFAULT_RESERVATION_WEBHOOK;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        "[reservation] zapier non-2xx",
        res.status,
        await res.text(),
      );
    }
  } catch (err) {
    console.error("[reservation] zapier failure", err);
    // Niet blokkerend: lead is gelogd in Vercel, makelaar kan handmatig
    // bijwerken als Zapier even hapert.
  }

  console.log("[reservation]", payload);

  return NextResponse.json({ ok: true });
}
