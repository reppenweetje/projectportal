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
import { useLeadProfile } from "@/lib/personalization";

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
  // Twee identity-cookies parallel:
  //   dh_profile   — HMAC-signed, gezet door middleware na ?t=TOKEN redeem
  //   repp_lead    — plain JSON, gezet door middleware + door client-side
  //                  useLeadProfile (URL params, CLP-handoff, walk-in submits)
  //
  // Vroeger keek de gate alleen naar dh_profile. Effect: lead die via CLP
  // binnenkwam en email had ingevuld kreeg WEL "Welkom terug" (via repp_lead)
  // maar werd alsnog door de gate gepakt (geen dh_profile cookie). Slechte UX.
  //
  // Nu: gate slaat over als ÓF dh_profile aanwezig is (token-login) ÓF
  // repp_lead een email bevat (lead heeft eerder z'n gegevens gegeven).
  const session = usePortalSession();
  const profile = useLeadProfile();
  const [pending, setPending] = useState<(() => void) | null>(null);

  const hasViaPortal = session?.isReturning === true;
  const hasViaLeadProfile = !!profile?.email;
  const hasSession =
    session === null && profile === null
      ? null
      : hasViaPortal || hasViaLeadProfile;

  const gateOrRun = useCallback(
    (action: () => void) => {
      if (hasViaPortal || hasViaLeadProfile) {
        action();
        return;
      }
      setPending(() => action);
    },
    [hasViaPortal, hasViaLeadProfile],
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
