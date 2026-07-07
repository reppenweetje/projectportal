"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project, Unit, UnitStatus } from "@/lib/types";
import { UnitQuickPreview } from "./UnitQuickPreview";

const statusFill: Record<UnitStatus, string> = {
  available: "bg-status-available text-repp-navy border-status-available/0",
  in_optie: "bg-status-optie text-repp-navy border-status-optie/0",
  verkocht_ovb: "bg-status-optie text-repp-navy border-status-optie/0",
  sold: "bg-status-sold text-white border-status-sold/0",
  coming_soon: "bg-white text-repp-navy border-repp-navy/20",
};

const statusLabelShort: Record<UnitStatus, string> = {
  available: "Vrij",
  in_optie: "Optie",
  verkocht_ovb: "Onder voorb.",
  sold: "Verkocht",
  coming_soon: "Soon",
};

const interactiveStatuses: UnitStatus[] = [
  "available",
  "in_optie",
  "verkocht_ovb",
  "coming_soon",
];

type Mode = "modal" | "link";
type Size = "default" | "mini";

export function UnitGrid({
  project,
  mode = "modal",
  size = "default",
  currentSlug,
  highlightSlugs,
}: {
  project: Project;
  mode?: Mode;
  size?: Size;
  /** When set, that unit gets a "you are here" highlight (and is non-clickable) */
  currentSlug?: string;
  /** When set, these units get an accent ring en de overige worden gedimd
   * (blijven wél klikbaar). Handig om bv. de XXL-units te benadrukken. */
  highlightSlugs?: string[];
}) {
  const [previewUnit, setPreviewUnit] = useState<Unit | null>(null);
  const emphasized = new Set(highlightSlugs ?? []);

  // Rij 1 (units 1-7) bovenaan, rij 2 (units 8-14) onderaan — matched
  // de fysieke lay-out van het blok in de Waarderpolder (rij met de
  // lage nummers ligt aan de A. Hofmanweg-zijde).
  const top = project.units
    .filter((u) => u.number <= 7)
    .sort((a, b) => a.number - b.number);
  const bottom = project.units
    .filter((u) => u.number >= 8)
    .sort((a, b) => a.number - b.number);

  const containerCls =
    size === "mini"
      ? "rounded-2xl bg-surface-muted p-3 border border-repp-gray"
      : "rounded-3xl bg-surface-muted p-4 md:p-8 border border-repp-gray";

  return (
    <section id="units" className="not-prose">
      <div className={containerCls}>
        <div className="flex items-stretch gap-2 md:gap-4">
          <div className={`flex-1 ${size === "mini" ? "space-y-1" : "space-y-2"}`}>
            <Row
              units={top}
              project={project}
              size={size}
              currentSlug={currentSlug}
              emphasized={emphasized}
              mode={mode}
              onPreview={setPreviewUnit}
            />
            <Row
              units={bottom}
              project={project}
              size={size}
              currentSlug={currentSlug}
              emphasized={emphasized}
              mode={mode}
              onPreview={setPreviewUnit}
            />
          </div>
          <RoadIndicator size={size} />
        </div>
      </div>

      {size !== "mini" && <Legenda />}

      {previewUnit && (
        <UnitQuickPreview
          project={project}
          unit={previewUnit}
          onClose={() => setPreviewUnit(null)}
        />
      )}
    </section>
  );
}

function RoadIndicator({ size }: { size: Size }) {
  // De strip simuleert de A. Hofmanweg langs het blok. Op mobile passen
  // we de roteerde tekst "A. Hofmanweg" niet binnen de korte grid-hoogte
  // (text gets clipped door overflow-hidden of bleedt buiten container).
  // Daarom: alleen het asphalt + dashed centerline op mobile (visuele
  // hint is genoeg, plus straat-label staat duidelijk in de h2 erboven
  // en in de page-context). Vanaf md+ tonen we de geroteerde tekst weer
  // omdat daar wel genoeg verticale ruimte is.
  const widthCls = size === "mini" ? "w-5" : "w-6 md:w-12";
  return (
    <div className={`relative ${widthCls} flex items-center justify-center`}>
      {/* Asphalt-style strip — donkerder zodat tekst-contrast hoger is */}
      <div className="absolute inset-y-1 right-1 left-1 rounded-md bg-repp-navy/20">
        {/* dashed road centerline — transparante gaps, navy dashes */}
        <div
          className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-0.5 text-repp-navy/70"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, currentColor 0 6px, transparent 6px 12px)",
            backgroundSize: "100% 12px",
          }}
        />
      </div>
      {size !== "mini" && (
        // bg-[#c7c7dc] = repp-navy/20 geblend met de surface-muted-achtergrond
        // (#f5f5f7): 0.8·245 + 0.2·15 ≈ 199 per kanaal. Dekt de dashed
        // centerline af zodat die niet dóór de straatnaam loopt; px-2 geeft
        // wat lucht boven/onder de tekst (padding zit vóór de rotatie).
        <span
          className="hidden md:block relative text-sm uppercase tracking-[0.18em] text-repp-navy font-bold whitespace-nowrap origin-center px-2 bg-[#c7c7dc]"
          style={{ transform: "rotate(-90deg)" }}
        >
          A. Hofmanweg
        </span>
      )}
    </div>
  );
}

