"use client";

import { useMemo } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro } from "@/lib/types";

/**
 * UnitTypePicker — chips om tussen unit-types te kiezen voor de calculator.
 *
 * Per user-feedback PDF Claude input koopomgeving item 1: in plaats van
 * een lange dropdown met alle 14 units toon je alleen de TYPES (L, XL).
 * Voor de calculator is dat genoeg context — gebruikers willen weten wat
 * een L of XL kost, niet welke specifieke unit. Voor unit-specifieke
 * berekeningen kunnen ze later op een individuele unit-pagina kijken.
 *
 * XXL wordt nog niet getoond (coming_soon). Bij toekomstige uitbreiding
 * kan SHOWN_TYPES uitgebreid worden.
 */

const SHOWN_TYPES = ["L", "XL"] as const;
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
    <div className="grid grid-cols-2 gap-2">
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
              vanaf {formatEuro(unit.prijsExBtw)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
