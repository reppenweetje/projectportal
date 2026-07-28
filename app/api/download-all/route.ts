/**
 * GET /api/download-all
 *
 * Levert ALLE projectdocumenten in één ZIP ("De Hofman documenten.zip").
 * Zelfde lockdown als /api/download/[slug]: alleen bezoekers met een geldige
 * dh_session (server-gevalideerd) krijgen de bytes; geen sessie → 403. Zo komt
 * niemand aan het complete pakket zonder eerst de lead-gate te passeren.
 *
 * De PDF's staan buiten /public (in private/docs/de-hofman/); next.config.ts
 * bundelt die map mee voor deze route via outputFileTracingIncludes.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projects } from "@/lib/projects/de-hofman";
import { getPortalSession } from "@/lib/portal-session";
import { createZip } from "@/lib/zip";

export const runtime = "nodejs";

export async function GET() {
  // ─── Sessie-gate: zonder dh_session geen bytes ──────────────────────────
  const session = await getPortalSession();
  if (!session.isReturning) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const project = projects[0];
  if (!project) {
    return Response.json({ error: "no_project" }, { status: 404 });
  }

  // Lees alle document-PDF's uit private/. Een enkel ontbrekend bestand mag
  // de hele download niet blokkeren: we slaan het over en gaan door.
  const files: { name: string; data: Buffer }[] = [];
  for (const doc of project.documents) {
    const rel = doc.href.replace(/^\//, "");
    const fsPath = join(process.cwd(), "private", rel);
    try {
      const data = await readFile(fsPath);
      // Nette bestandsnaam in de zip, consistent met de losse download.
      files.push({ name: `${project.name} ${doc.label.toLowerCase()}.pdf`, data });
    } catch (err) {
      console.error("[download-all] read failed", doc.slug, err);
    }
  }

  if (files.length === 0) {
    return Response.json({ error: "read_failed" }, { status: 404 });
  }

  const zip = createZip(files);
  const filename = `${project.name} documenten.zip`;
  const encodedFilename = encodeURIComponent(filename);

  const blob = new Blob([new Uint8Array(zip)], { type: "application/zip" });
  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      "Content-Length": String(zip.byteLength),
      // Sessie-gebonden bytes: nooit in een shared/CDN-cache.
      "Cache-Control": "private, no-store",
    },
  });
}
