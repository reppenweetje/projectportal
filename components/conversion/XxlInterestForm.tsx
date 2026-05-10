"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import { useLeadProfile } from "@/lib/personalization";
import { buildWhatsAppLink } from "@/lib/utils";

type Step = "form" | "submitting" | "done" | "error";

type WoningKeuze = "met_woning" | "zonder_woning" | "beide";
type UnitKeuze = "unit-7" | "unit-14" | "beide" | "geen_voorkeur";

export function XxlInterestForm({ project }: { project: Project }) {
  const profile = useLeadProfile();
  const xxlUnits = project.units.filter((u) => u.type === "XXL");
  const sample = xxlUnits[0];

  const [woningKeuze, setWoningKeuze] = useState<WoningKeuze>("beide");
  const [unitKeuze, setUnitKeuze] = useState<UnitKeuze>("geen_voorkeur");
  const [naam, setNaam] = useState("");
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [gebruik, setGebruik] = useState("");
  const [contactMoment, setContactMoment] = useState<
    "asap" | "this_week" | "no_pref"
  >("no_pref");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.name && !naam) setNaam(profile.name);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.phone && !telefoon) setTelefoon(profile.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/xxl-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          woningKeuze,
          unitKeuze,
          naam,
          bedrijfsnaam,
          email,
          telefoon,
          gebruik,
          contactMoment,
          source: profile?.source ?? "xxl-page",
          sessionId: profile?.sessionId,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "Verzenden mislukt");
      }
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Onbekende fout");
      setStep("error");
    }
  }

  if (step === "done") {
    const waMsg = `Hallo, ik heb me net aangemeld voor de XXL-wachtlijst van ${project.name}. Mijn naam: ${naam}.`;
    return (
      <div className="rounded-3xl bg-status-coming/10 border border-status-coming/30 p-8 md:p-10 text-center">
        <p className="text-5xl">📬</p>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
          Top, je staat op de XXL-wachtlijst
        </h2>
        <p className="mt-3 text-repp-navy/75 max-w-xl mx-auto">
          We mailen je zodra de XXL-units (Unit 7 en 14) in actieve verkoop
          gaan, en je krijgt als eerste toegang voor je voorkeur.
        </p>
        <div className="mt-6 inline-block rounded-2xl bg-white border border-repp-gray p-5 text-left">
          <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold">
            Wat we van je hebben
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-repp-navy/80">
            <li>
              <span className="text-repp-navy/50">Voorkeur woning:</span>{" "}
              <span className="font-semibold text-repp-navy">
                {woningLabel(woningKeuze)}
              </span>
            </li>
            <li>
              <span className="text-repp-navy/50">Voorkeur unit:</span>{" "}
              <span className="font-semibold text-repp-navy">
                {unitLabel(unitKeuze)}
              </span>
            </li>
            <li>
              <span className="text-repp-navy/50">Contact:</span>{" "}
              <span className="font-semibold text-repp-navy">
                {naam} · {email} · {telefoon}
              </span>
            </li>
          </ul>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={buildWhatsAppLink(project.whatsAppNumber, waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-repp-navy text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-repp-blue transition"
          >
            Direct iets vragen via WhatsApp
          </a>
          <a
            href={`/${project.slug}`}
            className="text-sm text-repp-navy/70 hover:text-repp-navy"
          >
            Terug naar {project.name}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid lg:grid-cols-3 gap-6 lg:gap-10"
      noValidate
    >
      <div className="lg:col-span-2 space-y-7">
        <Field
          label="Welke variant heeft je voorkeur?"
          help="De XXL kan zakelijk-only of met bedrijfsgebonden woning op de tweede verdieping."
        >
          <div className="grid sm:grid-cols-3 gap-2">
            <Pill
              active={woningKeuze === "met_woning"}
              onClick={() => setWoningKeuze("met_woning")}
              label="Met woning"
              sub={sample ? formatEuro(sample.prijsExBtw) : ""}
            />
            <Pill
              active={woningKeuze === "zonder_woning"}
              onClick={() => setWoningKeuze("zonder_woning")}
              label="Zonder woning"
              sub={
                sample?.prijsZonderWoningExBtw
                  ? formatEuro(sample.prijsZonderWoningExBtw)
                  : "Prijs nog te bepalen"
              }
            />
            <Pill
              active={woningKeuze === "beide"}
              onClick={() => setWoningKeuze("beide")}
              label="Beide opties"
              sub="Hoor graag wat er kan"
            />
          </div>
        </Field>

        <Field label="Welke unit heeft je voorkeur?">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Pill
              active={unitKeuze === "unit-7"}
              onClick={() => setUnitKeuze("unit-7")}
              label="Unit 7"
            />
            <Pill
              active={unitKeuze === "unit-14"}
              onClick={() => setUnitKeuze("unit-14")}
              label="Unit 14"
            />
            <Pill
              active={unitKeuze === "beide"}
              onClick={() => setUnitKeuze("beide")}
              label="Allebei"
            />
            <Pill
              active={unitKeuze === "geen_voorkeur"}
              onClick={() => setUnitKeuze("geen_voorkeur")}
              label="Geen voorkeur"
            />
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Naam *">
            <Input value={naam} onChange={setNaam} required />
          </Field>
          <Field label="Bedrijfsnaam">
            <Input value={bedrijfsnaam} onChange={setBedrijfsnaam} />
          </Field>
          <Field label="E-mail *">
            <Input value={email} onChange={setEmail} required type="email" />
          </Field>
          <Field label="Telefoon *">
            <Input value={telefoon} onChange={setTelefoon} required type="tel" />
          </Field>
        </div>

        <Field
          label="Wat ga je hier doen?"
          help="Helpt ons om passend advies te geven en de juiste vragen te stellen tijdens het belmoment."
        >
          <textarea
            value={gebruik}
            onChange={(e) => setGebruik(e.target.value)}
            rows={3}
            placeholder="Bijvoorbeeld: aannemingsbedrijf met werkplaats + kantoor, wil de woning gebruiken voor mezelf en/of personeel"
            className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
          />
        </Field>

        <Field label="Wanneer mogen we je bellen?">
          <div className="grid sm:grid-cols-3 gap-2">
            <Pill
              active={contactMoment === "asap"}
              onClick={() => setContactMoment("asap")}
              label="Zo snel mogelijk"
            />
            <Pill
              active={contactMoment === "this_week"}
              onClick={() => setContactMoment("this_week")}
              label="Deze week"
            />
            <Pill
              active={contactMoment === "no_pref"}
              onClick={() => setContactMoment("no_pref")}
              label="Geen voorkeur"
            />
          </div>
        </Field>

        {errorMsg && <p className="text-sm text-red-600">⚠ {errorMsg}</p>}

        <div>
          <button
            type="submit"
            disabled={step === "submitting"}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-7 py-4 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === "submitting"
              ? "Versturen…"
              : "Plaats mij op de XXL-wachtlijst →"}
          </button>
          <p className="mt-3 text-xs text-repp-navy/60">
            Geen kosten, geen verplichting. We mailen alleen als de XXL-units
            in verkoop gaan of als er belangrijke updates zijn.
          </p>
        </div>
      </div>

      <aside className="rounded-2xl bg-repp-navy text-white p-6 self-start lg:sticky lg:top-24 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
            XXL · 191,4 m²
          </p>
          <p className="mt-2 text-2xl font-extrabold">3 lagen</p>
          <p className="text-sm text-white/60 mt-0.5">
            Bedrijf op de begane grond &amp; 1e, woning op de 2e
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          <PriceRow
            label="Vanaf"
            value={
              sample ? `${formatEuro(sample.prijsExBtw)} excl. btw` : ""
            }
          />
          {sample?.prijsZonderWoningExBtw && (
            <PriceRow
              label="Zonder woning"
              value={`${formatEuro(sample.prijsZonderWoningExBtw)} excl. btw`}
              muted
            />
          )}
          <PriceRow label="VVE / maand" value="€ 160" muted />
        </ul>

        <div className="pt-4 border-t border-white/10 text-xs text-white/70 leading-relaxed space-y-2">
          <p>
            <span className="text-repp-yellow font-semibold">Status:</span>{" "}
            Coming soon. We onderzoeken nu of bedrijfsgebonden wonen binnen
            deze units mogelijk is.
          </p>
          <p>
            <span className="text-repp-yellow font-semibold">Voorrang:</span>{" "}
            Wachtlijst-staanden krijgen als eerste toegang zodra de XXL in
            actieve verkoop gaat.
          </p>
        </div>
      </aside>
    </form>
  );
}

function woningLabel(k: WoningKeuze): string {
  if (k === "met_woning") return "Met bedrijfsgebonden woning";
  if (k === "zonder_woning") return "Zonder woning (zakelijk only)";
  return "Beide opties open";
}

function unitLabel(k: UnitKeuze): string {
  if (k === "unit-7") return "Unit 7";
  if (k === "unit-14") return "Unit 14";
  if (k === "beide") return "Allebei";
  return "Geen voorkeur";
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-repp-navy">{label}</span>
      {help && (
        <span className="block text-xs text-repp-navy/55 mt-0.5">{help}</span>
      )}
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

function Pill({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-semibold transition border text-left ${
        active
          ? "bg-repp-navy text-white border-repp-navy"
          : "bg-white text-repp-navy border-repp-gray hover:border-repp-navy"
      }`}
    >
      <span className="block">{label}</span>
      {sub && (
        <span
          className={`block text-[11px] font-normal ${
            active ? "text-white/70" : "text-repp-navy/55"
          }`}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

function PriceRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <li
      className={`flex items-center justify-between ${
        muted ? "text-white/60" : "text-white/95"
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </li>
  );
}
