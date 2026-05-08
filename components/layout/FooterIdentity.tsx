"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearLeadProfile, useLeadProfile } from "@/lib/personalization";

export function FooterIdentity({ projectSlug }: { projectSlug: string }) {
  const profile = useLeadProfile();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  if (!profile?.name) return null;

  function logout() {
    clearLeadProfile();
    router.replace(`/${projectSlug}`);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <div className="text-xs text-white/50 flex items-center gap-2">
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
            className="underline hover:text-white text-white/80"
          >
            Ja, log uit
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
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
          Niet ik / log uit
        </button>
      )}
    </div>
  );
}
