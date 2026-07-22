"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro, formatM2 } from "@/lib/types";
import { track } from "@/lib/track";

/**
 * KoopVsHuurCalculator — laat een ondernemer zien wat kopen bij De Hofman
 * oplevert t.o.v. huren. Kies een unit (echte prijzen + beschikbaarheid uit
 * de projectdata), schuif met huur/inbreng/rente en zie het voordeel,
 * de maandlasten en de vermogensopbouw over de tijd.
 *
 * Model: hypotheek 25 jr, annuïtair of lineair (toggle). Eigenaarslasten =
 * VVE-bijdrage uit de projectdata (geïndexeerd 2%/jr). Huur geïndexeerd 3%/jr.
 * Voordeel = (waarde − restschuld) − eigen inbreng − (cumulatieve koopkosten −
 * cumulatieve huur). Zie de "Alle aannames"-sectie voor uitleg + disclaimer.
 *
 * Rente-default volgt de ASN Bedrijfshypotheek-tarieven (lineair, < €500.000,
 * 5 jaar rentevast, per 26 juni 2026): de tariefgroep hangt af van de
 * loan-to-value en dus van de eigen inbreng. Schuiven aan de rente-slider
 * overschrijft het ASN-tarief; de reset-knop zet 'm terug.
 */

const LOOPTIJD_JR = 25;
const HUUR_INDEX = 0.03;
const VVE_INDEX = 0.02;
const KOSTEN_EENMALIG = 0.02; // notaris + financiering, % van koopsom

type AflossingsVorm = "annuitair" | "lineair";

// Bron (intern, NIET in de UI benoemen per Jann 7 jul 2026): ASN
// Bedrijfshypotheek < €500.000 (alle De Hofman-units vallen hieronder),
// in de UI heet dit "gemiddeld rentepunt per 1 juli 2026".
// kolom 5 jaar rentevast, per 26 juni 2026. LTV = lening / koopsom.
const ASN_TARIEVEN = [
  { maxLtv: 55, rente: 4.67, groep: "≤ 55%" },
  { maxLtv: 70, rente: 4.82, groep: "> 55% en ≤ 70%" },
  { maxLtv: 80, rente: 4.97, groep: "> 70% en ≤ 80%" },
  { maxLtv: 90, rente: 5.22, groep: "> 80% en ≤ 90%" },
  { maxLtv: 100, rente: 6.22, groep: "> 90%" },
] as const;

function asnTarief(ltv: number) {
  return ASN_TARIEVEN.find((t) => ltv <= t.maxLtv) ?? ASN_TARIEVEN[ASN_TARIEVEN.length - 1];
}

const GROEI_SCENARIOS = [
  { pct: 0, titel: "Voorzichtig" },
  { pct: 2, titel: "Gemiddeld" },
  { pct: 4, titel: "Historisch" },
] as const;

const HORIZONS = [5, 10, 15, 20] as const;

type UnitOptie = {
  type: Unit["type"];
  m2: number;
  prijs: number;
  vve: number;
  beschikbaar: number;
  sold: boolean;
  badge: string;
};

function annuiteit(lening: number, rentePct: number, jaren: number) {
  const i = rentePct / 100 / 12;
  const n = jaren * 12;
  if (i === 0) return lening / n;
  return (lening * i) / (1 - Math.pow(1 + i, -n));
}

function restschuld(
  lening: number,
  rentePct: number,
  jaren: number,
  naJaar: number,
) {
  const i = rentePct / 100 / 12;
  const m = naJaar * 12;
  const p = annuiteit(lening, rentePct, jaren);
  if (i === 0) return Math.max(0, lening - p * m);
  return lening * Math.pow(1 + i, m) - p * ((Math.pow(1 + i, m) - 1) / i);
}

