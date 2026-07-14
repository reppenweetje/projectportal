"use client";

import { useMemo } from "react";
import type { Project, Unit } from "@/lib/types";
import { formatEuro } from "@/lib/types";

/**
 * UnitTypePicker — chips om tussen unit-types te kiezen voor de calculator.
 *
 * Alle drie de types worden getoond. Types zonder beschikbare unit (L en XL
 * zijn uitverkocht) staan gedimd met "Uitverkocht" en zijn niet klikbaar;
 * alleen types met een beschikbare unit (nu de XXL) zijn selecteerbaar.
 * Volledig data-gedreven: komt een type weer beschikbaar in de projectdata,
 * dan wordt de chip vanzelf actief.
 */

const SHOWN_TYPES = ["L", "XL", "XXL"] as const;
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
      if (!unit) return null;
      const available = project.units.some(
        (u) => u.type === type && u.status === "available",
      );
      return { type, unit, available };
    }).filter(
      (x): x is { type: CalculatorUnitType; unit: Unit; available: boolean } =>
        x !== null,
    );
  }, [project]);

  const cols =
    options.length >= 3
      ? "grid-cols-1 sm:grid-cols-3"
      : options.length === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <div className={`grid gap-2 ${cols}`}>
      {options.map(({ type, unit, available }) => {
        // Uitverkochte types: gedimd, niet klikbaar, geen hover.
        if (!available) {
          return (
            <div
              key={type}
              aria-disabled="true"
              className="px-4 py-3 md:py-4 rounded-xl border-2 border-repp-gray bg-surface-muted text-left opacity-60 cursor-not-allowed select-none"
            >
              <span className="font-bold text-xl block leading-none text-repp-navy/45">
                {type}
              </span>
              <span className="text-xs block mt-1.5 font-semibold text-repp-navy/40">
                Uitverkocht
              </span>
            </div>
          );
        }

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
