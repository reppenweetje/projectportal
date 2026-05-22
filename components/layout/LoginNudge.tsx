"use client";

/**
 * LoginNudge — banner direct onder de Header voor uitgelogde bezoekers.
 *
 * Twee CTAs side-by-side, met duidelijke hiërarchie:
 *
 *   1. PRIMARY (geel) — "Maak account" → opent LeadCaptureDialog met
 *      voornaam + email + telefoon. Na submit: lead in Supabase + Brevo
 *      + Zapier, cookies geset, ingelogd. Voor walk-ins zonder account.
 *
 *   2. SECONDARY (subtiel) — "Inloglink aanvragen" → opent MagicLinkModal.
 *      Voor returning leads die hun cookies kwijt zijn (incognito, ander
 *      device, gewist).
 *
 * Visueel: navy achtergrond (matched de Header), gele tekst voor primary
 * boodschap, witter/dimmer voor secondary. Voelt als verlenging van de
 * header, niet als een aparte grey strip.
 *
 * Niet sticky — scrollt mee. Verschijnt alleen voor uitgelogde bezoekers.
 */

import { useState } from "react";
import { useLeadProfile } from "@/lib/personalization";
import { useRouter } from "next/navigation";
import { LeadCaptureDialog } from "@/components/conversion/LeadCaptureDialog";
import { MagicLinkModal } from "@/components/conversion/MagicLinkModal";

export function LoginNudge() {
  const profile = useLeadProfile();
  const router = useRouter();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Logged-in users zien geen nudge
  if (profile?.name) return null;

  function onSignupSuccess() {
    setSignupOpen(false);
    // LeadCaptureForm heeft via /api/portal-session de cookies al gezet.
    // Refresh zodat PersonalizationBanner verschijnt en deze nudge weg gaat.
    router.refresh();
  }

  return (
    <>
      <div className="bg-repp-navy text-white border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* Primary message */}
          <div className="flex items-center gap-3 min-w-0 text-xs sm:text-sm">
            <span className="text-repp-yellow font-bold leading-snug">
              De verkoop is open!
            </span>
            <span className="text-white/80 leading-snug hidden sm:inline">
              Maak een account voor toegang tot alle info.
            </span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSignupOpen(true)}
              // Wit met navy tekst — onderscheidt van de gele "Reserveer"
              // CTA in de Header zodat de twee CTAs niet visueel
              // concurreren.
              className="inline-flex items-center bg-white text-repp-navy text-[11px] sm:text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-full hover:bg-white/90 transition whitespace-nowrap"
            >
              Maak account →
            </button>
            <span className="text-white/30 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="text-[11px] sm:text-xs text-white/70 hover:text-white underline whitespace-nowrap"
            >
              Heb je al een account?
            </button>
          </div>
        </div>
      </div>

      <LeadCaptureDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSuccess={onSignupSuccess}
        gateContext="login-nudge-signup"
        title="Maak je account aan"
        description="Eénmalig je gegevens achterlaten, dan heb je vanaf nu direct toegang tot alle documenten, prijzen en de plattegrond. Geen wachtwoord nodig — we onthouden je via een veilige link in je mail."
        submitLabel="Maak mijn account"
      />

      <MagicLinkModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
