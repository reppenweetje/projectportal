import type { UnitStatus } from "@/lib/types";

const labels: Record<UnitStatus, string> = {
  available: "Beschikbaar",
  in_optie: "In optie",
  verkocht_ovb: "Verkocht o.v.b.",
  sold: "Verkocht",
  coming_soon: "Binnenkort",
};

const styles: Record<UnitStatus, string> = {
  available: "bg-status-available text-repp-navy",
  in_optie: "bg-status-optie text-repp-navy",
  verkocht_ovb: "bg-status-optie text-repp-navy",
  sold: "bg-status-sold text-white",
  coming_soon: "bg-white text-repp-navy border border-repp-navy/30",
};

export function UnitStatusBadge({
  status,
  size = "md",
}: {
  status: UnitStatus;
  size?: "sm" | "md";
}) {
  const sizing =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider rounded ${sizing} ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
