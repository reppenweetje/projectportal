"use client";

import { useState } from "react";
import { useFavorite } from "@/lib/favorites";
import { useLeadProfile } from "@/lib/personalization";
import { LeadCaptureDialog } from "@/components/conversion/LeadCaptureDialog";

export function SaveForLater({
  unitSlug,
  unitNumber,
  unitType,
  projectSlug,
}: {
  unitSlug: string;
  unitNumber: number;
  unitType: string;
  projectSlug: string;
}) {
  const { isFavorite, toggle } = useFavorite(unitSlug);
  const profile = useLeadProfile();
  const isVerified = Boolean(profile?.verified);
  const hasIdentity = Boolean(profile?.email);

  const [notify, setNotify] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  // Voor walk-ins zonder account: signup-dialog openen ipv direct
  // favoriet opslaan. Reden: favorieten zijn alleen waardevol als we
  // de lead later kunnen mailen bij statuswijziging — anoniem opslaan
  // in localStorage helpt sales niet. Na signup wordt favoriet automatisch
  // opgeslagen + notify-flag aangezet zodat de lead direct profiteert.
  function onFavoriteClick() {
    if (isFavorite) {
      // Reeds favoriet: unfavorite-actie heeft geen lead-capture nodig
      toggle();
      return;
    }
    if (hasIdentity) {
      // Bekende lead: gewoon togglen, geen modal
      toggle();
      return;
    }
    // Walk-in zonder identity: signup-modal eerst
    setSignupOpen(true);
  }

  function onSignupSuccess() {
    setSignupOpen(false);
    // LeadCaptureForm heeft cookies geset; nu kan toggle() de favoriet
    // bewaren met identity-context.
    toggle();
  }

  async function onToggleNotify(checked: boolean) {
    setNotify(checked);
    if (!checked) return;
    setNotifyBusy(true);
    try {
      await fetch("/api/notify-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectSlug,
          unit: unitSlug,
          email: profile?.email,
          name: profile?.name,
          sessionId: profile?.sessionId,
        }),
      });
      setNotifySaved(true);
    } catch {
      // silent fail; UI optimistic
      setNotifySaved(true);
    } finally {
      setNotifyBusy(false);
    }
  }

  return (
    <div
      className={`rounded-2xl p-5 transition ${
        isFavorite
          ? "bg-rose-50 border border-rose-200"
          : "bg-surface-muted border border-repp-gray"
      }`}
    >
      <p className="text-sm font-bold text-repp-navy">
        Nog niet klaar om te kiezen?
      </p>
      <p className="mt-1 text-xs text-repp-navy/70 leading-relaxed">
        Bewaar Unit {unitNumber} ({unitType}) als favoriet. Dan vind je hem
        terug zodra je er klaar voor bent.
      </p>
      <button
        type="button"
        onClick={onFavoriteClick}
        aria-pressed={isFavorite}
        className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition ${
          isFavorite
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "bg-white text-repp-navy border-2 border-repp-navy hover:bg-repp-navy hover:text-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {isFavorite ? "Bewaard als favoriet" : "Bewaar als favoriet"}
      </button>

      {isVerified && isFavorite && profile?.email && (
        <label className="mt-4 flex items-start gap-2.5 cursor-pointer text-xs text-repp-navy/80">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => onToggleNotify(e.target.checked)}
            disabled={notifyBusy}
            className="mt-0.5 accent-repp-navy"
          />
          <span>
            Mail me bij statuswijziging op{" "}
            <span className="font-semibold">{profile.email}</span>
            {notifySaved && <span className="text-status-available font-bold"> ✓ ingesteld</span>}
          </span>
        </label>
      )}

      <LeadCaptureDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSuccess={onSignupSuccess}
        gateContext={`favorite-unit-${unitSlug}`}
        title="Bewaar Unit als favoriet"
        description={`Om Unit ${unitNumber} (${unitType}) op te slaan, laat je éénmalig je gegevens achter. Dan kunnen we je ook mailen bij statuswijzigingen.`}
        submitLabel={`Bewaar Unit ${unitNumber}`}
      />
    </div>
  );
}
