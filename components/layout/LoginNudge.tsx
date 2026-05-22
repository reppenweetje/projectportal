"use client";

/**
 * LoginNudge — slim banner direct onder de Header voor uitgelogde
 * bezoekers. Twee use-cases gedekt:
 *
 *   1. NIEUWE walk-ins (geen account)        → primary CTA "vraag
 *      een unit aan" of "bekijk de brochure" leidt ze door de normale
 *      lead-capture flows (waar ze hun gegevens achterlaten en
 *      automatisch een portal_token krijgen). Geen aparte signup.
 *
 *   2. RETURNING leads zonder cookies (incognito, andere device,
 *      cleared cookies) → secondary CTA "inloglink aanvragen" opent
 *      MagicLinkModal die hun bekende portal_token via mail stuurt.
 *
 * Render-policy: alleen tonen als er GEEN profile is. Verified gebruikers
 * zien dit niet — die hebben al volledige toegang.
 *
 * Niet sticky want anders concurreert 'ie met de sticky Header.
 * Wel altijd boven de fold zichtbaar bij eerste pageload.
 */

import { useState } from "react";
import { useLeadProfile } from "@/lib/personalization";
import { MagicLinkModal } from "@/components/conversion/MagicLinkModal";

export function LoginNudge() {
  const profile = useLeadProfile();
  const [open, setOpen] = useState(false);

  // Logged-in users zien geen nudge
  if (profile?.name) return null;

  return (
    <>
      <div className="bg-repp-navy/[0.04] border-b border-repp-navy/10 text-repp-navy">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <p className="leading-snug min-w-0">
            <span className="font-semibold">
              Laat je gegevens achter voor toegang tot alle documenten.
            </span>
            <span className="hidden sm:inline text-repp-navy/65">
              {" "}
              Al een keer ingevuld? Vraag een inloglink aan.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 inline-flex items-center gap-1 bg-repp-navy text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full hover:bg-repp-blue transition whitespace-nowrap"
          >
            Inloglink<span aria-hidden> →</span>
          </button>
        </div>
      </div>
      <MagicLinkModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
