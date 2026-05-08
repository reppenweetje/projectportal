import type { PriceBenchmark } from "@/lib/types";
import { formatEuro } from "@/lib/types";

export function PriceComparisonChart({
  benchmarks,
}: {
  benchmarks: PriceBenchmark[];
}) {
  // Sort: Hofman first, then ascending price
  const sorted = [...benchmarks].sort((a, b) => {
    if (a.isHofman && !b.isHofman) return -1;
    if (!a.isHofman && b.isHofman) return 1;
    return a.pricePerM2 - b.pricePerM2;
  });

  // Bar widths: scale from a minimum baseline to max so the cheapest still
  // has a visible bar but the differences are clearly visible.
  const max = Math.max(...sorted.map((b) => b.pricePerM2));
  const min = Math.min(...sorted.map((b) => b.pricePerM2));
  // Use a slightly extended range so cheapest bar is around 50%, most expensive 100%.
  const baseline = min - (max - min);
  const range = max - baseline;
  const widthFor = (price: number) =>
    Math.max(35, Math.min(100, ((price - baseline) / range) * 100));

  return (
    <div className="rounded-2xl bg-white border border-repp-gray p-5 md:p-7">
      <ul className="space-y-2.5">
        {sorted.map((b) => (
          <li
            key={`${b.label}-${b.pricePerM2}`}
            className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-3 md:gap-5 items-center"
          >
            <div className="text-right">
              <p
                className={`text-sm md:text-base font-bold ${
                  b.isHofman ? "text-repp-navy" : "text-repp-navy/70"
                }`}
              >
                {b.label}
              </p>
              <p
                className={`text-xs ${
                  b.isHofman ? "text-repp-navy/60" : "text-repp-navy/45"
                }`}
              >
                {b.sublabel}
              </p>
            </div>
            <div className="relative h-10 md:h-12">
              <div
                className={`absolute inset-y-0 left-0 rounded-md flex items-center px-3 md:px-4 transition-all ${
                  b.isHofman
                    ? "bg-repp-navy text-white"
                    : "bg-repp-gray/50 text-repp-navy/80"
                }`}
                style={{ width: `${widthFor(b.pricePerM2)}%` }}
              >
                <span className="text-sm md:text-base font-bold tabular-nums whitespace-nowrap">
                  {formatEuro(b.pricePerM2)},-
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[11px] text-repp-navy/45 leading-relaxed">
        Vergelijking op basis van openbare verkoopinformatie van vergelijkbare
        bedrijfsunits in de Waarderpolder. Prijs per m² koopsom excl. btw.
      </p>
    </div>
  );
}
