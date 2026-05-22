"use client";

/**
 * MagicLinkModal — herbruikbaar modal-form waarmee een uitgelogde
 * bezoeker zijn email kan opgeven en een inloglink ontvangt.
 *
 * Gebruikt door:
 *   - FooterLogin       (link onderaan elke pagina)
 *   - LoginNudge        (slim banner onder Header)
 *   - elke andere plek waar we "vraag inloglink"-CTA willen tonen
 *
 * Server-flow:
 *   POST /api/portal-magic-link { email }
 *     → Next.js proxy naar Supabase portal-magic-link Edge Function
 *     → Edge Function zoekt portal_token bij email
 *     → bij match: Brevo SMTP API stuurt mail met /?t=TOKEN link
 *     → response ALTIJD ok:true (zelfs bij onbekend email — geen
 *       email-enumeratie leak)
 *
 * Error-states die we wel surface'n:
 *   - 400 invalid_email     → "Vul een geldig e-mailadres in"
 *   - network/fetch fail    → "Verbinding mislukt, probeer 't zo opnieuw"
 *   - 500 server_misconfig  → behandeld als network fail (zelden,
 *                             alleen als env-vars ontbreken in Vercel)
 *
 * Errors die NIET zichtbaar zijn (intentioneel):
 *   - Email bestaat niet → toont "check je mailbox" zoals bij succes
 *     (anders kan iemand systematisch email-adressen valideren)
 *   - Brevo SMTP faalt → toont "check je mailbox" + Edge Function
 *     logt fail naar Supabase logs. Sales kan dat in dashboard zien.
 */

import { useState, type FormEvent } from "react";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";

type Step = "idle" | "submitting" | "done" | "error";

export function MagicLinkModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/portal-magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.status === 400) {
        setErrorMsg("Vul een geldig e-mailadres in.");
        setStep("error");
        return;
      }
      if (!res.ok) {
        // 5xx is zelden; surface generic message. Server-side log heeft
        // de echte fout-stack (Vercel function logs).
        setErrorMsg("Er ging iets mis. Probeer 't zo nog eens.");
        setStep("error");
        return;
      }
      setStep("done");
    } catch {
      // Network fail (offline, DNS, CORS). Geen detail leaken.
      setErrorMsg("Verbinding mislukt. Check je internet en probeer opnieuw.");
      setStep("error");
    }
  }

  function reset() {
    setEmail("");
    setStep("idle");
    setErrorMsg(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={reset}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 md:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold">
              De Hofman
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-repp-navy">
              Vraag een inloglink aan
            </h2>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Sluit"
            className="text-repp-navy/50 hover:text-repp-navy text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {step === "done" ? (
          <div className="mt-5">
            <p className="text-sm text-repp-navy/80 leading-relaxed">
              Check je mailbox. Als we je adres kennen ligt er een
              inloglink klaar. De link werkt 60 dagen vanaf nu.
            </p>
            <p className="mt-2 text-xs text-repp-navy/60">
              Geen mail binnen 5 minuten? Check je spam-folder, of bel
              ons direct op{" "}
              <a
                href="tel:+31202610080"
                className="font-semibold text-repp-navy underline hover:text-repp-blue"
              >
                020 261 0080
              </a>{" "}
              — dan helpen we je meteen verder.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 w-full inline-flex items-center justify-center bg-repp-navy text-white text-sm font-bold px-4 py-3 rounded-full hover:bg-repp-blue transition"
            >
              Sluit
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
            <p className="text-sm text-repp-navy/70 leading-relaxed">
              Eerder gegevens achtergelaten? Vul je e-mailadres in,
              dan sturen we een directe inloglink.
            </p>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-repp-navy/55 font-semibold">
                E-mailadres
              </span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                disabled={step === "submitting"}
                className="mt-1 w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue disabled:opacity-60"
              />
            </label>
            {errorMsg && (
              <p className="text-sm text-red-600 leading-snug">⚠ {errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={step === "submitting"}
              className="w-full inline-flex items-center justify-center bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-3 rounded-full hover:brightness-95 transition disabled:opacity-60"
            >
              {step === "submitting"
                ? "Versturen…"
                : "Stuur me een inloglink"}
            </button>
            <PrivacyConsent
              tone="muted"
              actionLabel="versturen"
              className="pt-1"
            />
            <p className="text-[11px] text-repp-navy/50 leading-relaxed">
              Geen account bij ons? Vul dan eerst een formulier in op de
              site (reservering, brochure, etc.) — je krijgt automatisch
              een inloglink mee.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
