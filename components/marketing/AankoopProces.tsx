const stappen = [
  {
    nummer: "01",
    titel: "Bekijk de unit",
    body: "Vind de unit die past: formaat, prijs, ligging in het blok.",
  },
  {
    nummer: "02",
    titel: "Bereken je financiering",
    body: "Vrijblijvende financieringsscan via onze partner Credion.",
  },
  {
    nummer: "03",
    titel: "Reserveer",
    body: "5% aanbetaling op de notarisrekening; jouw unit staat 24 uur op slot.",
  },
  {
    nummer: "04",
    titel: "Teken digitaal",
    body: "Koopovereenkomst digitaal getekend, factuur volgt automatisch.",
  },
  {
    nummer: "05",
    titel: "Bouwfase",
    body: "We houden je via 'Mijn Hofman' op de hoogte van mijlpalen en planning.",
  },
  {
    nummer: "06",
    titel: "Sleuteloverdracht",
    body: "Naar verwachting eind 2026. Welkom in De Hofman.",
  },
];

export function AankoopProces() {
  return (
    <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {stappen.map((s) => (
        <li
          key={s.nummer}
          className="rounded-2xl border border-repp-gray bg-white p-6"
        >
          <p className="text-sm font-bold text-repp-blue">{s.nummer}</p>
          <p className="mt-2 text-lg font-bold text-repp-navy">{s.titel}</p>
          <p className="mt-1 text-sm text-repp-navy/70">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
