"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import { MailReportButton } from "@/components/conversion/MailReportButton";
import {
  UnitTypePicker,
  representativeUnitForType,
  type CalculatorUnitType,
} from "./UnitTypePicker";

const DEFAULT_INTEREST = 5.5;
const DEFAULT_TERM_YEARS = 20;
const DEFAULT_OWN_PERCENT = 30;
const DEFAULT_HUUR = 2500;

function annuity(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function MaandlastCalculator({ project }: { project: Project }) {
  const sellableUnits = project.units.filter((u) => u.status !== "coming_soon");
  const [selectedType, setSelectedType] = useState<CalculatorUnitType>("L");
  const [ownPercent, setOwnPercent] = useState(DEFAULT_OWN_PERCENT);
  const [rentePct, setRentePct] = useState(DEFAULT_INTEREST);
  const [termYears, setTermYears] = useState(DEFAULT_TERM_YEARS);
  const [huidigeHuur, setHuidigeHuur] = useState(DEFAULT_HUUR);

  const unit = useMemo<Unit>(
    () =>
      representativeUnitForType(project, selectedType) ?? sellableUnits[0],
    [project, selectedType, sellableUnits],
  );

  const koopsom = unit.prijsExBtw;
  const eigenInbreng = (ownPercent / 100) * koopsom;
  const lening = koopsom - eigenInbreng;
  const maandHypotheek = annuity(lening, rentePct, termYears);
  const totaalMaand = maandHypotheek + unit.vvePerMaand;
  const verschilMetHuur = huidigeHuur - totaalMaand;

  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6 md:p-10">
      <p className="text-xs uppercase tracking-wider text-repp-navy/60 font-semibold">
        Maandlast-calculator
      </p>
      <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
        Wat kost dit jou per maand?
      </h2>

      <div className="mt-8 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Field label="Welk type unit?">
            <UnitTypePicker
              project={project}
              selectedType={selectedType}
              onSelect={(t) => setSelectedType(t)}
            />
          </Field>

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

          <Field label="Wat betaal je nu aan huur per maand?">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-repp-navy/60">
                €
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={huidigeHuur}
                min={0}
                step={50}
                onChange={(e) => setHuidigeHuur(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-repp-gray bg-white pl-8 pr-4 py-3 text-repp-navy font-medium focus:outline-none focus:ring-2 focus:ring-repp-blue"
              />
            </div>
          </Field>
        </div>

        <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8 self-start">
          <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
            Jouw maandlast
          </p>
          <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight">
            {formatEuro(Math.round(totaalMaand))}
          </p>
          <p className="text-sm text-white/60 mt-1">per maand</p>

          <div className="mt-6 space-y-2 text-sm">
            <Row label="Hypotheek (annuïtair)" value={formatEuro(Math.round(maandHypotheek))} />
            <Row label="VVE-bijdrage" value={formatEuro(unit.vvePerMaand)} />
            <Row label="Eigen inbreng (eenmalig)" value={formatEuro(Math.round(eigenInbreng))} muted />
            <Row label="Te financieren" value={formatEuro(Math.round(lening))} muted />
          </div>

          {huidigeHuur > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                Vergeleken met huur
              </p>
              {verschilMetHuur > 0 ? (
                <p className="mt-2 text-2xl font-bold text-repp-yellow">
                  {formatEuro(Math.round(verschilMetHuur))} / mnd lager
                </p>
              ) : (
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatEuro(Math.round(-verschilMetHuur))} / mnd hoger
                </p>
              )}
              <p className="mt-1 text-xs text-white/60">
                {verschilMetHuur > 0
                  ? "En je bouwt vermogen op in je eigen pand."
                  : "Maar je bouwt vermogen op in je eigen pand i.p.v. huur weggeven."}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <Link
              href={`/${project.slug}/reserveren?unit=${unit.slug}`}
              className="block w-full bg-repp-yellow text-repp-navy text-center font-bold px-4 py-3.5 rounded-full hover:brightness-95 transition"
            >
              Reserveer Unit {unit.number} →
            </Link>
            <Link
              href={`/${project.slug}/units/${unit.slug}`}
              className="block w-full text-center text-sm text-white/80 hover:text-white py-1.5"
            >
              Eerst meer info over Unit {unit.number}
            </Link>
          </div>

          <MailReportButton
            project={project}
            reportType="maandlast"
            context={{
              unit: unit.slug,
              koopsom,
              ownPercent,
              eigenInbreng,
              rentePct,
              termYears,
              huidigeHuur,
              maandHypotheek,
              totaalMaand,
              verschilMetHuur,
            }}
          />

          <p className="mt-4 text-[11px] text-white/40 leading-relaxed">
            Indicatieve berekening op basis van annuïteitenhypotheek. Werkelijke
            voorwaarden afhankelijk van geldverstrekker. Aan deze cijfers kunnen
            geen rechten worden ontleend.
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
