"use client";

import { useState } from "react";
import { useLeadProfile } from "@/lib/personalization";
import { MagicLinkModal } from "@/components/conversion/MagicLinkModal";

/**
 * FooterLogin — secundaire "Inloggen op je account" link in de footer.
 * De primaire prompt zit in LoginNudge (banner onder Header). Hier voor
 * gebruikers die niet meer scrollen of die expliciet zoeken in footer-tray.
 *
 * Deelt MagicLinkModal met LoginNudge zodat fail-modes + copy identiek
 * blijven (1 plek onderhouden).
 */
export function FooterLogin() {
  const profile = useLeadProfile();
  const [open, setOpen] = useState(false);

  // Niet tonen als al ingelogd
  if (profile?.name) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-white/60 underline hover:text-white"
      >
        Inloggen op je account
      </button>
      <MagicLinkModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
