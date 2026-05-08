"use client";

import { useState } from "react";

type Tab = "documenten" | "faq" | "locatie";

const tabs: { key: Tab; label: string }[] = [
  { key: "documenten", label: "Documenten" },
  { key: "faq", label: "FAQ" },
  { key: "locatie", label: "Locatie" },
];

export function InfoTabs({
  documenten,
  faq,
  locatie,
}: {
  documenten: React.ReactNode;
  faq: React.ReactNode;
  locatie: React.ReactNode;
}) {
  const [active, setActive] = useState<Tab>("documenten");

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex bg-repp-gray/40 rounded-full p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                active === t.key
                  ? "bg-white text-repp-navy shadow"
                  : "text-repp-navy/60 hover:text-repp-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {active === "documenten" && documenten}
        {active === "faq" && faq}
        {active === "locatie" && locatie}
      </div>
    </div>
  );
}
