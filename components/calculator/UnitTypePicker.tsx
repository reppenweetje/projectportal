"use client";

import { useMemo } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro } from "@/lib/types";

/**
 * UnitTypePicker — chips om tussen unit-types te kiezen voor de calculator.
 *
 * De L- en XL-units zijn uitverkocht; alleen de XXL is nog te koop, dus de
 * calculator rekent nu met de XXL. Zodra er weer andere types beschikbaar
 * komen kan SHOWN_TYPES uitgebreid worden en verschijnen de chips vanzelf.
 */

const SHOWN_TYPES = ["XXL"] as const;
export type CalculatorUnitType = (typeof SHOWN_TYPES)[number];

/**
 * Geef de representatieve unit voor een type. Voorkeur:
 * 1. Eerste beschikbare unit van dat type
 * 2. Anders eerste sellable (incl. in_optie / verkocht_ovb)
 * 3. Fallback: undefined als type niet in project zit
 */
export function representativeUnitForType(
  project: Project,
  type: CalculatorUnitType,
): Unit | undefined {
  const sellable = project.units.filter((u) => u.status !== "coming_soon");
  return (
    sellable.find((u) => u.type === type && u.status === "available") ??
    sellable.find((u) => u.type === type)
  );
}

export function UnitTypePicker({
  project,
  selectedType,
  onSelect,
}: {
  project: Project;
  selectedType: CalculatorUnitType;
  onSelect: (type: CalculatorUnitType, unit: Unit) => void;
}) {
  const options = useMemo(() => {
    return SHOWN_TYPES.map((type) => {
      const unit = representativeUnitForType(project, type);
      return unit ? { type, unit } : null;
    }).filter(
      (x): x is { type: CalculatorUnitType; unit: Unit } => x !== null,
    );
  }, [project]);

  return (
    <div
      className={`grid gap-2 ${
        options.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {options.map(({ type, unit }) => {
        const active = selectedType === type;
        return (
          <button
            type="button"
            key={type}
            onClick={() => onSelect(type, unit)}
            aria-pressed={active}
            className={`px-4 py-3 md:py-4 rounded-xl border-2 transition text-left ${
              active
                ? "border-repp-navy bg-repp-navy text-white"
                : "border-repp-gray bg-white text-repp-navy hover:border-repp-navy/40"
            }`}
          >
            <span className="font-bold text-xl block leading-none">
              {type}
            </span>
            <span
              className={`text-xs block mt-1.5 ${
                active ? "text-white/70" : "text-repp-navy/60"
              }`}
            >
              {formatEuro(unit.prijsExBtw)} excl. btw
            </span>
          </button>
        );
      })}
    </div>
  );
}
