/**
 * GET /api/download/[slug]
 *
 * Serveert een document met een server-gecontroleerde Content-Disposition
 * header zodat het bestand bij download altijd "De Hofman <label>.pdf"
 * heet, ongeacht hoe de gebruiker download:
 *
 *   - Klik op "Download PDF" knop      → download="..." attribute werkt
 *   - Rechts-klik → "Opslaan als"      → browser pakt Content-Disposition
 *   - PDF-viewer save-icon             → Content-Disposition wint van URL
 *   - Mobiel: tik + Share → Bewaar     → idem
 *
 * Het static <object> en <iframe> in de viewer pages BLIJVEN naar
 * /docs/de-hofman/<slug>.pdf wijzen voor in-page rendering (sneller,
 * geen ongecachede round-trip). Alleen de download-actie gaat via
 * deze route.
 *
 * Path mapping:
 *   doc.slug             →  bestand in /public/docs/de-hofman/
 *   brochure             →  brochure.pdf
 *   koop-aannemingsovereenkomst  →  koop-aannemingsovereenkomst-concept.pdf
 *
 * Voor unknown slug → 404.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projects } from "@/lib/projects/de-hofman";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

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

  // Mapping doc.href ("/docs/de-hofman/brochure.pdf") naar absolute
  // fs-path binnen /public.
  const rel = doc.href.replace(/^\//, "");
  const fsPath = join(process.cwd(), "public", rel);

  let buffer: Buffer;
  try {
    buffer = await readFile(fsPath);
  } catch (err) {
    console.error("[download] read failed", slug, err);
    return Response.json({ error: "read_failed" }, { status: 404 });
  }

  // Filename: "De Hofman <label>.pdf" — label.lowercase voor match met
  // gebruikers wens ("De Hofman brochure", "De Hofman prijslijst").
  const filename = `${project.name} ${doc.label.toLowerCase()}.pdf`;

  // RFC 5987 encoding voor non-ASCII chars in filename (zoals spaties).
  // Browsers begrijpen `filename*=UTF-8''<encoded>` als modern fallback,
  // plus de eenvoudige `filename="..."` voor oudere clients.
  const encodedFilename = encodeURIComponent(filename);

  // Blob ipv Uint8Array zodat TS niet probeert het naar URLSearchParams
  // te narrowen (Web Response constructor overload-resolver quirk).
  const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
