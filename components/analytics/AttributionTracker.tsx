"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Onzichtbare client-component die bij de eerste render de marketing-herkomst
 * uit de URL leest en in het `repp_attr` cookie vastlegt (zie lib/attribution.ts).
 *
 * Eén keer mounten in app/layout.tsx, in de <body>. Rendert niks. Draait alleen
 * client-side; SSR doet niets dankzij de guards in captureAttribution().
 */
export default function AttributionTracker(): null {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
