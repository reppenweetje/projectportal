import Link from "next/link";
import type { Project, Unit } from "@/lib/types";
import { formatEuro, formatM2 } from "@/lib/types";
import { UnitStatusBadge } from "./UnitStatusBadge";
import { FavoriteButton } from "./FavoriteButton";

const typeColor: Record<Unit["type"], string> = {
  L: "border-repp-blue/30",
  XL: "border-repp-navy/40",
  XXL: "border-status-coming/50",
};

const interactiveStatuses: Unit["status"][] = [
  "available",
  "in_optie",
  "verkocht_ovb",
];

export function UnitCard({
  project,
  unit,
}: {
  project: Project;
  unit: Unit;
}) {
  const interactive = interactiveStatuses.includes(unit.status);
  const href = `/${project.slug}/units/${unit.slug}`;

  const dimmed =
    unit.status === "sold" || unit.status === "verkocht_ovb"
      ? "opacity-60"
      : "";

  const inner = (
    <div
      className={`relative rounded-xl border-2 ${typeColor[unit.type]} bg-white p-4 ${
        interactive
          ? "hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
          : dimmed
      }`}
    >
      {interactive && (
        <div className="absolute top-2 right-2">
          <FavoriteButton unitSlug={unit.slug} size="sm" variant="ghost" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-repp-navy/50">
            Unit {unit.number}
          </p>
          <p className="text-2xl font-extrabold text-repp-navy">{unit.type}</p>
        </div>
        {!interactive && <UnitStatusBadge status={unit.status} size="sm" />}
      </div>
      {interactive && (
        <div className="mt-1">
          <UnitStatusBadge status={unit.status} size="sm" />
        </div>
      )}
      <p className="mt-3 text-sm text-repp-navy/60">
        {formatM2(unit.m2BVO)} bvo
      </p>
      <p className="mt-1 font-bold text-repp-navy">
        {formatEuro(unit.prijsExBtw)}{" "}
        <span className="text-xs font-normal text-repp-navy/50">excl. btw</span>
      </p>
    </div>
  );

  if (!interactive) {
    return inner;
  }
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
