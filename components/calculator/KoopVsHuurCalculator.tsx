"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro, formatM2 } from "@/lib/types";

/**
 * KoopVsHuurCalculator — laat een ondernemer zien wat kopen bij De Hofman
 * oplevert t.o.v. huren. Kies een unit (echte prijzen + beschikbaarheid uit
 * de projectdata), schuif met huur/inbreng/rente en zie het voordeel,
 * de maandlasten en de vermogensopbouw over de tijd.
 *
 * Model: annuïtaire hypotheek (25 jr). Eigenaarslasten = VVE-bijdrage uit de
 * projectdata (geïndexeerd 2%/jr). Huur geïndexeerd 3%/jr. Voordeel =
 * (waarde − restschuld) − eigen inbreng − (cumulatieve koopkosten − cumulatieve
 * huur). Zie de "Alle aannames"-sectie voor de volledige uitleg + disclaimer.
 */

const LOOPTIJD_JR = 25;
const HUUR_INDEX = 0.03;
const VVE_INDEX = 0.02;
const KOSTEN_EENMALIG = 0.02; // notaris + financiering, % van koopsom

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
              ? "Laatste unit"
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
  const [inbrengPct, setInbrengPct] = useState(10);
  const [rente, setRente] = useState(5.0);
  const [groei, setGroei] = useState(2);
  const [horizon, setHorizon] = useState(10);

  const unit = opties[unitIndex] ?? opties[0];

  const model = useMemo(() => {
    const K = unit.prijs;
    const m2 = unit.m2;
    const E = (K * inbrengPct) / 100;
    const L = K - E;
    const mndHyp = annuiteit(L, rente, LOOPTIJD_JR);
    const reeks: {
      t: number;
      voordeel: number;
      waarde: number;
      schuld: number;
      cumHuur: number;
    }[] = [];
    let cumKoop = K * KOSTEN_EENMALIG;
    let cumHuur = 0;
    for (let t = 1; t <= 20; t++) {
      const huurJr = m2 * huurM2 * Math.pow(1 + HUUR_INDEX, t - 1);
      const vveJr = unit.vve * 12 * Math.pow(1 + VVE_INDEX, t - 1);
      cumHuur += huurJr;
      cumKoop += mndHyp * 12 + vveJr;
      const waarde = K * Math.pow(1 + groei / 100, t);
      const schuld = Math.max(
        0,
        restschuld(L, rente, LOOPTIJD_JR, Math.min(t, LOOPTIJD_JR)),
      );
      const voordeel = waarde - schuld - E - (cumKoop - cumHuur);
      reeks.push({ t, voordeel, waarde, schuld, cumHuur });
    }
    const aflMnd1 = (L - restschuld(L, rente, LOOPTIJD_JR, 1)) / 12;
    return {
      K,
      m2,
      E,
      L,
      mndHyp,
      vveMnd: unit.vve,
      huurMnd: (m2 * huurM2) / 12,
      koopMnd: mndHyp + unit.vve,
      aflMnd1,
      reeks,
    };
  }, [unit, huurM2, inbrengPct, rente, groei]);

  const last = model.reeks[horizon - 1];
  const vermogen = last.waarde - last.schuld;

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

          <Slider
            label="Hypotheekrente"
            valueLabel={`${rente.toFixed(1).replace(".", ",")}%`}
            min={3.5}
            max={6.5}
            step={0.1}
            value={rente}
            onChange={setRente}
            note="Zakelijke financiering, annuïtair, 25 jaar."
          />

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
        <div className="space-y-6 self-start">
          <div className="rounded-2xl bg-repp-navy text-white p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
              Jouw voordeel na {horizon} jaar kopen i.p.v. huren
            </p>
            <p className="mt-2 text-5xl md:text-6xl font-extrabold tracking-tight tabular-nums">
              {formatEuro(Math.round(last.voordeel))}
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
            <p className="mt-4 text-[11px] text-white/40 leading-relaxed">
              Indicatieve berekening op basis van de gekozen aannames. Geen
              aanbod of financieel advies; er kunnen geen rechten aan worden
              ontleend.
            </p>
          </div>

          <MaandlastenKaart model={model} />

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
          />

          <div className="rounded-2xl bg-surface-muted border border-repp-gray p-6 text-center">
            <p className="text-lg font-bold text-repp-navy">
              Klopt dit voor jouw situatie? Reken het na met ons.
            </p>
            <p className="mt-1 text-sm text-repp-navy/70">
              Ontvang deze berekening op maat, of kom de units bekijken op de
              Waarderpolder.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link
                href={`/${project.slug}/reserveren`}
                className="inline-flex items-center bg-repp-yellow text-repp-navy font-bold px-5 py-3 rounded-full hover:brightness-95 transition"
              >
                Plan een bezichtiging
              </Link>
              <Link
                href={`/${project.slug}/units`}
                className="inline-flex items-center bg-white text-repp-navy font-semibold px-5 py-3 rounded-full border border-repp-gray hover:border-repp-navy transition"
              >
                Bekijk de units
              </Link>
            </div>
          </div>
        </div>
      </div>
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
            active ? "text-repp-yellow" : "text-hofman-orange"
          }`}
        >
          {optie.type}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            active ? "bg-white/15 text-white" : badgeClasses
          } ${optie.sold ? "opacity-90" : ""}`}
        >
          {optie.badge}
        </span>
      </div>
      <div className={`mt-0.5 text-sm font-bold ${active ? "text-white" : "text-repp-navy"} ${optie.sold && !active ? "opacity-60" : ""}`}>
        {formatM2(optie.m2)}
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <span
          className={`text-lg font-extrabold tabular-nums ${
            active ? "text-repp-yellow" : "text-repp-navy"
          } ${optie.sold && !active ? "opacity-60" : ""}`}
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
}: {
  model: {
    koopMnd: number;
    huurMnd: number;
    mndHyp: number;
    vveMnd: number;
    aflMnd1: number;
  };
}) {
  const maxMnd = Math.max(model.koopMnd, model.huurMnd);
  return (
    <div className="rounded-2xl border border-repp-gray bg-white p-6">
      <h3 className="text-xs uppercase tracking-wider text-repp-navy font-bold">
        Maandlasten in jaar 1
      </h3>
      <div className="mt-4 space-y-3">
        <Balk
          naam="Huren"
          sub="weg, elke maand"
          bedrag={model.huurMnd}
          pct={(model.huurMnd / maxMnd) * 100}
          kleur="bg-repp-gray"
        />
        <Balk
          naam="Kopen"
          sub="hypotheek + lasten"
          bedrag={model.koopMnd}
          pct={(model.koopMnd / maxMnd) * 100}
          kleur="bg-hofman-orange"
        />
      </div>
      <Toelichting>
        <p>
          Koopmaandlast <b>{formatEuro(Math.round(model.koopMnd))}</b> ={" "}
          hypotheek <b>{formatEuro(Math.round(model.mndHyp))}</b> (annuïtair, 25
          jaar) + eigenaarslasten <b>{formatEuro(Math.round(model.vveMnd))}</b>.
          Daarvan is <b>{formatEuro(Math.round(model.aflMnd1))}</b> per maand
          aflossing: geen kostenpost, maar sparen in je eigen pand.
        </p>
        <p className="mt-2">
          De eigenaarslasten zijn de VVE-bijdrage uit de projectdata en{" "}
          <b>indicatief</b>; OZB en eigen verzekering kunnen erbij komen. De
          hypotheeklast blijft vast, de huur stijgt elk jaar mee met indexatie.
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
        Jouw voordeel groeit elk jaar
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
          <path d={geo.areaD} fill="rgba(245,158,11,0.13)" />
          <path
            d={geo.pathD}
            fill="none"
            stroke="#f59e0b"
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
              <text
                x={Math.min(geo.kantelPt.cx + 12, geo.W - 170)}
                y={geo.kantelPt.cy - 12}
                fontSize={11.5}
                fontWeight={700}
                fill="#0f0f70"
              >
                vanaf jaar {geo.kantel} wint kopen
              </text>
            </>
          )}
          <circle
            cx={geo.lastP.cx}
            cy={geo.lastP.cy}
            r={5.5}
            fill="#f59e0b"
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
          <span className="w-2.5 h-2.5 rounded-full bg-hofman-orange" />
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
        De opbouw na {horizon} jaar
      </h3>
      {/* Bewust 2×2 (geen 4 kolommen): in de twee-koloms layout is deze kaart
          ~420px breed en clippen bedragen als € 291.949 op 4 smalle kaartjes. */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Waarde van je unit" value={formatEuro(Math.round(last.waarde))} />
        <Stat label="Nog openstaande lening" value={formatEuro(Math.round(last.schuld))} />
        <Stat
          label="Jouw vermogen in steen"
          value={formatEuro(Math.round(vermogen))}
          gold
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
  gold,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-3.5 ${
        gold
          ? "bg-[#faf5e9] border-[#e8d5a8]"
          : "bg-surface-muted border-repp-gray"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-repp-navy/50 leading-tight">
        {label}
      </span>
      <span
        className={`mt-auto pt-2.5 text-lg font-extrabold tabular-nums ${
          gold ? "text-[#8a681c]" : "text-repp-navy"
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
}: {
  model: { K: number; m2: number; L: number };
  unit: UnitOptie;
  huurM2: number;
  rente: number;
  groei: number;
}) {
  const rows: [string, string][] = [
    ["Unit", `${unit.type} · ${formatM2(model.m2)}`],
    [
      "Koopsom v.o.n. (excl. btw)",
      `${formatEuro(model.K)} (${formatEuro(Math.round(model.K / model.m2))} per m²)`,
    ],
    [
      "Financiering",
      `${formatEuro(Math.round(model.L))}, annuïtair, ${LOOPTIJD_JR} jaar, ${rente
        .toFixed(1)
        .replace(".", ",")}%`,
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
        <span className="text-hofman-orange text-lg leading-none group-open:hidden">
          +
        </span>
        <span className="text-hofman-orange text-lg leading-none hidden group-open:inline">
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
        <span className="text-sm font-bold text-hofman-orange tabular-nums whitespace-nowrap">
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
        <span className="text-hofman-orange text-[15px] leading-none w-3 text-center group-open:hidden">
          +
        </span>
        <span className="text-hofman-orange text-[15px] leading-none w-3 text-center hidden group-open:inline">
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