function Row({
  units,
  project,
  size,
  currentSlug,
  emphasized,
  mode,
  onPreview,
}: {
  units: Unit[];
  project: Project;
  size: Size;
  currentSlug?: string;
  emphasized: Set<string>;
  mode: Mode;
  onPreview: (u: Unit) => void;
}) {
  const hasFocus = Boolean(currentSlug) || emphasized.size > 0;
  return (
    <div className={size === "mini" ? "grid grid-cols-7 gap-1" : "grid grid-cols-7 gap-1.5 md:gap-2"}>
      {units.map((u) => (
        <UnitCell
          key={u.slug}
          project={project}
          unit={u}
          size={size}
          isCurrent={currentSlug === u.slug}
          isEmphasized={emphasized.has(u.slug)}
          hasFocus={hasFocus}
          mode={mode}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

function UnitCell({
  project,
  unit,
  size,
  isCurrent,
  isEmphasized,
  hasFocus,
  mode,
  onPreview,
}: {
  project: Project;
  unit: Unit;
  size: Size;
  isCurrent: boolean;
  /** accent-ring maar blijft klikbaar (bv. XXL-units) */
  isEmphasized: boolean;
  /** true when a current OR emphasized unit is set (so the rest can be dimmed) */
  hasFocus: boolean;
  mode: Mode;
  onPreview: (u: Unit) => void;
}) {
  const isInteractive = interactiveStatuses.includes(unit.status);
  const isXxl = unit.type === "XXL";
  const fill = statusFill[unit.status];

  const aspectCls =
    size === "mini"
      ? "aspect-[3/4]"
      : "aspect-square md:aspect-[3/4]";

  const radiusCls =
    size === "mini" ? "rounded-sm md:rounded" : "rounded-md md:rounded-lg";

  const padCls = size === "mini" ? "p-0.5" : "p-1 md:p-3";

  const numberSize =
    size === "mini" ? "text-[8px]" : "text-[9px] md:text-xs";
  const typeSize =
    size === "mini" ? "text-xs md:text-sm" : "text-sm md:text-2xl";
  const labelSize = size === "mini" ? "text-[7px]" : "text-[9px] md:text-[10px]";
  // m² + status-label alleen op desktop; op mobile is alleen U-nummer + type genoeg
  // (kleur duidt status, legenda eronder verklaart de kleuren)
  const m2Size = size === "mini" ? "hidden" : "hidden md:block text-[10px]";
  const labelHiddenOnMobile = "hidden md:block";

  // Dim alle niet-gefocuste cellen zodat de current/emphasized-units poppen.
  // "wat lichter van kleur" i.p.v. bijna onzichtbaar, zodat de rest van het
  // blok als context leesbaar blijft.
  const dimNonCurrent =
    hasFocus && !isCurrent && !isEmphasized
      ? "opacity-55 saturate-[.65] hover:opacity-100 hover:saturate-100"
      : "";

  // De "je bent hier"-cel (detailpagina) mag opschalen — die staat op zichzelf.
  // Ge-highlighte XXL-units NIET opschalen: op de koppen van het blok liepen
  // de vergrote cellen over de buren/straat heen. Alleen een accent-ring.
  const currentEmphasis = isCurrent
    ? "ring-2 ring-repp-yellow ring-offset-2 ring-offset-surface-muted z-10 scale-110"
    : isEmphasized
      ? "ring-2 ring-repp-yellow ring-offset-2 ring-offset-surface-muted z-10"
      : "";

  const inner = (
    <div
      className={`relative ${aspectCls} ${radiusCls} border-2 ${padCls} flex flex-col justify-between transition-all duration-200 ${fill} ${
        isXxl ? "ring-1 ring-status-coming/40" : ""
      } ${currentEmphasis} ${dimNonCurrent} ${
        isInteractive && !isCurrent
          ? "hover:scale-[1.04] hover:shadow cursor-pointer"
          : ""
      }`}
      title={`Unit ${unit.number} · ${unit.type}`}
    >
      <div className={`${numberSize} font-bold uppercase tracking-wider opacity-80`}>
        U-{unit.number}
      </div>
      <div className="text-center">
        <div className={`${typeSize} font-extrabold leading-none`}>
          {unit.type}
        </div>
        {size !== "mini" && (
          <div className={`${labelSize} ${labelHiddenOnMobile} mt-1 opacity-80`}>
            {statusLabelShort[unit.status]}
          </div>
        )}
      </div>
      <div className={`${m2Size} opacity-70 text-right tabular-nums`}>
        {Math.round(unit.m2BVO)}m²
      </div>
    </div>
  );

  if (!isInteractive || isCurrent) return inner;

  if (mode === "link") {
    return (
      <Link href={`/${project.slug}/units/${unit.slug}`} className="block">
        {inner}
      </Link>
    );
  }

  // mode === "modal"
  return (
    <button
      type="button"
      onClick={() => onPreview(unit)}
      className="block w-full text-left"
    >
      {inner}
    </button>
  );
}

function Legenda() {
  const items: { color: string; label: string }[] = [
    { color: "bg-status-available", label: "Beschikbaar" },
    { color: "bg-status-optie", label: "Verkocht onder voorbehoud" },
    { color: "bg-status-sold", label: "Verkocht" },
  ];
  return (
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-repp-navy/70 justify-center">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded ${i.color}`} />
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
}
