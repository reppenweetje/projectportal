"use client";

import { useState } from "react";
import { updateProfile, useLeadProfile } from "@/lib/personalization";
import { fireMetaLead } from "@/lib/metaPixel";
import { track } from "@/lib/track";
import { HONEYPOT_FIELD, isHoneypotTripped } from "@/lib/botGuard";
import { Honeypot } from "@/components/conversion/Honeypot";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";

type Tone = "light" | "dark";

export function EmailCaptureForm({
  source,
  context,
  ctaLabel = "Stuur me",
  successText,
  tone = "light",
  onCaptured,
  /** Optional callback that runs the actual delivery (mail, status sub, etc.) */
  onSubmit,
}: {
  source: string;
  context?: Record<string, unknown>;
  ctaLabel?: string;
  successText: string;
  tone?: Tone;
  onCaptured?: (profile: { name: string; email: string }) => void;
  onSubmit?: (profile: { name: string; email: string }) => Promise<void>;
}) {
  const profile = useLeadProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hp, setHp] = useState("");

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    // Honeypot: bot vulde het verborgen veld in. Doe alsof het lukte, stuur
    // niets door en zet geen profiel-cookie.
    if (isHoneypotTripped(hp)) {
      setDone(true);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      // Always persist to profile cookie
      updateProfile({
        name: name.trim() || profile?.name,
        email: email.trim(),
        source: profile?.source ?? "gate",
      });
      // Log lead capture
      fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          source,
          context,
          project: "de-hofman",
          [HONEYPOT_FIELD]: hp,
        }),
      }).catch(() => {});
      // Optional task (mail, etc.)
      if (onSubmit) await onSubmit({ name, email });
      // Plausible + dataLayer: elke lead-submit telt als interest_captured,
      // zodat Google (via de GTM Custom Event-trigger) deze exit-popup-leads
      // net als de andere formulieren als conversie meeneemt.
      track("interest_captured", { source });
      // Meta-conversie: alleen voor Meta-ad-verkeer, max 1x per bezoeker
      // (gate + dedup in lib/metaPixel.ts).
      fireMetaLead("email-capture", { source });
      setDone(true);
      onCaptured?.({ name, email });
    } catch {
      setErr("Er ging iets mis, probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p
        className={`text-sm font-semibold ${
          tone === "dark" ? "text-repp-yellow" : "text-status-available"
        }`}
      >
        ✓ {successText}
      </p>
    );
  }

  const inputCls =
    tone === "dark"
      ? "rounded-full bg-white/10 border border-white/30 text-white placeholder-white/50 focus:bg-white/15 focus:ring-repp-yellow"
      : "rounded-full bg-white border border-repp-gray text-repp-navy placeholder-repp-navy/40 focus:ring-repp-blue";

  const btnCls =
    tone === "dark"
      ? "bg-repp-yellow text-repp-navy hover:brightness-95"
      : "bg-repp-navy text-white hover:bg-repp-blue";

  const errCls = tone === "dark" ? "text-rose-200" : "text-red-600";

  return (
    // Form is altijd vertikaal — wordt o.a. in modals gebruikt waar de
    // horizontale variant fields squeezed in onleesbare smalle pills.
    // Naam → Email → Submit-knop stacked + privacy-tekst eronder.
    <form onSubmit={handle} className="flex flex-col gap-2.5">
      <Honeypot value={hp} onChange={setHp} />
      <input
        type="text"
        autoComplete="given-name"
        placeholder="Naam"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${inputCls}`}
      />
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="jouw@email.nl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${inputCls}`}
      />
      <button
        type="submit"
        disabled={busy}
        className={`w-full px-5 py-3 rounded-full text-sm font-bold transition disabled:opacity-60 ${btnCls}`}
      >
        {busy ? "…" : ctaLabel}
      </button>
      {err && <p className={`text-xs ${errCls}`}>{err}</p>}
      <PrivacyConsent
        tone={tone === "dark" ? "dark" : "muted"}
        actionLabel="verzenden"
      />
    </form>
  );
}
