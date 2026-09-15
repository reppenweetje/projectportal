"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";
import {
  FINANCE_ASSUMPTIONS,
  VVE_MONTHLY,
  XXL_PRICE,
} from "@/lib/site-config";

const { ownPercent: OWN_PERCENT, interestPct: RENTE, termYears: LOOPTIJD } =
  FINANCE_ASSUMPTIONS;

function annuity(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Gemiddeld aflossingsdeel per maand in jaar 1 van een annuïteit. */
function aflossingJaar1PerMaand(
  principal: number,
  annualRatePct: number,
  years: number,
) {
  const r = annualRatePct / 100 / 12;
  const payment = annuity(principal, annualRatePct, years);
  let balance = principal;
  let repaid = 0;
  for (let m = 0; m < 12; m++) {
    const interest = balance * r;
    const principalPart = payment - interest;
    repaid += principalPart;
    balance -= principalPart;
  }
  return repaid / 12;
}

/**
 * Maandlastblok op de homepage: vergelijk wat je nu per maand kwijt bent
 * met de maandlast van unit 14. Zelfde aannames als /bereken en
 * /koopvshuur (20% inbreng, 4,97%, 25 jaar annuïtair, VVE € 160).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HeroCalculator({ project }: { project: Project }) {
  const [huidigeHuur, setHuidigeHuur] = useState(2500);

  const koopsom = XXL_PRICE;
  const eigenInbreng = (OWN_PERCENT / 100) * koopsom;
  const lening = koopsom - eigenInbreng;
  const maandHypotheek = annuity(lening, RENTE, LOOPTIJD);
  const totaalMaand = Math.round(maandHypotheek + VVE_MONTHLY);
  const aflossing = Math.round(aflossingJaar1PerMaand(lening, RENTE, LOOPTIJD));
  const verschil = huidigeHuur - totaalMaand;

  return (
    <section className="px-5 py-16 md:py-24 bg-surface-muted">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            In 10 seconden weten
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Wat kost unit 14 jou per maand?
          </h2>
          <p className="mt-3 text-repp-navy/70 max-w-xl mx-auto">
            Vergelijk wat je nu per maand kwijt bent met de maandlast van unit
            14 (XXL, {formatEuro(koopsom)} excl. btw).
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-repp-gray p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-repp-navy">
                  Betaal je nu huur? Vul in wat je per maand kwijt bent.
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
                Aanname: {OWN_PERCENT}% eigen inbreng (
                {formatEuro(Math.round(eigenInbreng))}), {RENTE.toLocaleString("nl-NL")}% rente,{" "}
                {LOOPTIJD} jaar annuïtair, VVE {formatEuro(VVE_MONTHLY)} per
                maand. Dezelfde aannames als op de{" "}
                <Link
                  href="/bereken?unit=unit-14"
                  className="underline hover:text-repp-blue"
                >
                  bereken-pagina
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8">
              <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
                Maandlast unit 14
              </p>
              <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums">
                {formatEuro(totaalMaand)}
              </p>
              <p className="text-sm text-white/60">per maand, inclusief VVE</p>

              <div className="mt-6 pt-6 border-t border-white/10">
                {huidigeHuur <= 0 ? (
                  <p className="text-sm text-white/70">
                    Vul in wat je nu per maand kwijt bent om de vergelijking te
                    zien.
                  </p>
                ) : verschil > 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                      Vergeleken met wat je nu betaalt
                    </p>
                    <p className="mt-2 text-3xl font-bold text-repp-yellow tabular-nums">
                      {formatEuro(Math.round(verschil))} / mnd lager
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      Dat is {formatEuro(Math.round(verschil * 12))} per jaar,
                      en daarnaast is {formatEuro(aflossing)} per maand
                      aflossing in je eigen pand.
                    </p>
                  </>
                ) : verschil < 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                      Vergeleken met wat je nu betaalt
                    </p>
                    <p className="mt-2 text-sm text-white/85 leading-relaxed">
                      Je maandlast is {formatEuro(Math.round(-verschil))} hoger,
                      en daarvan is {formatEuro(aflossing)} aflossing: dat is
                      sparen in je eigen pand.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-white/85">
                    Je maandlast is gelijk aan wat je nu betaalt, en daarvan is{" "}
                    {formatEuro(aflossing)} aflossing: dat is sparen in je eigen
                    pand.
                  </p>
                )}
              </div>

              <Link
                href="/bereken?unit=unit-14"
                data-cta="maandlast"
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
