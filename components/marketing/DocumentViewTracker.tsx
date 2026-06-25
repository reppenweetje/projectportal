"use client";

/**
 * DocumentViewTracker — vuurt het Plausible custom-event `document_opened`
 * één keer wanneer een (ingelogde) bezoeker een document-viewer opent.
 *
 * Wordt ALLEEN gerenderd voor bezoekers die de lead-gate gepasseerd zijn
 * (de viewer-page guardt op `session.isReturning`), zodat dit event een
 * échte, herkenbare lead-actie meet — niet een geblurde gate-view.
 *
 * Rendert niets; puur een side-effect on mount.
 */

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

export function DocumentViewTracker({
  slug,
  type,
}: {
  slug: string;
  type: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track("document_opened", { slug, type });
  }, [slug, type]);
  return null;
}
