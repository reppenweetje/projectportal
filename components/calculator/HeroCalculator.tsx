"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";

const TYPICAL_RENTE = 5.5;
const TYPICAL_LOOPTIJD = 20;
const TYPICAL_OWN_PERCENT = 30;

function annuity(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function HeroCalculator({ project }: { project: Project }) {
  // Use cheapest available L-unit as default
  const defaultUnit =
    project.units.find((u) => u.status === "available" && u.type === "L") ??
    project.units[0];

  const [huidigeHuur, setHuidigeHuur] = useState(2500);

  const koopsom = defaultUnit.prijsExBtw;
  const eigenInbreng = (TYPICAL_OWN_PERCENT / 100) * koopsom;
  const lening = koopsom - eigenInbreng;
  const maandHypotheek = annuity(lening, TYPICAL_RENTE, TYPICAL_LOOPTIJD);
  const totaalMaand = Math.round(maandHypotheek + defaultUnit.vvePerMaand);
  const verschil = huidigeHuur - totaalMaand;

  return (
    <section className="px-5 py-16 md:py-24 bg-surface-muted">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            In 10 seconden weten
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Wat kost een eigen pand jou per maand?
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-xl mx-auto">
            Vergelijk je huidige huur met de maandlast van een L-unit ({defaultUnit.type} ·{" "}
            {formatEuro(koopsom)} excl. btw).
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-repp-gray p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-repp-navy">
                  Wat betaal je nu aan huur per maand?
                </span>
                <div className="relative mt-3">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-repp-navy/40 text-2xl">
                    €
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={huidigeHuur}
                    min={0}
                    step={50}
                    onChange={(e) => setHuidigeHuur(Number(e.target.value) || 0)}
                    className="w-full rounded-2xl border-2 border-repp-gray focus:border-repp-blue bg-white pl-12 pr-5 py-4 text-3xl font-bold text-repp-navy tabular-nums focus:outline-none focus:ring-2 focus:ring-repp-blue/30"
                  />
                </div>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1500, 2000, 2500, 3000, 3500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setHuidigeHuur(v)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                      huidigeHuur === v
                        ? "bg-repp-navy text-white"
                        : "bg-repp-gray/40 text-repp-navy hover:bg-repp-gray/60"
                    }`}
                  >
                    €{v.toLocaleString("nl-NL")}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-repp-navy/50 leading-relaxed">
                Aanname: {TYPICAL_OWN_PERCENT}% eigen inbreng (
                {formatEuro(Math.round(eigenInbreng))}), {TYPICAL_RENTE}% rente,{" "}
                {TYPICAL_LOOPTIJD} jaar annuïteit. Reken het exact uit op de{" "}
                <Link
                  href={`/${project.slug}/bereken`}
                  className="underline hover:text-repp-blue"
                >
                  bereken-pagina
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8">
              <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
                Maandlast eigen pand
              </p>
              <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums">
                {formatEuro(totaalMaand)}
              </p>
              <p className="text-sm text-white/60">per maand</p>

              <div className="mt-6 pt-6 border-t border-white/10">
                {verschil > 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                      Vergeleken met huur
                    </p>
                    <p className="mt-2 text-3xl font-bold text-repp-yellow tabular-nums">
                      {formatEuro(Math.round(verschil))} / mnd lager
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      = {formatEuro(Math.round(verschil * 12))} per jaar, én je
                      bouwt vermogen op in je eigen pand.
                    </p>
                  </>
                ) : verschil < 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                      Vergeleken met huur
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white tabular-nums">
                      {formatEuro(Math.round(-verschil))} / mnd hoger
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      Maar: in plaats van weggegooide huur bouw je vermogen op in
                      je eigen pand.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-white/70">
                    Vul je huidige huur in om de vergelijking te zien.
                  </p>
                )}
              </div>

              <Link
                href={`/${project.slug}/bereken`}
                className="mt-6 block w-full bg-repp-yellow text-repp-navy text-center font-bold px-4 py-3 rounded-full hover:brightness-95 transition"
              >
                Reken het exact uit →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
