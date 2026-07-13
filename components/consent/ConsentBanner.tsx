"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACCEPT_ALL,
  CONSENT_OPEN_EVENT,
  REJECT_ALL,
  hasConsentDecision,
  reapplyStoredConsent,
  setConsent,
  getConsent,
} from "@/lib/consent";

/**
 * Laagdrempelige, niet-blokkerende cookie-banner.
 *
 * Laagste drempel die óók AVG-proof is: de site blijft zichtbaar en
 * bruikbaar; "Accepteren" en "Weigeren" zijn twee gelijkwaardige één-tik-
 * knoppen (geen dark pattern, geen verstopte weiger-knop). Een rustige
 * "Voorkeuren"-link opent de granulaire toggles voor wie wil finetunen.
 *
 * - Bij mount: reeds gekozen -> niks tonen, wel de opgeslagen keuze opnieuw
 *   naar Consent Mode signaleren (reapplyStoredConsent).
 * - Nog niet gekozen -> banner tonen.
 * - Luistert naar CONSENT_OPEN_EVENT zodat een footer-link 'm heropent.
 */
export default function ConsentBanner({
  privacyHref,
}: {
  privacyHref: string;
}): React.ReactElement | null {
  // undefined = nog niet bepaald (SSR/eerste render), voorkomt hydration-flits.
  const [visible, setVisible] = useState<boolean | undefined>(undefined);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (hasConsentDecision()) {
      reapplyStoredConsent();
      setVisible(false);
    } else {
      setVisible(true);
    }
    const onOpen = () => {
      const cur = getConsent();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setShowPrefs(false);
    setVisible(false);
  }, []);

  const acceptAll = useCallback(() => {
    setConsent(ACCEPT_ALL);
    close();
  }, [close]);

  const rejectAll = useCallback(() => {
    setConsent(REJECT_ALL);
    close();
  }, [close]);

  const savePrefs = useCallback(() => {
    setConsent({ analytics, marketing });
    close();
  }, [analytics, marketing, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:p-4"
      role="dialog"
      aria-live="polite"
      aria-label="Cookievoorkeuren"
    >
      <div className="w-full max-w-2xl rounded-card border border-repp-gray bg-surface shadow-xl">
        {!showPrefs ? (
          <div className="flex flex-col gap-4 p-5">
            <div>
              <p className="text-sm font-semibold text-ink">
                We gebruiken cookies
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Voor een goed werkende site en, met jouw toestemming, om bezoek
                te meten en advertenties relevanter te maken. Lees ons{" "}
                <a
                  href={privacyHref}
                  className="underline underline-offset-2 hover:text-ink"
                >
                  cookiebeleid
                </a>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 rounded-full bg-[#2e9e57] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#268a4c] sm:order-2"
              >
                Accepteren
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="order-2 rounded-full border border-repp-gray px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-surface-muted sm:order-1"
              >
                Weigeren
              </button>
              <button
                type="button"
                onClick={() => {
                  const cur = getConsent();
                  setAnalytics(cur?.analytics ?? false);
                  setMarketing(cur?.marketing ?? false);
                  setShowPrefs(true);
                }}
                className="order-3 px-2 py-2.5 text-sm text-ink-soft underline underline-offset-2 transition hover:text-ink sm:ml-auto"
              >
                Voorkeuren
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5">
            <p className="text-sm font-semibold text-ink">Cookievoorkeuren</p>
            <div className="flex flex-col divide-y divide-repp-gray/60">
              <PrefRow
                title="Noodzakelijk"
                desc="Nodig om de site te laten werken (o.a. inloggen en beveiliging). Altijd aan."
                checked
                disabled
              />
              <PrefRow
                title="Analytics"
                desc="Anoniem meten hoe de site gebruikt wordt, zodat we 'm kunnen verbeteren."
                checked={analytics}
                onChange={setAnalytics}
              />
              <PrefRow
                title="Marketing"
                desc="Advertenties op Google en Meta relevanter maken en conversies meten."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={savePrefs}
                className="order-2 rounded-full border border-repp-navy px-5 py-2.5 text-sm font-semibold text-repp-navy transition hover:bg-repp-navy/5 sm:order-1"
              >
                Selectie opslaan
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 rounded-full bg-[#2e9e57] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#268a4c] sm:order-2"
              >
                Alles accepteren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrefRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}): React.ReactElement {
  return (
    <label
      className={`flex items-start gap-3 py-3 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-repp-navy disabled:opacity-50"
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{title}</span>
        <span className="text-xs leading-relaxed text-ink-soft">{desc}</span>
      </span>
    </label>
  );
}
