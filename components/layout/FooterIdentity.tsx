"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearLeadProfile, useLeadProfile } from "@/lib/personalization";

export function FooterIdentity({ projectSlug }: { projectSlug: string }) {
  const profile = useLeadProfile();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!profile?.name) return null;

  async function logout() {
    setBusy(true);
    try {
      // Server wist dh_session + dh_profile (HttpOnly, kan alleen server-side)
      // plus repp_lead voor consistentie. Client wist daarnaast nog z'n eigen
      // repp_lead via clearLeadProfile() en reload't naar / met schone slate.
      await fetch("/api/portal-logout", { method: "POST" });
    } catch (err) {
      console.error("[logout] portal-logout call failed", err);
    }
    clearLeadProfile();
    router.replace(`/${projectSlug}`);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <div className="text-xs text-white/50 flex items-center gap-2 flex-wrap">
      <span>
        Ingelogd als{" "}
        <span className="text-white/70 font-medium">{profile.name}</span>
      </span>
      <span className="text-white/30">·</span>
      {confirming ? (
        <>
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="underline hover:text-white text-white/80 disabled:opacity-60"
          >
            {busy ? "Bezig…" : "Ja, log mij uit"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="underline hover:text-white"
          >
            Annuleer
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="underline hover:text-white"
        >
          Dit ben ik niet
        </button>
      )}
    </div>
  );
}
