"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import { useLeadProfile } from "@/lib/personalization";
import { track } from "@/lib/track";
import { fireMetaLead } from "@/lib/metaPixel";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { WhatsAppLink } from "@/components/conversion/WhatsAppLink";
import {
  WHATSAPP_HREF,
  XXL_AREA_LABEL,
  XXL_PRICE,
} from "@/lib/site-config";

type Step = "form" | "submitting" | "done" | "error";
export type Unit14Intent = "reserveren" | "sparren";
type ContactMoment = "asap" | "this_week" | "no_pref";

/**
 * LeadFormUnit14: het ene aanmeldformulier voor unit 14, met twee
 * intenties (reserveren of eerst sparren). Wordt gebruikt op /xxl#aanmelden
 * en op de homepage. `?intent=reserveren|sparren` selecteert de radio voor.
 *
 * `context` gaat mee als data-cta op de verstuurknop en als form_context
 * naar het CRM, zodat je ziet vanaf welk blok een lead binnenkwam.
 */
export function LeadFormUnit14({
  project,
  context = "xxl-form",
  showSummary = true,
}: {
  project: Project;
  context?: string;
  /** Compacte samenvatting van unit 14 naast het formulier (desktop links). */
  showSummary?: boolean;
}) {
  const profile = useLeadProfile();
  const params = useSearchParams();
  const intentParam = params.get("intent");
  const initialIntent: Unit14Intent | null =
    intentParam === "reserveren" || intentParam === "sparren"
      ? intentParam
      : null;

  const [intent, setIntent] = useState<Unit14Intent | null>(initialIntent);
  const [naam, setNaam] = useState("");
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [gebruik, setGebruik] = useState("");
  const [contactMoment, setContactMoment] = useState<ContactMoment>("no_pref");
  const [unit7Notify, setUnit7Notify] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      /* eslint-disable react-hooks/set-state-in-effect */
      if (profile.name && !naam) setNaam(profile.name);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.phone && !telefoon) setTelefoon(profile.phone);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent) {
      setErrorMsg("Kies wat je wil: reserveren of eerst sparren.");
      setStep("error");
      return;
    }
    setStep("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/lead-unit14", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project.slug,
          intent,
          naam,
          bedrijfsnaam,
          email,
          telefoon,
          gebruik,
          contactMoment,
          unit7Notify,
          formContext: context,
          source: profile?.source ?? context,
          sessionId: profile?.sessionId,
          clpSession: profile?.clpSession,
          path:
            typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? "Verzenden mislukt");
      }
      track("lead_unit14_submit", {
        intent,
        contactMoment,
        unit7Notify,
        context,
        hasGebruik: !!gebruik,
      });
      fireMetaLead("lead-unit14", { intent });
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Onbekende fout");
      setStep("error");
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-3xl bg-status-available/10 border border-status-available/30 p-8 md:p-10 text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
          Dank je.
        </h3>
        <p className="mt-3 text-repp-navy/75 max-w-xl mx-auto">
          Dank je. We bellen je op het moment dat je hebt aangegeven.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <WhatsAppLink
            href={WHATSAPP_HREF}
            cta={`${context}-done`}
            className="inline-flex items-center bg-repp-navy text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-repp-blue transition"
          >
            Direct iets vragen via WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`grid gap-6 lg:gap-10 ${showSummary ? "lg:grid-cols-3" : ""}`}
      noValidate
    >
      {showSummary && <Summary />}

      <div className={`space-y-7 ${showSummary ? "lg:col-span-2" : ""}`}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Naam *">
            <Input value={naam} onChange={setNaam} required autoComplete="name" />
          </Field>
          <Field label="Bedrijfsnaam">
            <Input
              value={bedrijfsnaam}
              onChange={setBedrijfsnaam}
              autoComplete="organization"
            />
          </Field>
          <Field label="E-mail *">
            <Input
              value={email}
              onChange={setEmail}
              required
              type="email"
              autoComplete="email"
            />
          </Field>
          <Field label="Telefoon *">
            <Input
              value={telefoon}
              onChange={setTelefoon}
              required
              type="tel"
              autoComplete="tel"
            />
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-repp-navy">
            Wat wil je? *
          </legend>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            <RadioPill
              name="intent"
              value="reserveren"
              checked={intent === "reserveren"}
              onChange={() => setIntent("reserveren")}
              label="Ik wil unit 14 reserveren"
            />
            <RadioPill
              name="intent"
              value="sparren"
              checked={intent === "sparren"}
              onChange={() => setIntent("sparren")}
              label="Ik wil eerst sparren over de mogelijkheden"
            />
          </div>
        </fieldset>

        <Field
          label="Wat ga je hier doen?"
          help="Helpt ons om passend advies te geven en de juiste vragen te stellen tijdens het belmoment."
        >
          <textarea
            value={gebruik}
            onChange={(e) => setGebruik(e.target.value)}
            rows={3}
            placeholder="Bijvoorbeeld: aannemingsbedrijf met werkplaats op de begane grond en kantoor op de verdiepingen"
            className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold text-repp-navy">
            Wanneer mogen we je bellen?
          </legend>
          <div className="mt-2 grid sm:grid-cols-3 gap-2">
            <RadioPill
              name="contactMoment"
              value="asap"
              checked={contactMoment === "asap"}
              onChange={() => setContactMoment("asap")}
              label="Zo snel mogelijk"
            />
            <RadioPill
              name="contactMoment"
              value="this_week"
              checked={contactMoment === "this_week"}
              onChange={() => setContactMoment("this_week")}
              label="Deze week"
            />
            <RadioPill
              name="contactMoment"
              value="no_pref"
              checked={contactMoment === "no_pref"}
              onChange={() => setContactMoment("no_pref")}
              label="Geen voorkeur"
            />
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-repp-navy cursor-pointer">
          <input
            type="checkbox"
            checked={unit7Notify}
            onChange={(e) => setUnit7Notify(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-repp-navy"
          />
          <span>Houd me op de hoogte als unit 7 vrijvalt.</span>
        </label>

        {errorMsg && <p className="text-sm text-red-600">⚠ {errorMsg}</p>}

        <div>
          <button
            type="submit"
            disabled={step === "submitting"}
            data-cta={context}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-repp-yellow text-repp-navy font-bold text-base px-7 py-4 rounded-full hover:brightness-95 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === "submitting" ? "Versturen…" : "Verstuur"}
          </button>
          <PrivacyConsent tone="light" actionLabel="Verstuur" className="mt-3" />
        </div>
      </div>
    </form>
  );
}

