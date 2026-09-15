/**
 * Specificaties van unit 14 (XXL), op één plek zodat /xxl en de homepage
 * dezelfde cijfers tonen.
 */
export const UNIT14_SPECS: { label: string; value: string }[] = [
  { label: "Begane grond", value: "60 m²" },
  { label: "1e verdieping", value: "60 m²" },
  { label: "2e verdieping", value: "70 m²" },
  { label: "Dakterras", value: "42,5 m²" },
  { label: "Vrije hoogte BG", value: "3,69 m" },
];

export function Spec({
  label,
  value,
  tone = "dark",
}: {
  label: string;
  value: string;
  /** dark = witte tekst op donkere achtergrond, light = navy op wit. */
  tone?: "dark" | "light";
}) {
  const labelCls =
    tone === "dark" ? "text-white/60" : "text-repp-navy/55";
  const valueCls = tone === "dark" ? "text-white" : "text-repp-navy";
  return (
    <div className={tone === "dark" ? "text-center" : ""}>
      <p
        className={`text-xs md:text-[13px] uppercase tracking-wider font-semibold ${labelCls}`}
      >
        {label}
      </p>
      <p className={`mt-1 text-lg md:text-xl font-bold ${valueCls}`}>{value}</p>
    </div>
  );
}

export function Unit14SpecList({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div
      className={
        tone === "dark"
          ? "flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm"
          : "grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm"
      }
    >
      {UNIT14_SPECS.map((s) => (
        <Spec key={s.label} label={s.label} value={s.value} tone={tone} />
      ))}
    </div>
  );
}
