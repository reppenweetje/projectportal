"use client";

import { useState } from "react";
import Image from "next/image";
import { FLOORS, USE_CASES, type FloorKey } from "@/lib/use-cases";

/**
 * Doorklik per verdieping: kies een laag en zie wat je daar kunt doen.
 * Tab-stijl gelijk aan de tabs op /documenten en /bereken. Het dakterras
 * hoort bij de 2e verdieping en krijgt daar een brede kaart.
 */
export function Unit14Floors() {
  const [active, setActive] = useState<FloorKey>("bg");
  const floor = FLOORS.find((f) => f.key === active) ?? FLOORS[0];
  const items = USE_CASES.filter((u) => u.floor === active);

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
              aria-selected={active === f.key}
              aria-controls={`laag-${f.key}`}
              onClick={() => setActive(f.key)}
              className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                active === f.key
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

      <div id={`laag-${active}`} role="tabpanel" className="mt-8">
        <ul className="grid sm:grid-cols-2 gap-5">
          {items.map((uc) => (
            <li
              key={uc.src}
              className={`overflow-hidden rounded-2xl border border-repp-gray bg-white ${
                uc.wide ? "sm:col-span-2" : ""
              }`}
            >
              <div className={`relative ${uc.wide ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                <Image
                  src={uc.src}
                  alt={uc.alt}
                  fill
                  sizes={
                    uc.wide
                      ? "(max-width: 1024px) 100vw, 1024px"
                      : "(max-width: 640px) 100vw, 50vw"
                  }
                  className="object-cover"
                />
              </div>
              <div className="p-5 text-center">
                <p className="font-bold text-repp-navy">{uc.title}</p>
                <p className="mt-1 text-sm text-repp-navy/70 leading-relaxed max-w-xl mx-auto">
                  {uc.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