export function KoopVsHuurCalculator({ project }: { project: Project }) {
  // Unit-opties uit de echte projectdata (L / XL / XXL), met beschikbaarheid.
  const opties = useMemo<UnitOptie[]>(() => {
    const volgorde: Unit["type"][] = ["L", "XL", "XXL"];
    return volgorde
      .map((type) => {
        const alle = project.units.filter((u) => u.type === type);
        if (!alle.length) return null;
        const beschikbaar = alle.filter(
          (u) => u.status === "available",
        ).length;
        const rep = alle.find((u) => u.status === "available") ?? alle[0];
        const badge =
          beschikbaar === 0
            ? "Uitverkocht"
            : beschikbaar === 1
              ? "Laatste units"
              : `${beschikbaar} beschikbaar`;
        return {
          type,
          m2: rep.m2BVO,
          prijs: rep.prijsExBtw,
          vve: rep.vvePerMaand,
          beschikbaar,
          sold: beschikbaar === 0,
          badge,
        };
      })
      .filter((x): x is UnitOptie => x !== null);
  }, [project]);

  const startIndex = Math.max(
    0,
    opties.findIndex((o) => !o.sold),
  );
  const [unitIndex, setUnitIndex] = useState(startIndex === -1 ? 0 : startIndex);
  const [huurM2, setHuurM2] = useState(145);
  const [inbrengPct, setInbrengPct] = useState(20);
  const [vorm, setVorm] = useState<AflossingsVorm>("annuitair");
  // null = volg het ASN-tarief bij de huidige LTV; een getal = handmatige keuze.
  const [renteOverride, setRenteOverride] = useState<number | null>(null);
  const [groei, setGroei] = useState(2);
  const [horizon, setHorizon] = useState(10);

  const unit = opties[unitIndex] ?? opties[0];
  const ltv = 100 - inbrengPct;
  const asn = asnTarief(ltv);
  const rente = renteOverride ?? asn.rente;

  const model = useMemo(() => {
    // Effectieve rente hier afleiden i.p.v. de buiten-scope `rente` als
    // dependency gebruiken: de React Compiler kan die afgeleide const niet
    // als stabiel bewijzen (react-hooks/preserve-manual-memoization).
    const rente = renteOverride ?? asnTarief(100 - inbrengPct).rente;
    const K = unit.prijs;
    const m2 = unit.m2;
    const E = (K * inbrengPct) / 100;
    const L = K - E;
    const i = rente / 100 / 12;
    const n = LOOPTIJD_JR * 12;
    const pAnn = annuiteit(L, rente, LOOPTIJD_JR);
    const aflLin = L / n; // lineair: vaste aflossing per maand

    // Hypotheekbetaling + restschuld per jaar, per aflossingsvorm.
    // Annuïtair: vaste termijn. Lineair: vaste aflossing + rente over het
    // aflopende saldo, dus de maandlast daalt elk jaar.
    const hypJaar = (t: number): { betaaldJr: number; schuld: number } => {
      if (vorm === "annuitair") {
        return {
          betaaldJr: pAnn * 12,
          schuld: Math.max(
            0,
            restschuld(L, rente, LOOPTIJD_JR, Math.min(t, LOOPTIJD_JR)),
          ),
        };
      }
      let renteJr = 0;
      for (let m = (t - 1) * 12; m < t * 12; m++) {
        renteJr += Math.max(0, L - aflLin * m) * i;
      }
      return {
        betaaldJr: Math.min(aflLin * 12, Math.max(0, L - aflLin * (t - 1) * 12)) + renteJr,
        schuld: Math.max(0, L - aflLin * t * 12),
      };
    };

    const reeks: {
      t: number;
      voordeel: number;
      waarde: number;
      schuld: number;
      cumHuur: number;
    }[] = [];
    let cumKoop = K * KOSTEN_EENMALIG;
    let cumHuur = 0;
    let hypMnd1 = 0;
    let hypMnd10 = 0;
    for (let t = 1; t <= 20; t++) {
      const huurJr = m2 * huurM2 * Math.pow(1 + HUUR_INDEX, t - 1);
      const vveJr = unit.vve * 12 * Math.pow(1 + VVE_INDEX, t - 1);
      const { betaaldJr, schuld } = hypJaar(t);
      if (t === 1) hypMnd1 = betaaldJr / 12;
      if (t === 10) hypMnd10 = betaaldJr / 12;
      cumHuur += huurJr;
      cumKoop += betaaldJr + vveJr;
      const waarde = K * Math.pow(1 + groei / 100, t);
      const voordeel = waarde - schuld - E - (cumKoop - cumHuur);
      reeks.push({ t, voordeel, waarde, schuld, cumHuur });
    }
    const aflMnd1 =
      vorm === "annuitair"
        ? (L - restschuld(L, rente, LOOPTIJD_JR, 1)) / 12
        : aflLin;
    return {
      K,
      m2,
      E,
      L,
      mndHyp: hypMnd1,
      hypMnd10,
      vveMnd: unit.vve,
      huurMnd: (m2 * huurM2) / 12,
      koopMnd: hypMnd1 + unit.vve,
      aflMnd1,
      reeks,
    };
  }, [unit, huurM2, inbrengPct, renteOverride, groei, vorm]);

  const last = model.reeks[horizon - 1];
  const vermogen = last.waarde - last.schuld;

  // Calculator afgerond. Eenmalig per mount, en pas nadat de bezoeker zelf
  // iets heeft aangepast — de eerste render is nog geen "resultaat". We
  // debouncen 2,5s zodat een sliderbeweging niet tientallen events oplevert;
  // wat we loggen is dus de stand waar iemand op uitkomt, niet elke tussenstap.
  const calcFiredRef = useRef(false);
  const calcTouchedRef = useRef(false);
  useEffect(() => {
    if (!calcTouchedRef.current) {
      // Sla de initiele render over; hierna telt elke wijziging als interactie.
      calcTouchedRef.current = true;
      return;
    }
    if (calcFiredRef.current) return;
    const timer = setTimeout(() => {
      if (calcFiredRef.current) return;
      calcFiredRef.current = true;
      track("calculator_completed", {
        unitType: unit.type,
        m2: unit.m2,
        koopsom: Math.round(unit.prijs),
        huurPerM2: huurM2,
        inbrengPct,
        vorm,
        rentePct: rente,
        horizonJaar: horizon,
        koopMaandlast: Math.round(model.koopMnd),
        huurMaandlast: Math.round(model.huurMnd),
        vermogenNaHorizon: Math.round(vermogen),
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, [
    unit,
    huurM2,
    inbrengPct,
    vorm,
    rente,
    groei,
    horizon,
    model,
    vermogen,
  ]);

  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6 md:p-10">
      <p className="text-xs uppercase tracking-wider text-repp-navy/60 font-semibold">
        Koop vs. huur
      </p>
      <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
        Wat levert een eigen unit je op?
      </h2>
      <p className="mt-3 text-repp-navy/70 max-w-2xl">
        Elke maand huur is geld dat verdwijnt. Elke maand aflossen is vermogen
        dat van jou wordt. Kies een unit, schuif met de aannames en zie het
        verschil.
      </p>

      <div className="mt-8 grid lg:grid-cols-2 gap-10">
        {/* ===== INVOER ===== */}
        <div className="space-y-6">
          <Field label="Kies je unit">
            <div className="space-y-2.5">
              {opties.map((o, i) => (
                <UnitCard
                  key={o.type}
                  optie={o}
                  active={i === unitIndex}
                  onSelect={() => setUnitIndex(i)}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-repp-navy/50">
              Koopsom v.o.n., excl. btw. Prijzen en beschikbaarheid onder
              voorbehoud.
            </p>
          </Field>

          <Slider
            label="Vergelijkbare huurprijs"
            valueLabel={`${formatEuro(huurM2)} / m² / jaar`}
            min={110}
            max={200}
            step={5}
            value={huurM2}
            onChange={setHuurM2}
            note="Waarderpolder: vergelijkbare units staan op Funda in Business rond € 130 tot € 180 per m² per jaar."
          />

          <Slider
            label="Eigen inbreng"
            valueLabel={`${inbrengPct}% · ${formatEuro(model.E)}`}
            min={10}
            max={60}
            step={5}
            value={inbrengPct}
            onChange={setInbrengPct}
          />

          <Field label="Aflossingsvorm">
            <div className="grid grid-cols-2 gap-2">
              <ChipButton
                active={vorm === "annuitair"}
                onClick={() => setVorm("annuitair")}
                title="Annuïtair"
                sub="vaste maandlast"
              />
              <ChipButton
                active={vorm === "lineair"}
                onClick={() => setVorm("lineair")}
                title="Lineair"
                sub="maandlast daalt"
              />
            </div>
          </Field>

          <div>
            <Slider
              label="Hypotheekrente"
              valueLabel={`${rente.toFixed(2).replace(".", ",")}%`}
              min={3.5}
              max={6.5}
              step={0.01}
              value={rente}
              onChange={(v) => setRenteOverride(v)}
              note={`Gemiddeld rentepunt per 1 juli 2026 bij deze eigen inbreng (LTV ${asn.groep}): ${asn.rente.toFixed(2).replace(".", ",")}%. Zakelijke financiering, 5 jaar rentevast, looptijd 25 jaar.`}
            />
            {renteOverride !== null && renteOverride !== asn.rente && (
              <button
                type="button"
                onClick={() => setRenteOverride(null)}
                className="mt-1 text-[11px] font-semibold text-repp-navy underline underline-offset-2 hover:text-repp-blue"
              >
                Terug naar gemiddeld tarief ({asn.rente.toFixed(2).replace(".", ",")}%)
              </button>
            )}
          </div>

          <Field label="Waardeontwikkeling unit">
            <div className="grid grid-cols-3 gap-2">
              {GROEI_SCENARIOS.map((s) => (
                <ChipButton
                  key={s.pct}
                  active={groei === s.pct}
                  onClick={() => setGroei(s.pct)}
                  title={s.titel}
                  sub={`${s.pct}% per jaar`}
                />
              ))}
            </div>
          </Field>

          <Field label="Kijk vooruit">
            <div className="grid grid-cols-4 gap-2">
              {HORIZONS.map((h) => (
                <ChipButton
                  key={h}
                  active={horizon === h}
                  onClick={() => setHorizon(h)}
                  title={`${h} jaar`}
                />
              ))}
            </div>
          </Field>
        </div>

        {/* ===== RESULTAAT ===== */}
        {/* lg:pt-8 (32px) = hoogte van het "Kies je unit"-label + marge in de
            linkerkolom (gemeten), zodat de navy resultaatkaart gelijk loopt met
            de navy unit-kaart ernaast. Op mobile stapelen de kolommen, dus geen
            offset. */}
        <div className="space-y-6 self-start lg:pt-8">
          <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
              Jouw voordeel na {horizon} jaar kopen i.p.v. huren
            </p>
            {/* Het sterretje verwijst naar de disclaimer-voetnoot onderaan de
                tool; de kaart zelf houdt de oorspronkelijke uitlegtekst. */}
            <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums">
              {formatEuro(Math.round(last.voordeel))}
              <span className="text-white/50 text-3xl md:text-4xl align-super">
                *
              </span>
            </p>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              De <b className="text-white">{unit.type}</b> van{" "}
              <b className="text-white">{formatM2(unit.m2)}</b> kost je als koper
              in jaar 1{" "}
              <b className="text-white">{formatEuro(Math.round(model.koopMnd))}</b>{" "}
              per maand. Als huurder betaal je{" "}
              <b className="text-white">{formatEuro(Math.round(model.huurMnd))}</b>
              , maar bouw je niets op. Na {horizon} jaar heb je{" "}
              <b className="text-white">
                {formatEuro(Math.round(vermogen - model.E))}
              </b>{" "}
              aan vermogen opgebouwd, bovenop je eigen inbreng.
            </p>
          </div>

          <MaandlastenKaart model={model} vorm={vorm} />

          <VoordeelGrafiek
            reeks={model.reeks}
            horizon={horizon}
            start={-model.K * KOSTEN_EENMALIG}
          />

          <OpbouwKaart model={model} last={last} vermogen={vermogen} horizon={horizon} />

          <AannamesDetails
            model={model}
            unit={unit}
            huurM2={huurM2}
            rente={rente}
            groei={groei}
            vorm={vorm}
            asnGroep={asn.groep}
            renteHandmatig={renteOverride !== null && renteOverride !== asn.rente}
          />

        </div>
      </div>

      {/* Disclaimer-voetnoot: hoort bij het sterretje achter het voordeel-getal
          in de donkerblauwe kaart. Bewust onderaan de tool zodat de kaart zelf
          kaal blijft; juridisch dekkend via de asterisk-koppeling. */}
      <p className="mt-8 text-[11px] text-repp-navy/45 leading-relaxed">
        * Indicatieve berekening op basis van de gekozen aannames. Geen aanbod
        of financieel advies; er kunnen geen rechten aan worden ontleend.
      </p>
    </div>
  );
}

/* ===================== UNIT-KAART ===================== */

function UnitCard({
  optie,
  active,
  onSelect,
}: {
  optie: UnitOptie;
  active: boolean;
  onSelect: () => void;
}) {
  const badgeClasses = optie.sold
    ? "bg-status-sold/15 text-status-sold"
    : optie.beschikbaar === 1
      ? "bg-status-optie/25 text-[#8a681c]"
      : "bg-status-available/20 text-[#3f7a52]";
  const perM2 = optie.prijs / optie.m2;

  // Uitverkocht = echt uit: niet klikbaar, geen hover-affordance, en het
  // héle vlak (incl. het badge) uniform gedimd via één opacity op de kaart —
  // alsof 'ie is uitgegrijsd. De inhoud houdt binnenin de normale kleuren,
  // zodat de demping overal gelijk oogt.
  if (optie.sold) {
    return (
      <div
        aria-disabled="true"
        aria-label={`${optie.type}, ${formatM2(optie.m2)}, ${formatEuro(optie.prijs)}, ${optie.badge}`}
        className="w-full rounded-xl border-2 border-repp-gray bg-surface-muted px-4 py-3 cursor-not-allowed select-none opacity-50"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-repp-navy/60">
            {optie.type}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClasses}`}
          >
            {optie.badge}
          </span>
        </div>
        <div className="mt-0.5 text-sm font-bold text-repp-navy">
          {formatM2(optie.m2)}
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="text-lg font-extrabold tabular-nums text-repp-navy">
            {formatEuro(optie.prijs)}
          </span>
          <span className="text-[11px] tabular-nums text-repp-navy/50">
            {formatEuro(Math.round(perM2))} / m²
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${optie.type}, ${formatM2(optie.m2)}, ${formatEuro(optie.prijs)}, ${optie.badge}`}
      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition ${
        active
          ? "border-repp-navy bg-repp-navy shadow-lg"
          : "border-repp-gray bg-white hover:border-repp-navy/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider ${
            active ? "text-repp-yellow" : "text-repp-navy/60"
          }`}
        >
          {optie.type}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            active ? "bg-white/15 text-white" : badgeClasses
          }`}
        >
          {optie.badge}
        </span>
      </div>
      <div className={`mt-0.5 text-sm font-bold ${active ? "text-white" : "text-repp-navy"}`}>
        {formatM2(optie.m2)}
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <span
          className={`text-lg font-extrabold tabular-nums ${
            active ? "text-repp-yellow" : "text-repp-navy"
          }`}
        >
          {formatEuro(optie.prijs)}
        </span>
        <span
          className={`text-[11px] tabular-nums ${active ? "text-white/70" : "text-repp-navy/50"}`}
        >
          {formatEuro(Math.round(perM2))} / m²
        </span>
      </div>
    </button>
  );
}

/* ===================== MAANDLASTEN ===================== */

function MaandlastenKaart({
  model,
  vorm,
}: {
  model: {
    koopMnd: number;
    huurMnd: number;
    mndHyp: number;
    hypMnd10: number;
    vveMnd: number;
    aflMnd1: number;
  };
  vorm: AflossingsVorm;
}) {
  const maxMnd = Math.max(model.koopMnd, model.huurMnd);
  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6">
      <h3 className="text-xs uppercase tracking-wider text-repp-navy font-bold">
        Maandlasten in jaar 1<span className="text-repp-navy/45">*</span>
      </h3>
      <div className="mt-4 space-y-3">
        <Balk
          naam="Huren"
          sub="weg, elke maand"
          bedrag={model.huurMnd}
          pct={(model.huurMnd / maxMnd) * 100}
          kleur="bg-repp-navy"
        />
        <Balk
          naam="Kopen"
          sub="hypotheek + lasten"
          bedrag={model.koopMnd}
          pct={(model.koopMnd / maxMnd) * 100}
          kleur="bg-repp-yellow"
        />
      </div>
      <Toelichting>
        <p>
          Koopmaandlast <b>{formatEuro(Math.round(model.koopMnd))}</b> ={" "}
          hypotheek <b>{formatEuro(Math.round(model.mndHyp))}</b> (
          {vorm === "annuitair" ? "annuïtair" : "lineair"}, 25 jaar) +
          eigenaarslasten <b>{formatEuro(Math.round(model.vveMnd))}</b>. Daarvan
          is <b>{formatEuro(Math.round(model.aflMnd1))}</b> per maand aflossing:
          geen kostenpost, maar sparen in je eigen pand.
        </p>
        <p className="mt-2">
          De eigenaarslasten zijn de VVE-bijdrage uit de projectdata en{" "}
          <b>indicatief</b>; OZB en eigen verzekering kunnen erbij komen.{" "}
          {vorm === "annuitair" ? (
            <>De hypotheeklast blijft vast, de huur stijgt elk jaar mee met
            indexatie.</>
          ) : (
            <>Bij lineair daalt je maandlast elk jaar (in jaar 10 is de
            hypotheek nog{" "}
            <b>{formatEuro(Math.round(model.hypMnd10))}</b> per maand), terwijl
            de huur elk jaar stijgt.</>
          )}
        </p>
      </Toelichting>
    </div>
  );
}

function Balk({
  naam,
  sub,
  bedrag,
  pct,
  kleur,
}: {
  naam: string;
  sub: string;
  bedrag: number;
  pct: number;
  kleur: string;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr_5.5rem] items-center gap-3">
      <div>
        <p className="text-sm font-semibold text-repp-navy leading-tight">
          {naam}
        </p>
        <p className="text-[10px] text-repp-navy/50">{sub}</p>
      </div>
      <div className="h-6 rounded bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded ${kleur} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-bold text-repp-navy text-right tabular-nums">
        {formatEuro(Math.round(bedrag))}
      </p>
    </div>
  );
}

/* ===================== GRAFIEK ===================== */

function VoordeelGrafiek({
  reeks,
  horizon,
  start,
}: {
  reeks: { t: number; voordeel: number; waarde: number; schuld: number }[];
  horizon: number;
  start: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(680);
  const [hoverT, setHoverT] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(300, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const compact = width < 520;
    const W = width;
    const H = compact ? 240 : 300;
    const padL = compact ? 58 : 76;
    const padR = compact ? 12 : 18;
    const padT = 18;
    const padB = 34;
    const punten = reeks.slice(0, horizon);
    // Voordeel bij aankoop (t=0) = min de eenmalige kosten.
    const t0 = { t: 0, voordeel: start };
    const vals = punten.map((d) => d.voordeel).concat([t0.voordeel]);
    const maxV = Math.max(...vals, 1000);
    const minV = Math.min(...vals, 0);
    const span = maxV - minV || 1;
    const x = (t: number) => padL + (t / horizon) * (W - padL - padR);
    const y = (v: number) => padT + (1 - (v - minV) / span) * (H - padT - padB);

    const alle = [t0, ...punten.map((d) => ({ t: d.t, voordeel: d.voordeel }))];
    let pathD = `M${x(0)},${y(t0.voordeel)}`;
    punten.forEach((d) => {
      pathD += ` L${x(d.t)},${y(d.voordeel)}`;
    });
    const areaD = `${pathD} L${x(horizon)},${y(0)} L${x(0)},${y(0)} Z`;

    let kantel: number | null = null;
    for (const d of punten) {
      if (d.voordeel > 0) {
        kantel = d.t;
        break;
      }
    }

    const steps = compact ? 3 : 4;
    const grid = Array.from({ length: steps + 1 }, (_, g) => {
      const v = minV + (span * g) / steps;
      return { y: y(v), label: fmtK(v, compact) };
    });

    const xstep = Math.max(
      1,
      Math.ceil(horizon / Math.max(2, Math.floor((W - padL - padR) / 78))),
    );
    const xticks: { x: number; label: string }[] = [];
    for (let t = 0; t <= horizon; t += xstep) {
      xticks.push({ x: x(t), label: t === 0 ? "nu" : `jaar ${t}` });
    }

    const pts = alle.map((p) => ({
      t: p.t,
      cx: x(p.t),
      cy: y(p.voordeel),
      voordeel: p.voordeel,
    }));
    const lastP = pts[pts.length - 1];

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      pathD,
      areaD,
      grid,
      xticks,
      pts,
      kantel,
      kantelPt: kantel != null ? pts.find((p) => p.t === kantel) : undefined,
      lastP,
      y0: y(0),
    };
  }, [reeks, horizon, width, start]);

  const hovered =
    hoverT != null ? geo.pts.find((p) => p.t === hoverT) ?? null : null;

  function onMove(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const vbX = ((clientX - rect.left) / rect.width) * geo.W;
    let best = geo.pts[0];
    let bd = Infinity;
    for (const p of geo.pts) {
      const d = Math.abs(p.cx - vbX);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    setHoverT(best.t);
  }

  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6">
      <h3 className="text-xs uppercase tracking-wider text-repp-navy font-bold">
        Jouw voordeel groeit elk jaar<span className="text-repp-navy/45">*</span>
      </h3>
      <div ref={wrapRef} className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${geo.W} ${geo.H}`}
          width="100%"
          role="img"
          aria-label="Voordeel van kopen ten opzichte van huren per jaar"
          className="block cursor-crosshair select-none"
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseLeave={() => setHoverT(null)}
          onTouchStart={(e) => e.touches[0] && onMove(e.touches[0].clientX)}
          onTouchMove={(e) => e.touches[0] && onMove(e.touches[0].clientX)}
          onTouchEnd={() => window.setTimeout(() => setHoverT(null), 1400)}
        >
          {geo.grid.map((g, i) => (
            <g key={i}>
              <line
                x1={geo.padL}
                x2={geo.W - geo.padR}
                y1={g.y}
                y2={g.y}
                stroke="#ececf4"
                strokeWidth={1}
              />
              <text
                x={geo.padL - 8}
                y={g.y + 4}
                textAnchor="end"
                fontSize={10.5}
                fill="#555580"
                className="tabular-nums"
              >
                {g.label}
              </text>
            </g>
          ))}
          {geo.xticks.map((t, i) => (
            <text
              key={i}
              x={t.x}
              y={geo.H - 10}
              textAnchor="middle"
              fontSize={10.5}
              fill="#555580"
            >
              {t.label}
            </text>
          ))}
          <line
            x1={geo.padL}
            x2={geo.W - geo.padR}
            y1={geo.y0}
            y2={geo.y0}
            stroke="#9a9ab8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <path d={geo.areaD} fill="rgba(15,15,112,0.06)" />
          <path
            d={geo.pathD}
            fill="none"
            stroke="#0f0f70"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {geo.kantelPt && (
            <>
              <circle
                cx={geo.kantelPt.cx}
                cy={geo.kantelPt.cy}
                r={7}
                fill="#edff00"
                stroke="#0f0f70"
                strokeWidth={2.5}
              />
              {/* Witte halo (paint-order: stroke) zodat het label leesbaar
                  blijft waar het over de lijn of gridlijnen valt. */}
              <text
                x={Math.min(geo.kantelPt.cx + 12, geo.W - 170)}
                y={geo.kantelPt.cy - 14}
                fontSize={12}
                fontWeight={700}
                fill="#0f0f70"
                stroke="#ffffff"
                strokeWidth={4}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                vanaf jaar {geo.kantel} wint kopen
              </text>
            </>
          )}
          <circle
            cx={geo.lastP.cx}
            cy={geo.lastP.cy}
            r={6}
            fill="#edff00"
            stroke="#0f0f70"
            strokeWidth={2.5}
          />
          <text
            x={geo.lastP.cx - 10}
            y={Math.max(geo.lastP.cy - 12, 16)}
            textAnchor="end"
            fontSize={13}
            fontWeight={700}
            fill="#0f0f70"
            className="tabular-nums"
          >
            {formatEuro(Math.round(geo.lastP.voordeel))}
          </text>
          {hovered && (
            <>
              <line
                x1={hovered.cx}
                x2={hovered.cx}
                y1={geo.padT}
                y2={geo.H - geo.padB}
                stroke="#0f0f70"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={hovered.cx}
                cy={hovered.cy}
                r={6}
                fill="#0f0f70"
                stroke="#fff"
                strokeWidth={2.5}
              />
            </>
          )}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-repp-navy text-white px-3 py-2 text-xs shadow-lg whitespace-nowrap -translate-x-1/2"
            style={{
              left: `${Math.min(Math.max((hovered.cx / geo.W) * 100, 12), 88)}%`,
              top: `${(hovered.cy / geo.H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-repp-yellow">
              {hovered.t === 0 ? "Bij aankoop" : `Jaar ${hovered.t}`}
            </div>
            Voordeel t.o.v. huren{" "}
            <span className="font-bold text-repp-yellow tabular-nums">
              {formatEuro(Math.round(hovered.voordeel))}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-5 text-[11px] text-repp-navy/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-repp-navy" />
          Voordeel koper t.o.v. huurder
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-repp-yellow border border-[#c8d600]" />
          Kantelpunt: kopen wint
        </span>
      </div>
      <p className="mt-1 text-[11px] text-repp-navy/50">
        Beweeg over de lijn om je voordeel per jaar te zien.
      </p>
    </div>
  );
}

/* ===================== OPBOUW ===================== */

function OpbouwKaart({
  model,
  last,
  vermogen,
  horizon,
}: {
  model: { E: number; reeks: { cumHuur: number }[] };
  last: { waarde: number; schuld: number; cumHuur: number };
  vermogen: number;
  horizon: number;
}) {
  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6">
      <h3 className="text-xs uppercase tracking-wider text-repp-navy font-bold">
        De opbouw na {horizon} jaar<span className="text-repp-navy/45">*</span>
      </h3>
      {/* Bewust 2×2 (geen 4 kolommen): in de twee-koloms layout is deze kaart
          ~420px breed en clippen bedragen als € 291.949 op 4 smalle kaartjes. */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Waarde van je unit" value={formatEuro(Math.round(last.waarde))} />
        <Stat label="Nog openstaande lening" value={formatEuro(Math.round(last.schuld))} />
        <Stat
          label="Jouw vermogen in steen"
          value={formatEuro(Math.round(vermogen))}
          highlight
        />
        <Stat
          label="Wat je anders aan huur kwijt was"
          value={formatEuro(Math.round(last.cumHuur))}
        />
      </div>
      <Toelichting>
        <p>
          Let op: je <b>vermogen in steen</b> ({formatEuro(Math.round(vermogen))})
          is inclusief je eigen inbreng van{" "}
          <b>{formatEuro(Math.round(model.E))}</b> — dat is je eigen geld, geen
          winst. Wat je bovenop je inbreng hebt opgebouwd via waardestijging en
          aflossing is <b>{formatEuro(Math.round(vermogen - model.E))}</b>.
        </p>
      </Toelichting>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  /** Dé kernwaarde van de kaart: navy vlak met geel bedrag (huisstijl-accent),
   *  zodat 'ie echt naar voren komt i.p.v. het eerdere goud/geel dat wegviel. */
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-3.5 ${
        highlight
          ? "bg-repp-navy border-repp-navy"
          : "bg-surface-muted border-repp-gray"
      }`}
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${
          highlight ? "text-white/60" : "text-repp-navy/50"
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-auto pt-2.5 text-lg font-extrabold tabular-nums ${
          highlight ? "text-repp-yellow" : "text-repp-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ===================== AANNAMES ===================== */

function AannamesDetails({
  model,
  unit,
  huurM2,
  rente,
  groei,
  vorm,
  asnGroep,
  renteHandmatig,
}: {
  model: { K: number; m2: number; L: number };
  unit: UnitOptie;
  huurM2: number;
  rente: number;
  groei: number;
  vorm: AflossingsVorm;
  asnGroep: string;
  renteHandmatig: boolean;
}) {
  const ltv = Math.round((model.L / model.K) * 100);
  const rows: [string, string][] = [
    ["Unit", `${unit.type} · ${formatM2(model.m2)}`],
    [
      "Koopsom v.o.n. (excl. btw)",
      `${formatEuro(model.K)} (${formatEuro(Math.round(model.K / model.m2))} per m²)`,
    ],
    [
      "Financiering",
      `${formatEuro(Math.round(model.L))}, ${vorm === "annuitair" ? "annuïtair" : "lineair"}, ${LOOPTIJD_JR} jaar, ${rente
        .toFixed(2)
        .replace(".", ",")}%`,
    ],
    [
      "Rentetarief",
      renteHandmatig
        ? "handmatig ingesteld"
        : `gemiddeld rentepunt per 1 juli 2026, 5 jaar rentevast, tariefgroep LTV ${asnGroep} (LTV hier ${ltv}%)`,
    ],
    ["Eenmalige kosten (notaris, financiering)", "2% van de koopsom"],
    [
      "Eigenaarslasten (VVE-bijdrage) — indicatief",
      `${formatEuro(unit.vve)} per maand, +2% per jaar`,
    ],
    ["Huurprijs (excl. btw en servicekosten)", `${formatEuro(huurM2)} per m² per jaar`],
    ["Huurindexatie", "3% per jaar"],
    ["Waardeontwikkeling unit", `${groei}% per jaar`],
  ];
  return (
    <details className="rounded-2xl border border-dashed border-repp-gray bg-white group">
      <summary className="flex items-center gap-2 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-repp-navy">
        <span className="text-repp-navy/50 text-lg leading-none group-open:hidden">
          +
        </span>
        <span className="text-repp-navy/50 text-lg leading-none hidden group-open:inline">
          −
        </span>
        Alle aannames en de volledige rekensom
      </summary>
      <div className="px-5 pb-5 text-[13px] text-repp-navy/70">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="py-1.5 pr-4 border-b border-surface-muted align-top">
                  {k}
                </td>
                <td className="py-1.5 text-right font-semibold text-repp-navy border-b border-surface-muted tabular-nums">
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3">
          We rekenen eerlijk: huur én hypotheekrente zijn allebei zakelijk
          aftrekbaar, dus dat effect valt grotendeels tegen elkaar weg. Het
          voordeel is: waarde van de unit min restschuld, min je eigen inbreng,
          gecorrigeerd voor het verschil in maandlasten tussen kopen en huren.
          De grafiek start daarom onder nul: op de dag van aankoop ben je de
          eenmalige kosten kwijt.
        </p>
        <p className="mt-2.5 pt-2.5 border-t border-repp-gray text-[11.5px]">
          Deze rekentool geeft een indicatie op basis van de getoonde aannames
          en is geen financieel of fiscaal advies. Aan de uitkomsten kunnen geen
          rechten worden ontleend. Vraag je financieel adviseur naar de
          uitwerking voor jouw onderneming.
        </p>
      </div>
    </details>
  );
}

/* ===================== HELPERS ===================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-repp-navy">{label}</span>
      <div className="mt-2">{children}</div>
    </div>
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
  note,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  note?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-repp-navy">{label}</span>
        <span className="text-sm font-bold text-repp-navy tabular-nums whitespace-nowrap">
          {valueLabel}
        </span>
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
      {note && <p className="mt-1.5 text-[11px] text-repp-navy/50">{note}</p>}
    </label>
  );
}

function ChipButton({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border-2 px-2 py-2.5 text-center transition ${
        active
          ? "border-repp-navy bg-repp-navy text-white"
          : "border-repp-gray bg-white text-repp-navy hover:border-repp-navy/40"
      }`}
    >
      <span className="block text-[13px] font-bold leading-tight">{title}</span>
      {sub && (
        <span
          className={`block text-[10px] mt-0.5 ${active ? "text-white/70" : "text-repp-navy/55"}`}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

function Toelichting({ children }: { children: React.ReactNode }) {
  return (
    <details className="mt-4 border-t border-repp-gray group">
      <summary className="flex items-center gap-2 cursor-pointer list-none py-3 pb-1 text-xs font-semibold text-repp-navy/60 hover:text-repp-navy">
        <span className="text-repp-navy/50 text-[15px] leading-none w-3 text-center group-open:hidden">
          +
        </span>
        <span className="text-repp-navy/50 text-[15px] leading-none w-3 text-center hidden group-open:inline">
          −
        </span>
        Toelichting
      </summary>
      <div className="pb-1 text-xs text-repp-navy/60 leading-relaxed">
        {children}
      </div>
    </details>
  );
}

function fmtK(v: number, compact: boolean): string {
  if (!compact) return formatEuro(Math.round(v));
  const sign = v < 0 ? "-" : "";
  return `${sign}€ ${Math.round(Math.abs(v) / 1000)}k`;
}