/** Kop en intro van het formulier, identiek op elke plek waar het staat. */
export function LeadFormUnit14Heading({
  overline = "Aanmelden",
  align = "center",
}: {
  overline?: string;
  align?: "center" | "left";
}) {
  const cls = align === "center" ? "text-center" : "text-left";
  return (
    <div className={cls}>
      <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
        {overline}
      </p>
      <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
        Unit 14 reserveren of eerst sparren?
      </h2>
      <p
        className={`mt-3 text-repp-navy/70 max-w-xl ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        Vul je gegevens in en zeg wat je wil. We bellen je om het door te
        spreken, zonder kosten of verplichting.
      </p>
    </div>
  );
}

function Summary() {
  return (
    <aside className="rounded-2xl bg-repp-navy text-white p-6 self-start lg:sticky lg:top-32 order-first">
      <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
        Unit 14
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/85">
        Unit 14 · XXL · {XXL_AREA_LABEL} · 3 lagen ·{" "}
        {formatEuro(XXL_PRICE)} v.o.n. excl. btw · verwachte oplevering Q3
        2027
      </p>
    </aside>
  );
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
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  const inputMode =
    type === "email" ? "email" : type === "tel" ? "tel" : undefined;
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      inputMode={inputMode}
      className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy focus:outline-none focus:ring-2 focus:ring-repp-blue"
    />
  );
}

function RadioPill({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition border cursor-pointer ${
        checked
          ? "bg-repp-navy text-white border-repp-navy"
          : "bg-white text-repp-navy border-repp-gray hover:border-repp-navy"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-repp-yellow"
      />
      <span>{label}</span>
    </label>
  );
}
