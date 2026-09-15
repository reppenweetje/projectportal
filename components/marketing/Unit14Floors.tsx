"use client";

import { useState } from "react";
import { FLOORS, USE_CASES, type FloorKey } from "@/lib/use-cases";
import { UseCaseSlider } from "./UseCaseSlider";

/**
 * Doorklik per verdieping: kies een laag en blader door de invullingen,
 * één beeld tegelijk. Tab-stijl gelijk aan de tabs op /documenten en
 * /bereken. Het dakterras hoort bij de 2e verdieping.
 */
export function Unit14Floors() {
  const [floorKey, setFloorKey] = useState<FloorKey>("bg");
  const floor = FLOORS.find((f) => f.key === floorKey) ?? FLOORS[0];
  const items = USE_CASES.filter((u) => u.floor === floorKey);

  return (
    <div className="mt-10">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Kies een verdieping"
          className="inline-flex bg-repp-gray/40 rounded-full p-1"
        >
          {FLOORS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={floorKey === f.key}
              aria-controls={`laag-${f.key}`}
              onClick={() => setFloorKey(f.key)}
              className={`px-3.5 sm:px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                floorKey === f.key
                  ? "bg-white text-repp-navy shadow"
                  : "text-repp-navy/60 hover:text-repp-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-repp-navy/60 max-w-2xl mx-auto">
        {floor.specs}
      </p>

      <div id={`laag-${floorKey}`} role="tabpanel" className="mt-8">
        <UseCaseSlider items={items} resetKey={floorKey} />
      </div>
    </div>
  );
}
