"use client";

import { useState } from "react";
import { useLeadProfile } from "@/lib/personalization";

/**
 * FooterLogin — toont "Inloggen op je account" link voor uitgelogde
 * bezoekers. Modal vraagt email, server zoekt portal_token en stuurt
 * magic-link via Brevo.
 *
 * Render-logica: alleen tonen als er GEEN identity is. Spiegelt
 * FooterIdentity die alleen rendert als profile.name bestaat. Samen
 * dekken ze beide states zonder visuele dubbeling.
 */
export function FooterLogin() {
  const profile = useLeadProfile();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Niet tonen als al ingelogd
  if (profile?.name) return null;

  async function onSubmit(e: React.FormEvent) {
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
      setStep("done");
    } catch {
      setErrorMsg("Verbinding mislukt. Probeer 't zo opnieuw.");
      setStep("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-white/60 underline hover:text-white"
      >
        Inloggen op je account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
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
                  Inloggen op je account
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluit"
                className="text-repp-navy/50 hover:text-repp-navy text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {step === "done" ? (
              <div className="mt-5">
                <p className="text-sm text-repp-navy/80 leading-relaxed">
                  Check je mailbox. We hebben een inloglink gestuurd naar het
                  opgegeven adres als we 'm in onze administratie kennen. De
                  link werkt 60 dagen.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 w-full inline-flex items-center justify-center bg-repp-navy text-white text-sm font-bold px-4 py-3 rounded-full hover:bg-repp-blue transition"
                >
                  Sluit
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-5 space-y-3">
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
                    className="mt-1 w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
                  />
                </label>
                {errorMsg && (
                  <p className="text-sm text-red-600">⚠ {errorMsg}</p>
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
                <p className="text-[11px] text-repp-navy/50 leading-relaxed pt-1">
                  Geen account bij ons? Vul dan eerst een formulier in op
                  de site (reservering, brochure, etc.) — je krijgt automatisch
                  een account met deze inloglink.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
