/**
 * GET /api/download/[slug]
 *
 * DE ENIGE manier om aan de document-PDF-bytes te komen. De bestanden
 * staan bewust BUITEN /public (in private/docs/de-hofman/), dus er is geen
 * statische publieke URL meer. Deze route is de echte lockdown:
 *
 *  1. Sessie-check: alleen bezoekers met een geldige `dh_session`
 *     (HttpOnly, server-gevalideerd via portal-resolve) krijgen de bytes.
 *     Geen sessie → 403. Zo komt niemand bij de brochure zonder eerst de
 *     lead-gate te hebben ingevuld, ook niet via een directe URL of crawler.
 *  2. Serveert met een server-gecontroleerde Content-Disposition zodat het
 *     bestand bij download altijd "De Hofman <label>.pdf" heet.
 *
 * Twee modi via query:
 *   (default)   → Content-Disposition: attachment  (echte download)
 *   ?inline=1   → Content-Disposition: inline       (iframe-preview in viewer)
 * Beide achter dezelfde sessie-check.
 *
 * Path mapping (doc.href als fs-sleutel, nu binnen private/):
 *   doc.slug             →  bestand in /private/docs/de-hofman/
 *   brochure             →  brochure.pdf
 *   koop-aannemingsovereenkomst  →  koop-aannemingsovereenkomst-concept.pdf
 *
 * Voor unknown slug → 404. Geen sessie → 403.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projects } from "@/lib/projects/de-hofman";
import { getPortalSession } from "@/lib/portal-session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // ─── Sessie-gate: zonder dh_session geen bytes ──────────────────────────
  // getPortalSession() valideert het HttpOnly dh_session-token. Een bezoeker
  // kan dh_profile/repp_lead vervalsen, maar dat helpt hier niet: we kijken
  // uitsluitend naar de server-gevalideerde sessie. Walk-in leads krijgen na
  // het invullen van de gate wél een dh_session (via middleware ?t= of
  // /api/portal-session), dus dit sluit echte leads niet buiten.
  const session = await getPortalSession();
  if (!session.isReturning) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // Vind het document op slug in de project-catalog. We pakken
  // het eerste project dat 'm heeft — bij multi-project setup
  // moet de URL waarschijnlijk /<projectSlug>/download/<docSlug>
  // worden.
  const project = projects[0];
  if (!project) {
    return Response.json({ error: "no_project" }, { status: 404 });
  }
  const doc = project.documents.find((d) => d.slug === slug);
  if (!doc) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // Mapping doc.href ("/docs/de-hofman/brochure.pdf") naar absolute fs-path.
  // De map zit nu in private/ (buiten /public) — zie next.config.ts
  // outputFileTracingIncludes zodat Vercel 'm meebundelt.
  const rel = doc.href.replace(/^\//, "");
  const fsPath = join(process.cwd(), "private", rel);

  let buffer: Buffer;
  try {
    buffer = await readFile(fsPath);
  } catch (err) {
    console.error("[download] read failed", slug, err);
    return Response.json({ error: "read_failed" }, { status: 404 });
  }

  // ?inline=1 → preview in de viewer-iframe (Content-Disposition inline).
  // Anders → echte download (attachment).
  const inline = new URL(request.url).searchParams.get("inline") === "1";

  // Filename: "De Hofman <label>.pdf" — label.lowercase voor match met
  // gebruikers wens ("De Hofman brochure", "De Hofman prijslijst").
  const filename = `${project.name} ${doc.label.toLowerCase()}.pdf`;

  // RFC 5987 encoding voor non-ASCII chars in filename (zoals spaties).
  // Browsers begrijpen `filename*=UTF-8''<encoded>` als modern fallback,
  // plus de eenvoudige `filename="..."` voor oudere clients.
  const encodedFilename = encodeURIComponent(filename);
  const disposition = inline ? "inline" : "attachment";

  // Blob ipv Uint8Array zodat TS niet probeert het naar URLSearchParams
  // te narrowen (Web Response constructor overload-resolver quirk).
  const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      "Content-Length": String(buffer.byteLength),
      // Private: de bytes zijn sessie-gebonden, nooit door een shared/CDN
      // cache opslaan (anders lekt een gecachte respons naar niet-ingelogde
      // bezoekers). no-store sluit dat uit.
      "Cache-Control": "private, no-store",
    },
  });
}
