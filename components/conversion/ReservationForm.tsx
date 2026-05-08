"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Project, Unit } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import { useLeadProfile } from "@/lib/personalization";
import { buildWhatsAppLink } from "@/lib/utils";

type Step = "form" | "submitting" | "done" | "error";

export function ReservationForm({ project }: { project: Project }) {
  const profile = useLeadProfile();
  const params = useSearchParams();

  const reservable = project.units.filter(
    (u) => u.status === "available" || u.status === "in_optie",
  );

  const initialUnitSlug =
    params.get("unit") ?? reservable[0]?.slug ?? project.units[0].slug;
  const initialUnit =
    project.units.find((u) => u.slug === initialUnitSlug) ?? project.units[0];

  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [opmerking, setOpmerking] = useState("");
  const [contactMoment, setContactMoment] = useState<
    "asap" | "this_week" | "no_pref"
  >("asap");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill from CLP profile
  useEffect(() => {
    if (profile) {
      if (profile.name && !naam) setNaam(profile.name);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.phone && !telefoon) setTelefoon(profile.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const aanbetaling = Math.round(unit.prijsExBtw * 0.05);
  const isVerified = Boolean(profile?.verified);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          unit: unit.slug,
          naam,
          email,
          telefoon,
          opmerking,
          contactMoment,
          source: profile?.source ?? "direct",
          verified: isVerified,
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
    const waMsg = `Hallo, ik heb zojuist Unit ${unit.number} (${unit.type}) op naam laten zetten in ${project.name}. Ik ben ${naam || "geïnteresseerd"}.`;
    return (
      <div className="rounded-3xl bg-status-available/10 border border-status-available/30 p-8 md:p-10 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
          Top, we hebben je verzoek
        </h2>
        <p className="mt-3 text-repp-navy/75 max-w-xl mx-auto">
          Unit {unit.number} ({unit.type}) staat op jouw naam genoteerd. Onze
          makelaar belt je{" "}
          {contactMoment === "asap"
            ? "vandaag of morgen"
            : contactMoment === "this_week"
              ? "deze week"
              : "in overleg"}{" "}
          op {telefoon || "het opgegeven nummer"} om alles persoonlijk door te
          spreken.
        </p>
        <div className="mt-6 inline-block rounded-2xl bg-white border border-status-available/30 p-5 text-left">
          <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold">
            Wat er nu gebeurt
          </p>
          <ol className="mt-3 space-y-2 text-sm text-repp-navy/80">
            <li>
              <span className="font-bold text-repp-navy">1.</span> Wij bellen
              je voor een persoonlijk gesprek. <em>(geen kosten, vrijblijvend)</em>
            </li>
            <li>
              <span className="font-bold text-repp-navy">2.</span> Pas als jij
              klaar bent: officiële reservering met{" "}
              {formatEuro(aanbetaling)} (5%) op de notarisrekening.
            </li>
            <li>
              <span className="font-bold text-repp-navy">3.</span> Onherroepelijke
              vergunning verwacht over 6 tot 8 weken, daarna start de bouw direct.
            </li>
          </ol>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={buildWhatsAppLink(project.whatsAppNumber, waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-repp-navy text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-repp-blue transition"
          >
            Bevestig direct via WhatsApp
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

  // VERIFIED USER: 1-click confirm flow
  if (isVerified) {
    return (
      <form
        onSubmit={onSubmit}
        className="grid lg:grid-cols-3 gap-6 lg:gap-10"
        noValidate
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-status-available/10 border border-status-available/30 p-4 flex items-center gap-3">
            <span className="text-xl">✓</span>
            <div className="text-sm text-repp-navy/85">
              <p className="font-semibold text-repp-navy">
                We hebben je gegevens al, {profile?.name}.
              </p>
              <p className="text-xs text-repp-navy/65 mt-0.5">
                Geen formulier nodig. Bevestig hieronder en wij bellen je.
              </p>
            </div>
          </div>

          <Field label="Welke unit wil je op naam zetten?">
            <select
              value={unit.slug}
              onChange={(e) => {
                const next = project.units.find(
                  (u) => u.slug === e.target.value,
                );
                if (next) setUnit(next);
              }}
              className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy font-medium focus:outline-none focus:ring-2 focus:ring-repp-blue"
            >
              {reservable.map((u) => (
                <option key={u.slug} value={u.slug}>
                  Unit {u.number} · {u.type} · {formatEuro(u.prijsExBtw)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Wanneer mogen we je bellen?">
            <div className="grid sm:grid-cols-3 gap-2">
              <ContactPill
                active={contactMoment === "asap"}
                onClick={() => setContactMoment("asap")}
                label="Zo snel mogelijk"
              />
              <ContactPill
                active={contactMoment === "this_week"}
                onClick={() => setContactMoment("this_week")}
                label="Deze week"
              />
              <ContactPill
                active={contactMoment === "no_pref"}
                onClick={() => setContactMoment("no_pref")}
                label="Geen voorkeur"
              />
            </div>
          </Field>

          <Field label="Opmerking (optioneel)">
            <textarea
              value={opmerking}
              onChange={(e) => setOpmerking(e.target.value)}
              rows={3}
              placeholder="Bijvoorbeeld: ik wil twee units koppelen / heb financieringsvraag / ..."
              className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
            />
          </Field>

          <details className="text-sm">
            <summary className="cursor-pointer text-repp-navy/70 hover:text-repp-navy font-medium">
              Gegevens bekijken of wijzigen
            </summary>
            <div className="mt-3 rounded-xl border border-repp-gray bg-surface-muted p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <Detail label="Naam" value={naam} onChange={setNaam} />
              <Detail label="E-mail" value={email} onChange={setEmail} />
              <Detail label="Telefoon" value={telefoon} onChange={setTelefoon} />
              <p className="text-xs text-repp-navy/50 sm:col-span-2 leading-relaxed">
                <Link
                  href={`/${project.slug}/welkom?next=/${project.slug}/reserveren?unit=${unit.slug}`}
                  className="underline hover:text-repp-navy"
                >
                  Volledig wijzigen via welkom-pagina
                </Link>
              </p>
            </div>
          </details>

          {errorMsg && <p className="text-sm text-red-600">⚠ {errorMsg}</p>}

          <div>
            <button
              type="submit"
              disabled={step === "submitting"}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-7 py-4 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {step === "submitting"
                ? "Versturen…"
                : `Bevestig: zet Unit ${unit.number} op mijn naam →`}
            </button>
            <p className="mt-3 text-xs text-repp-navy/60">
              Geen kosten, geen verplichting. Pas na een persoonlijk gesprek
              nemen we de volgende stap.
            </p>
          </div>
        </div>

        <SidebarSummary project={project} unit={unit} aanbetaling={aanbetaling} />
      </form>
    );
  }

  // ANONYMOUS / not verified: full form
  const hasPrefilledFromCLP = Boolean(
    profile?.name || profile?.email || profile?.phone,
  );

  return (
    <form
      onSubmit={onSubmit}
      className="grid lg:grid-cols-3 gap-6 lg:gap-10"
      noValidate
    >
      <div className="lg:col-span-2 space-y-6">
        <Field label="Welke unit wil je op naam zetten?">
          <select
            value={unit.slug}
            onChange={(e) => {
              const next = project.units.find((u) => u.slug === e.target.value);
              if (next) setUnit(next);
            }}
            className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy font-medium focus:outline-none focus:ring-2 focus:ring-repp-blue"
          >
            {reservable.map((u) => (
              <option key={u.slug} value={u.slug}>
                Unit {u.number} · {u.type} · {formatEuro(u.prijsExBtw)}
              </option>
            ))}
          </select>
        </Field>

        {hasPrefilledFromCLP && (
          <div className="rounded-xl bg-status-available/10 border border-status-available/30 p-3 text-xs text-repp-navy/80">
            ✓ We hebben je gegevens al van je eerdere bezoek; controleer of
            alles klopt.
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Naam *">
            <Input value={naam} onChange={setNaam} required />
          </Field>
          <Field label="E-mail *">
            <Input value={email} onChange={setEmail} required type="email" />
          </Field>
          <Field label="Telefoon *">
            <Input value={telefoon} onChange={setTelefoon} required type="tel" />
          </Field>
        </div>

        <Field label="Wanneer mogen we je bellen?">
          <div className="grid sm:grid-cols-3 gap-2">
            <ContactPill
              active={contactMoment === "asap"}
              onClick={() => setContactMoment("asap")}
              label="Zo snel mogelijk"
            />
            <ContactPill
              active={contactMoment === "this_week"}
              onClick={() => setContactMoment("this_week")}
              label="Deze week"
            />
            <ContactPill
              active={contactMoment === "no_pref"}
              onClick={() => setContactMoment("no_pref")}
              label="Geen voorkeur"
            />
          </div>
        </Field>

        <Field label="Opmerking (optioneel)">
          <textarea
            value={opmerking}
            onChange={(e) => setOpmerking(e.target.value)}
            rows={3}
            placeholder="Bijvoorbeeld: ik wil twee units koppelen / heb financieringsvraag / ..."
            className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
          />
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
              : `Zet Unit ${unit.number} op mijn naam (vrijblijvend) →`}
          </button>
          <p className="mt-3 text-xs text-repp-navy/60">
            Geen kosten, geen verplichting. Pas na een persoonlijk gesprek met
            de makelaar nemen we de volgende stap.
          </p>
        </div>
      </div>

      <SidebarSummary project={project} unit={unit} aanbetaling={aanbetaling} />
    </form>
  );
}

function SidebarSummary({
  project,
  unit,
  aanbetaling,
}: {
  project: Project;
  unit: Unit;
  aanbetaling: number;
}) {
  return (
    <aside className="rounded-2xl bg-repp-navy text-white p-6 self-start lg:sticky lg:top-24 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
          Jouw verzoek
        </p>
        <p className="mt-2 text-2xl font-extrabold">
          Unit {unit.number} · {unit.type}
        </p>
        <p className="text-sm text-white/60 mt-0.5">
          {project.name} · {project.city}
        </p>
      </div>

      <div className="rounded-xl bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
          Hoe werkt dit
        </p>
        <ol className="mt-3 space-y-3 text-sm">
          <Step
            num={1}
            active
            title="Vrijblijvend op naam"
            body="Wij bellen je voor een persoonlijk gesprek. Geen kosten, geen verplichting."
          />
          <Step
            num={2}
            title="Officieel reserveren"
            body={`Pas als jij klaar bent: ${formatEuro(aanbetaling)} (5%) naar de notarisrekening. Geld blijft daar veilig staan tot levering.`}
          />
          <Step
            num={3}
            title="Bouwen direct na vergunning"
            body="Onherroepelijke vergunning verwacht binnen 6 tot 8 weken. Daarna start RENO Projectbouw direct, dus minder rente over een nog niet opgeleverd pand."
          />
        </ol>
      </div>

      <p className="text-[11px] text-white/50 leading-relaxed">
        De aanbetaling staat veilig op de notarisrekening tot oplevering.
        Geen overdrachtsbelasting (v.o.n.). De 21% BTW is volledig
        terugvorderbaar voor zakelijke kopers en beleggers (bij verhuur).
      </p>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

function Detail({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-repp-navy/55 font-semibold">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-white rounded-lg border border-repp-gray px-3 py-2 text-sm text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
      />
    </label>
  );
}

function ContactPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-semibold transition border ${
        active
          ? "bg-repp-navy text-white border-repp-navy"
          : "bg-white text-repp-navy border-repp-gray hover:border-repp-navy"
      }`}
    >
      {label}
    </button>
  );
}

function Step({
  num,
  title,
  body,
  active,
}: {
  num: number;
  title: string;
  body: string;
  active?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${
          active ? "bg-repp-yellow text-repp-navy" : "bg-white/10 text-white/70"
        }`}
      >
        {num}
      </span>
      <div className="min-w-0">
        <p className={`font-semibold text-sm ${active ? "text-white" : "text-white/80"}`}>
          {title}
        </p>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}
