type IconKind =
  | "book"
  | "euro"
  | "blueprint"
  | "map"
  | "image"
  | "checklist"
  | "wrench"
  | "contract"
  | "people";

const KIND_BY_SLUG: Record<string, IconKind> = {
  brochure: "book",
  prijslijst: "euro",
  plattegronden: "blueprint",
  situatietekening: "map",
  impressies: "image",
  optielijst: "checklist",
  "technische-omschrijving": "wrench",
  koopcontract: "contract",
  "koop-aannemingsovereenkomst": "contract",
  "huishoudelijk-reglement": "people",
};

const TINT: Record<IconKind, { bg: string; fg: string }> = {
  book:        { bg: "bg-amber-50",     fg: "text-amber-600" },
  euro:        { bg: "bg-emerald-50",   fg: "text-emerald-600" },
  blueprint:   { bg: "bg-sky-50",       fg: "text-sky-600" },
  map:         { bg: "bg-rose-50",      fg: "text-rose-600" },
  image:       { bg: "bg-fuchsia-50",   fg: "text-fuchsia-600" },
  checklist:   { bg: "bg-indigo-50",    fg: "text-indigo-600" },
  wrench:      { bg: "bg-slate-100",    fg: "text-slate-600" },
  contract:    { bg: "bg-violet-50",    fg: "text-violet-600" },
  people:      { bg: "bg-teal-50",      fg: "text-teal-600" },
};

export function DocIcon({ slug }: { slug: string }) {
  const kind = KIND_BY_SLUG[slug] ?? "book";
  const { bg, fg } = TINT[kind];
  return (
    <div
      className={`shrink-0 w-12 h-12 rounded-xl ${bg} ${fg} grid place-items-center`}
    >
      <Glyph kind={kind} />
    </div>
  );
}

function Glyph({ kind }: { kind: IconKind }) {
  const common = "w-6 h-6";
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "book":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M9 7h7M9 11h7" />
        </svg>
      );
    case "euro":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8.5a4.5 4.5 0 0 0-7 1.5h6M9 14h6a4.5 4.5 0 0 1-7 1.5M7 11h6M7 13h6" />
        </svg>
      );
    case "blueprint":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h7M10 9v12M14 3v7M14 10h7M14 14h4M14 18h7" />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case "checklist":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          <path d="M9 7H7M9 17H7" />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M14.7 6.3a4 4 0 1 0 5 5l-4-4-1 4-4-1z" />
          <path d="M11.5 12.5L4 20l2 2 7.5-7.5" />
        </svg>
      );
    case "contract":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M9 13h6M9 17h4" />
          <path d="m15 19 1.5 1.5L20 17" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" className={common} {...stroke}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
        </svg>
      );
  }
}
