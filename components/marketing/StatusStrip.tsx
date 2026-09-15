import { STATUS_DATE, XXL_AREA_LABEL } from "@/lib/site-config";

/**
 * Statusstrook onder de hero: de drie types met hun verkoopstatus. Feitelijk,
 * met datum. Kaartstijl gelijk aan de rest van de site.
 */
const ROWS: { title: string; label: string; accent?: boolean }[] = [
  { title: "L · 105 m²", label: "Uitverkocht" },
  { title: "XL · 113 m²", label: "Uitverkocht" },
  { title: `XXL · ${XXL_AREA_LABEL}`, label: "Nog 1 van 2 te koop", accent: true },
];

export function StatusStrip() {
  return (
    <section className="px-5 py-8 md:py-10 bg-surface-muted">
      <div className="mx-auto max-w-5xl">
        <ul className="grid sm:grid-cols-3 gap-2.5 md:gap-4">
          {ROWS.map((r) => (
            <li
              key={r.title}
              className={`rounded-xl border px-4 py-3 md:p-5 flex items-center justify-between gap-3 ${
                r.accent
                  ? "bg-repp-navy border-repp-navy text-white"
                  : "bg-white border-repp-gray text-repp-navy"
              }`}
            >
              <p className="font-bold text-sm md:text-base">{r.title}</p>
              <p
                className={`text-xs md:text-sm font-semibold shrink-0 ${
                  r.accent ? "text-repp-yellow" : "text-repp-navy/55"
                }`}
              >
                {r.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-repp-navy/55 text-center">
          Status per {STATUS_DATE}. Unit 7 is verkocht onder voorbehoud van
          financiering.
        </p>
      </div>
    </section>
  );
}
