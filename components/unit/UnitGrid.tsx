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

const interactiveStatuses: UnitStatus[] = ["available", "in_optie"];

type Mode = "modal" | "link";
type Size = "default" | "mini";

export function UnitGrid({
  project,
  mode = "modal",
  size = "default",
  currentSlug,
}: {
  project: Project;
  mode?: Mode;
  size?: Size;
  /** When set, that unit gets a "you are here" highlight */
  currentSlug?: string;
}) {
  const [previewUnit, setPreviewUnit] = useState<Unit | null>(null);

  const top = project.units
    .filter((u) => u.number >= 8)
    .sort((a, b) => a.number - b.number);
  const bottom = project.units
    .filter((u) => u.number <= 7)
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
              mode={mode}
              onPreview={setPreviewUnit}
            />
            <Row
              units={bottom}
              project={project}
              size={size}
              currentSlug={currentSlug}
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
  const widthCls = size === "mini" ? "w-5" : "w-7 md:w-9";
  const fontCls =
    size === "mini" ? "text-[8px]" : "text-[9px] md:text-[10px]";
  return (
    <div className={`relative ${widthCls} flex items-center justify-center`}>
      {/* Asphalt-style strip */}
      <div className="absolute inset-y-1 right-1 left-1 rounded-md bg-repp-navy/15">
        {/* dashed road centerline */}
        <div
          className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-0.5 bg-repp-navy/30"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, currentColor 0 6px, transparent 6px 12px)",
            backgroundSize: "100% 12px",
          }}
        />
      </div>
      <span
        className={`relative ${fontCls} uppercase tracking-[0.18em] text-repp-navy/70 font-semibold whitespace-nowrap`}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        A. Hofmanweg
      </span>
    </div>
  );
}

function Row({
  units,
  project,
  size,
  currentSlug,
  mode,
  onPreview,
}: {
  units: Unit[];
  project: Project;
  size: Size;
  currentSlug?: string;
  mode: Mode;
  onPreview: (u: Unit) => void;
}) {
  const hasCurrent = Boolean(currentSlug);
  return (
    <div className={size === "mini" ? "grid grid-cols-7 gap-1" : "grid grid-cols-7 gap-1.5 md:gap-2"}>
      {units.map((u) => (
        <UnitCell
          key={u.slug}
          project={project}
          unit={u}
          size={size}
          isCurrent={currentSlug === u.slug}
          hasCurrent={hasCurrent}
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
  hasCurrent,
  mode,
  onPreview,
}: {
  project: Project;
  unit: Unit;
  size: Size;
  isCurrent: boolean;
  /** true when ANY unit in the grid is the "current" one (so non-current ones can be dimmed) */
  hasCurrent: boolean;
  mode: Mode;
  onPreview: (u: Unit) => void;
}) {
  const isInteractive = interactiveStatuses.includes(unit.status);
  const isXxl = unit.type === "XXL";
  const fill = statusFill[unit.status];

  const aspectCls =
    size === "mini"
      ? "aspect-[3/4]"
      : "aspect-[2/3] md:aspect-[3/4]";

  const radiusCls =
    size === "mini" ? "rounded-sm md:rounded" : "rounded-md md:rounded-lg";

  const padCls = size === "mini" ? "p-0.5" : "p-1.5 md:p-3";

  const numberSize =
    size === "mini" ? "text-[8px]" : "text-[10px] md:text-xs";
  const typeSize =
    size === "mini" ? "text-xs md:text-sm" : "text-base md:text-2xl";
  const labelSize = size === "mini" ? "text-[7px]" : "text-[9px] md:text-[10px]";
  const m2Size = size === "mini" ? "hidden" : "text-[8px] md:text-[10px]";

  // When a current unit is set, dim all other cells so the current one pops
  const dimNonCurrent =
    hasCurrent && !isCurrent ? "opacity-35 saturate-50 hover:opacity-100 hover:saturate-100" : "";

  const currentEmphasis = isCurrent
    ? "ring-2 ring-repp-yellow ring-offset-2 ring-offset-surface-muted z-10 scale-110"
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
          <div className={`${labelSize} mt-1 opacity-80`}>
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
    { color: "bg-white border border-repp-navy/30", label: "Binnenkort in verkoop" },
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
