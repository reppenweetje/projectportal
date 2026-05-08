"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Project, Unit } from "@/lib/types";
import { formatEuro, formatM2 } from "@/lib/types";
import { UnitStatusBadge } from "./UnitStatusBadge";
import { FavoriteButton } from "./FavoriteButton";

export function UnitQuickPreview({
  project,
  unit,
  onClose,
}: {
  project: Project;
  unit: Unit;
  onClose: () => void;
}) {
  // Lock scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const specs = project.defaultSpecsByType[unit.type];
  const sameType = project.units.filter((u) => u.type === unit.type);
  const sameTypeAvailable = sameType.filter(
    (u) => u.status === "available",
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile bottom sheet */}
        <div className="md:hidden pt-2 pb-1 flex justify-center">
          <span className="block w-10 h-1 rounded-full bg-repp-gray" />
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                Unit {unit.number}
              </p>
              <p className="mt-1 text-5xl font-extrabold text-repp-navy leading-none">
                {unit.type}
              </p>
              <p className="mt-2 text-sm text-repp-navy/70">
                {formatM2(unit.m2BVO)} bvo · {unit.layers} lagen
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <UnitStatusBadge status={unit.status} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Sluiten"
                className="text-repp-navy/40 hover:text-repp-navy text-xl w-8 h-8 grid place-items-center"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-surface-muted p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-repp-navy/60">Koopsom</span>
              <span className="text-2xl font-extrabold text-repp-navy tabular-nums">
                {formatEuro(unit.prijsExBtw)}
              </span>
            </div>
            <p className="text-xs text-repp-navy/50 mt-0.5 text-right">
              excl. btw · v.o.n. · VVE €{unit.vvePerMaand}/mnd
            </p>
          </div>

          <ul className="mt-6 space-y-2 text-sm">
            <SpecRow label="Begane grond" value={formatM2(unit.m2BeganeGrond)} />
            <SpecRow
              label="Eerste verdieping"
              value={formatM2(unit.m2EersteVerdieping)}
            />
            {unit.m2TweedeVerdieping && (
              <SpecRow
                label="Tweede verdieping"
                value={`${formatM2(unit.m2TweedeVerdieping)} (mogelijk woning)`}
              />
            )}
            <SpecRow
              label="Vrije hoogte begane grond"
              value={specs.vrijeHoogteBeganeGrond}
            />
            <SpecRow
              label="Vloerbelasting"
              value={specs.vloerbelastingBeganeGrond}
            />
            <SpecRow label="Overheaddeur" value={specs.overheaddeur} />
            <SpecRow label="Parkeren" value="Eigen plek voor de deur" />
          </ul>

          {sameTypeAvailable > 0 && (
            <p className="mt-5 text-xs text-repp-navy/60 text-center">
              <span className="font-semibold text-repp-navy">
                {sameTypeAvailable}{" "}
                {sameTypeAvailable === 1 ? "unit" : "units"} {unit.type}
              </span>{" "}
              vrij van {sameType.length} totaal
            </p>
          )}

          <div className="mt-6 space-y-2">
            <Link
              href={`/${project.slug}/units/${unit.slug}`}
              className="block w-full bg-repp-navy text-white text-center font-bold px-4 py-3.5 rounded-full hover:bg-repp-blue transition"
              onClick={onClose}
            >
              Bekijk meer over deze unit →
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/${project.slug}/reserveren?unit=${unit.slug}`}
                className="flex-1 block bg-repp-yellow text-repp-navy text-center font-bold px-4 py-3 rounded-full hover:brightness-95 transition"
                onClick={onClose}
              >
                Reserveer (vrijblijvend)
              </Link>
              <FavoriteButton unitSlug={unit.slug} size="lg" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1">
      <span className="text-repp-navy/60">{label}</span>
      <span className="font-semibold text-repp-navy text-right">{value}</span>
    </li>
  );
}
