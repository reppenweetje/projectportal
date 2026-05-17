"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import { MailReportButton } from "@/components/conversion/MailReportButton";

const DEFAULT_HUUR_PER_M2_PER_JAAR = 165;
const DEFAULT_OWN_PERCENT = 40;
const DEFAULT_INTEREST = 5.75;
const DEFAULT_TERM = 25;
const DEFAULT_LEEGSTAND = 3;

function annuity(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function RendementCalculator({ project }: { project: Project }) {
  // Toon alleen één representatieve unit per type (L, XL) in de dropdown.
  // Voorkeur voor beschikbare units; valt terug op wachtlijst (verkocht_ovb)
  // of, als laatste, een verkochte unit, zodat het prijspunt zichtbaar blijft.
  const sellableUnits = project.units.filter((u) => u.status !== "coming_soon");

  const pickRepresentative = (type: "L" | "XL" | "XXL") => {
    const ofType = sellableUnits.filter((u) => u.type === type);
    if (ofType.length === 0) return null;
    return (
      ofType.find((u) => u.status === "available") ??
      ofType.find((u) => u.status === "verkocht_ovb") ??
      ofType[0]
    );
  };

  const representativeUnits = (["L", "XL"] as const)
    .map((t) => pickRepresentative(t))
    .filter((u): u is NonNullable<ReturnType<typeof pickRepresentative>> => !!u);

  const [unitId, setUnitId] = useState<string>(
    representativeUnits.find((u) => u.status === "available")?.slug ??
      representativeUnits[0].slug,
  );
  const [huurPerM2Jaar, setHuurPerM2Jaar] = useState(DEFAULT_HUUR_PER_M2_PER_JAAR);
  const [ownPercent, setOwnPercent] = useState(DEFAULT_OWN_PERCENT);
  const [rentePct, setRentePct] = useState(DEFAULT_INTEREST);
  const [termYears, setTermYears] = useState(DEFAULT_TERM);
  const [leegstandPct, setLeegstandPct] = useState(DEFAULT_LEEGSTAND);

  const unit = useMemo(
    () =>
      representativeUnits.find((u) => u.slug === unitId) ??
      representativeUnits[0],
    [unitId, representativeUnits],
  );

  const koopsom = unit.prijsExBtw;
  const eigenInbreng = (ownPercent / 100) * koopsom;
  const lening = koopsom - eigenInbreng;
  const huurJaar = huurPerM2Jaar * unit.m2BVO;
  const huurEffectief = huurJaar * (1 - leegstandPct / 100);
  const brutoRendement = (huurJaar / koopsom) * 100;
  const maandLasten = annuity(lening, rentePct, termYears);
  const vveJaar = unit.vvePerMaand * 12;
  const cashflowJaar = huurEffectief - maandLasten * 12 - vveJaar;
  const cashflowMnd = cashflowJaar / 12;

  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6 md:p-10">
      <p className="text-xs uppercase tracking-wider text-repp-navy/60 font-semibold">
        Rendement-calculator
      </p>
      <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
        Wat levert dit jou op?
      </h2>

      <div className="mt-8 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Field label="Welk type unit?">
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full rounded-xl border border-repp-gray bg-white px-4 py-3 text-repp-navy font-medium focus:outline-none focus:ring-2 focus:ring-repp-blue"
            >
              {representativeUnits.map((u) => (
                <option key={u.slug} value={u.slug}>
                  Type {u.type} · {u.m2BVO} m² · {formatEuro(u.prijsExBtw)}
                </option>
              ))}
            </select>
          </Field>

          <Slider
            label="Huurprijs per m² per jaar"
            valueLabel={`€${huurPerM2Jaar} · ${formatEuro(huurJaar)}/jr`}
            min={120}
            max={220}
            step={5}
            value={huurPerM2Jaar}
            onChange={setHuurPerM2Jaar}
          />

          <Slider
            label="Eigen inbreng"
            valueLabel={`${ownPercent}% · ${formatEuro(eigenInbreng)}`}
            min={20}
            max={100}
            step={5}
            value={ownPercent}
            onChange={setOwnPercent}
          />

          <Slider
            label="Hypotheekrente"
            valueLabel={`${rentePct.toFixed(2)}%`}
            min={3}
            max={8}
            step={0.05}
            value={rentePct}
            onChange={setRentePct}
          />

          <Slider
            label="Looptijd"
            valueLabel={`${termYears} jaar`}
            min={5}
            max={30}
            step={1}
            value={termYears}
            onChange={setTermYears}
          />

          <Slider
            label="Verwachte leegstand"
            valueLabel={`${leegstandPct}%`}
            min={0}
            max={15}
            step={1}
            value={leegstandPct}
            onChange={setLeegstandPct}
          />
        </div>

        <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8 self-start">
          <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
            Bruto aanvangsrendement
          </p>
          <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight">
            {brutoRendement.toFixed(1)}%
          </p>
          <p className="text-sm text-white/60 mt-1">
            op basis van {formatEuro(huurJaar)}/jr huur
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <Row label="Huurinkomsten / jaar" value={formatEuro(Math.round(huurJaar))} />
            <Row
              label={`Effectief (na ${leegstandPct}% leegstand)`}
              value={formatEuro(Math.round(huurEffectief))}
            />
            <Row label="Hypotheek / jaar" value={formatEuro(Math.round(maandLasten * 12))} muted />
            <Row label="VVE / jaar" value={formatEuro(vveJaar)} muted />
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
              Cashflow na lasten
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${cashflowJaar > 0 ? "text-repp-yellow" : "text-white"}`}
            >
              {cashflowJaar > 0 ? "+" : ""}
              {formatEuro(Math.round(cashflowMnd))} / mnd
            </p>
            <p className="text-xs text-white/60 mt-1">
              Komt neer op {formatEuro(Math.round(cashflowJaar))}/jr, exclusief
              waardeontwikkeling.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <Link
              href={`/${project.slug}/reserveren?type=${unit.type}`}
              className="block w-full bg-repp-yellow text-repp-navy text-center font-bold px-4 py-3.5 rounded-full hover:brightness-95 transition"
            >
              Reserveer een Type {unit.type} →
            </Link>
            <Link
              href={`/${project.slug}/units/${unit.slug}`}
              className="block w-full text-center text-sm text-white/80 hover:text-white py-1.5"
            >
              Eerst meer info over Type {unit.type}
            </Link>
          </div>

          <MailReportButton
            project={project}
            reportType="rendement"
            context={{
              unit: unit.slug,
              koopsom,
              huurPerM2Jaar,
              ownPercent,
              eigenInbreng,
              rentePct,
              termYears,
              leegstandPct,
              brutoRendement,
              cashflowJaar,
            }}
          />

          <p className="mt-4 text-[11px] text-white/40 leading-relaxed">
            Indicatieve berekening. Werkelijke huurprijs en financierings­voorwaarden
            zijn afhankelijk van markt, type huurder en geldverstrekker. Aan deze
            cijfers kunnen geen rechten worden ontleend.
          </p>
        </div>
      </div>
    </div>
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

function Slider({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-repp-navy">{label}</span>
        <span className="text-sm text-repp-navy/70 tabular-nums">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-repp-navy"
      />
    </label>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${muted ? "text-white/50" : "text-white/90"}`}
    >
      <span>{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
