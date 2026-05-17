"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { markVerified, useLeadProfile } from "@/lib/personalization";

type Step = "form" | "submitting" | "error";

export function DocumentLeadGate({
  project,
  onVerified,
}: {
  project: Project;
  onVerified: () => void;
}) {
  const profile = useLeadProfile();
  const [naam, setNaam] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [telefoon, setTelefoon] = useState(profile?.phone ?? "");
  const [bedrijf, setBedrijf] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          naam,
          email,
          telefoon,
          bedrijf,
          source: profile?.source ?? "documenten-gate",
          context: "documenten-toegang",
          sessionId: profile?.sessionId,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "Verzenden mislukt");
      }
      markVerified({ name: naam, email, phone: telefoon });
      onVerified();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Onbekende fout");
      setStep("error");
    }
  }

  return (
    <div className="rounded-3xl border border-repp-gray bg-white p-6 md:p-10">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Documenten · {project.name}
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
            Laat even je gegevens achter
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-md">
            Zo houden we je op de hoogte van wijzigingen in het project (planning,
            prijzen, vergunningen) en kunnen we je een persoonlijke toelichting
            geven. Daarna krijg je direct toegang tot alle documenten.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-repp-navy/80">
            <Bullet text="Brochure, plattegronden en prijslijst" />
            <Bullet text="Koop-aannemingsovereenkomst en notarisstukken" />
            <Bullet text="Update bij elke mijlpaal (vergunning, oplevering)" />
          </ul>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Naam *">
            <Input value={naam} onChange={setNaam} required />
          </Field>
          <Field label="E-mail *">
            <Input value={email} onChange={setEmail} required type="email" />
          </Field>
          <Field label="Telefoon *">
            <Input value={telefoon} onChange={setTelefoon} required type="tel" />
          </Field>
          <Field label="Bedrijfsnaam (optioneel)">
            <Input value={bedrijf} onChange={setBedrijf} />
          </Field>

          {errorMsg && <p className="text-sm text-red-600">⚠ {errorMsg}</p>}

          <button
            type="submit"
            disabled={step === "submitting"}
            className="w-full inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-6 py-4 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === "submitting"
              ? "Even geduld…"
              : "Geef mij toegang tot de documenten →"}
          </button>
          <p className="text-[11px] text-repp-navy/50 leading-relaxed">
            We gebruiken je gegevens alleen voor dit project. Je kunt je op elk
            moment afmelden via de link onderaan onze mails.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-repp-navy">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  required,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
    />
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-repp-yellow shrink-0" />
      <span>{text}</span>
    </li>
  );
}
