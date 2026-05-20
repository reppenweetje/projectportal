"use client";

import { useEffect, useState } from "react";
import { updateProfile, useLeadProfile } from "@/lib/personalization";
import type { Project } from "@/lib/types";
import { track } from "@/lib/track";

type Modus = "ondernemer" | "belegger" | "beide";
type Topic = "alles" | "prijzen" | "xxl" | "status";

type Variant = "full" | "compact";

const TOPIC_LABELS: Record<Topic, string> = {
  alles: "Alles wat relevant is",
  prijzen: "Alleen prijswijzigingen",
  xxl: "Alleen XXL-verkoop",
  status: "Alleen statuswijzigingen",
};

export function InsiderSignup({
  project,
  variant = "full",
  source = "insider-signup",
  tone = "light",
}: {
  project: Project;
  variant?: Variant;
  source?: string;
  tone?: "light" | "dark";
}) {
  const profile = useLeadProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [modus, setModus] = useState<Modus>("beide");
  const [topic, setTopic] = useState<Topic>("alles");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.name && !name) setName(profile.name);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.modus && profile.modus !== "ondernemer" &&
          profile.modus !== "belegger") {
        // type-narrowed
      } else if (profile.modus) {
        setModus(profile.modus);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    setError(null);
    try {
      updateProfile({
        name: name.trim() || profile?.name,
        email: email.trim(),
        modus: modus === "beide" ? profile?.modus : modus,
        source: profile?.source ?? source,
      });
      const res = await fetch("/api/insider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          name,
          email,
          modus,
          topic,
          source,
          sessionId: profile?.sessionId,
        }),
      });
      if (!res.ok) throw new Error("Verzenden mislukt");
      track("insider_signed_up", { source, modus, topic });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setBusy(false);
    }
  }

  const isDark = tone === "dark";
  const inputCls = isDark
    ? "rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:bg-white/15 focus:ring-repp-yellow"
    : "rounded-xl bg-white border border-repp-gray text-repp-navy placeholder-repp-navy/40 focus:ring-repp-blue";
  const helperCls = isDark ? "text-white/60" : "text-repp-navy/55";
  const labelCls = isDark ? "text-white" : "text-repp-navy";
  const pillActiveCls = isDark
    ? "bg-repp-yellow text-repp-navy border-repp-yellow"
    : "bg-repp-navy text-white border-repp-navy";
  const pillInactiveCls = isDark
    ? "bg-white/5 text-white/80 border-white/20 hover:border-white/40"
    : "bg-white text-repp-navy border-repp-gray hover:border-repp-navy";

  if (done) {
    return (
      <div
        className={`rounded-2xl p-6 ${
          isDark
            ? "bg-repp-yellow/15 border border-repp-yellow/40 text-white"
            : "bg-status-available/10 border border-status-available/30 text-repp-navy"
        }`}
      >
        <p className="text-2xl">📬</p>
        <p className={`mt-2 font-bold text-lg ${labelCls}`}>
          Welkom als Hofman Insider.
        </p>
        <p className={`mt-2 text-sm ${helperCls}`}>
          Jij krijgt vanaf nu als eerste belangrijk nieuws over {project.name}:
          statuswijzigingen, prijsindexaties, de start van de XXL-verkoop en
          bouwmijlpalen. Voor reguliere bezoekers is dat nieuws meestal te
          laat.
        </p>
        <p className={`mt-3 text-[11px] ${helperCls}`}>
          Geen spam. Uitschrijven kan altijd via een link in iedere mail.
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="jouw@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 min-w-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${inputCls}`}
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 bg-repp-yellow text-repp-navy text-sm font-bold px-5 py-2.5 rounded-xl hover:brightness-95 transition disabled:opacity-60"
          >
            {busy ? "…" : "Schrijf me in"}
          </button>
        </div>
        <p className={`text-[11px] ${helperCls}`}>
          Geen spam. Max 1× per maand. Uitschrijven kan altijd.
        </p>
        {error && <p className="text-xs text-rose-300">⚠ {error}</p>}
      </form>
    );
  }

  // full variant
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Naam" labelCls={labelCls}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Voornaam"
            className={`w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${inputCls}`}
          />
        </Field>
        <Field label="E-mail *" labelCls={labelCls}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            className={`w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${inputCls}`}
          />
        </Field>
      </div>

      <Field label="Hoe kijk je naar De Hofman?" labelCls={labelCls}>
        <div className="grid grid-cols-3 gap-2">
          {(["ondernemer", "belegger", "beide"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModus(m)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition border ${
                modus === m ? pillActiveCls : pillInactiveCls
              }`}
            >
              {m === "ondernemer"
                ? "Voor mijn bedrijf"
                : m === "belegger"
                  ? "Als belegging"
                  : "Allebei"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Waarover wil je gemaild worden?" labelCls={labelCls}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition border text-left ${
                topic === t ? pillActiveCls : pillInactiveCls
              }`}
            >
              {TOPIC_LABELS[t]}
            </button>
          ))}
        </div>
      </Field>

      {error && <p className="text-sm text-red-600">⚠ {error}</p>}

      <div>
        <button
          type="submit"
          disabled={busy}
          className="w-full sm:w-auto inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-6 py-3.5 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60"
        >
          {busy ? "Versturen…" : "Schrijf me in voor Hofman Insider →"}
        </button>
        <p className={`mt-3 text-xs ${helperCls}`}>
          Geen spam. Max 1× per maand. Uitschrijven kan altijd via een link in
          de mail.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  labelCls,
  children,
}: {
  label: string;
  labelCls: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={`text-sm font-semibold ${labelCls}`}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
