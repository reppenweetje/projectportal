"use client";

/**
 * useLeadCapture — hook voor action-getriggerde lead-gate.
 *
 * Voor walk-in bezoekers die iets willen doen waarvoor wij hun gegevens
 * willen vasthouden (document openen, rapport mailen, etc.). De hook
 * geeft je een gateOrRun() functie + een Dialog-component dat je in de
 * tree rendert:
 *
 *   const { gateOrRun, dialog } = useLeadCapture({
 *     gateContext: 'documenten',
 *     title: 'Even je gegevens',
 *     description: '...',
 *   });
 *
 *   <button onClick={() => gateOrRun(() => openDoc())}>Bekijk</button>
 *   {dialog}
 *
 * gateOrRun(action) gedraagt zich:
 *   - Heeft cookie → action() direct uitgevoerd, geen popup
 *   - Geen cookie → popup verschijnt, na succesvolle submit: action() runt
 *   - User sluit popup → action() NIET uitgevoerd
 */

import { useCallback, useState, type ReactNode } from "react";
import { LeadCaptureDialog } from "@/components/conversion/LeadCaptureDialog";
import { usePortalSession } from "@/lib/portal-session-client";

export function useLeadCapture(config: {
  gateContext: string;
  title: string;
  description: string;
  submitLabel?: string;
}): {
  gateOrRun: (action: () => void) => void;
  dialog: ReactNode;
  hasSession: boolean | null;
} {
  const session = usePortalSession();
  const [pending, setPending] = useState<(() => void) | null>(null);

  const hasSession = session === null ? null : session.isReturning;

  const gateOrRun = useCallback(
    (action: () => void) => {
      // session === null: hook is nog niet gehydrateerd. Conservatief
      // gedrag: vraag toch om gegevens. Anders krijgt iemand zonder
      // cookie de actie meteen gegund (faalt later op gate-check).
      if (session?.isReturning) {
        action();
        return;
      }
      setPending(() => action);
    },
    [session],
  );

  const dialog = (
    <LeadCaptureDialog
      open={pending !== null}
      onClose={() => setPending(null)}
      onSuccess={() => {
        const action = pending;
        setPending(null);
        action?.();
      }}
      gateContext={config.gateContext}
      title={config.title}
      description={config.description}
      submitLabel={config.submitLabel}
    />
  );

  return { gateOrRun, dialog, hasSession };
}
