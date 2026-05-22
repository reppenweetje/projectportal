"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  clearLeadProfile,
  markVerified,
  useLeadProfile,
} from "@/lib/personalization";
import type { Project } from "@/lib/types";

type Mode = "intro" | "edit" | "submitting" | "done";

export function WelcomeControle({ project }: { project: Project }) {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useLeadProfile();

  const [mode, setMode] = useState<Mode>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [modus, setModus] = useState<"ondernemer" | "belegger" | "">("");

  // Hydrate inputs once profile is loaded
  useEffect(() => {
    if (profile) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
      setModus(profile.modus ?? "");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [profile]);

  // Cold visit (no profile, no URL params): bounce to home
  useEffect(() => {
    if (profile === null) {
      // null means hook hasn't found anything yet — wait one tick
      return;
    }
    if (
      profile &&
      !profile.name &&
      !profile.email &&
      !profile.phone
    ) {
      router.replace(`/${project.slug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const next = params.get("next") ?? `/${project.slug}`;

  if (!profile || (!profile.name && !profile.email && !profile.phone)) {
    return null;
  }

  async function onConfirm() {
    setMode("submitting");
    const updated = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      modus: modus || undefined,
    };
    markVerified(updated);

    // Background-sync naar Supabase + Brevo zodat sales/CRM de nieuwe
    // waardes ziet. Best-effort; UI hangt niet op deze call. Alleen
    // firen als we email hebben (vereiste voor Brevo dedup).
    if (updated.email) {
      void fetch("/api/portal-update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: updated.name ?? null,
          email: updated.email,
          phone: updated.phone ?? null,
          modus: updated.modus ?? null,
        }),
      }).catch((err) => {
        // Silent fail — cookie is al bijgewerkt, server-sync is bonus.
        console.error("[welkom] portal-update failed", err);
      });
    }

    setMode("done");
    setTimeout(() => router.replace(next), 700);
  }

  function onNotMe() {
    clearLeadProfile();
    router.replace(`/${project.slug}`);
  }

  if (mode === "done") {
    return (
      <div className="rounded-3xl bg-status-available/10 border border-status-available/30 p-8 md:p-10 text-center">
        <p className="text-5xl">👍</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight">
          Top, je bent klaar.
        </h2>
        <p className="mt-2 text-repp-navy/70">
          We sturen je naar {project.name}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-repp-gray p-6 md:p-10 shadow-xl shadow-repp-navy/5">
      <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
        Welkom bij {project.name}
      </p>
      <h1 className="mt-2 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
        {profile.name ? `Welkom ${profile.name}` : "Welkom"} 👋
      </h1>
      <p className="mt-3 text-repp-navy/75 max-w-xl">
        Voor we beginnen: kloppen je gegevens nog? Zo houden we het kort als je
        een unit wilt reserveren of een rapport wilt ontvangen.
      </p>

      <div className="mt-8 grid gap-4">
        <Field
          label="Naam"
          value={name}
          onChange={setName}
          editable={mode === "edit"}
        />
        <Field
          label="E-mailadres"
          value={email}
          onChange={setEmail}
          editable={mode === "edit"}
          type="email"
        />
        <Field
          label="Telefoon"
          value={phone}
          onChange={setPhone}
          editable={mode === "edit"}
          type="tel"
        />
        <ModusField
          value={modus}
          onChange={setModus}
          editable={mode === "edit"}
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={mode === "submitting"}
          className="inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-6 py-3.5 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60"
        >
          {mode === "submitting"
            ? "Even geduld…"
            : "Klopt, neem me mee →"}
        </button>
        {mode === "intro" ? (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="inline-flex items-center justify-center text-sm text-repp-navy/70 hover:text-repp-navy font-semibold px-4 py-3"
          >
            Aanpassen
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("intro")}
            className="inline-flex items-center justify-center text-sm text-repp-navy/70 hover:text-repp-navy font-semibold px-4 py-3"
          >
            Terug
          </button>
        )}
        <button
          type="button"
          onClick={onNotMe}
          className="inline-flex items-center justify-center text-sm text-repp-navy/50 hover:text-repp-navy font-medium px-4 py-3"
        >
          Niet ik
        </button>
      </div>

      <p className="mt-6 text-[11px] text-repp-navy/45 leading-relaxed">
        We gebruiken je gegevens alleen om jou te helpen bij {project.name} en
        delen ze niet met derden — zie onze{" "}
        <a
          href="https://repp.nl/wp-content/uploads/2025/03/PRIVACY-VERKLARING.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-repp-navy"
        >
          privacyverklaring
        </a>
        . Niet ik?{" "}
        <button
          type="button"
          onClick={onNotMe}
          className="underline hover:text-repp-navy"
        >
          Wis dan deze sessie
        </button>{" "}
        en kijk anoniem rond.
      </p>

      <div className="mt-6 pt-6 border-t border-repp-gray text-xs text-repp-navy/50 flex items-center justify-between">
        <span>Geen account, geen wachtwoord. Werkt alleen op dit apparaat.</span>
        <Link
          href={`/${project.slug}`}
          className="underline hover:text-repp-navy"
        >
          Liever direct rondkijken
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  editable,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  type?: string;
}) {
  const inputMode =
    type === "email" ? "email" : type === "tel" ? "tel" : undefined;
  const autoComplete =
    type === "email"
      ? "email"
      : type === "tel"
        ? "tel"
        : label.toLowerCase().startsWith("naam")
          ? "name"
          : undefined;
  return (
    <div className="rounded-xl border border-repp-gray bg-surface-muted px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-repp-navy/50 font-semibold">
        {label}
      </p>
      {editable ? (
        <input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-white rounded-lg border border-repp-gray px-3 py-2 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
        />
      ) : (
        <p className="mt-0.5 font-bold text-repp-navy">
          {value || <span className="text-repp-navy/40">— niet bekend —</span>}
        </p>
      )}
    </div>
  );
}

function ModusField({
  value,
  onChange,
  editable,
}: {
  value: "ondernemer" | "belegger" | "";
  onChange: (v: "ondernemer" | "belegger" | "") => void;
  editable: boolean;
}) {
  const labels: Record<typeof value, string> = {
    ondernemer: "Voor mijn bedrijf",
    belegger: "Als belegging",
    "": "Onbekend",
  };
  return (
    <div className="rounded-xl border border-repp-gray bg-surface-muted px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-repp-navy/50 font-semibold">
        Wat zoek je?
      </p>
      {editable ? (
        <div className="mt-2 inline-flex bg-white rounded-full border border-repp-gray p-1">
          {(["ondernemer", "belegger"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                value === m
                  ? "bg-repp-navy text-white"
                  : "text-repp-navy/60 hover:text-repp-navy"
              }`}
            >
              {labels[m]}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-0.5 font-bold text-repp-navy">
          {labels[value] || <span className="text-repp-navy/40">— onbekend —</span>}
        </p>
      )}
    </div>
  );
}
