"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FLOORS, USE_CASES, type FloorKey } from "@/lib/use-cases";

/**
 * Doorklik per verdieping: kies een laag en blader door de invullingen,
 * één beeld tegelijk. Tab-stijl gelijk aan de tabs op /documenten en
 * /bereken; bladeren werkt met swipen, de pijlen of de bolletjes.
 * Het dakterras hoort bij de 2e verdieping.
 */
export function Unit14Floors() {
  const [floorKey, setFloorKey] = useState<FloorKey>("bg");
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const floor = FLOORS.find((f) => f.key === floorKey) ?? FLOORS[0];
  const items = USE_CASES.filter((u) => u.floor === floorKey);

  // Bijhouden welk beeld in beeld staat, voor de bolletjes en de pijlen.
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.firstElementChild as HTMLElement | null;
    const width = slide ? slide.offsetWidth + 16 : el.clientWidth; // + gap-4
    setActive(Math.round(el.scrollLeft / width));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Bij een andere verdieping weer bij het eerste beeld beginnen.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
  }, [floorKey]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

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
        {/* Eén beeld tegelijk; swipen op touch, pijlen en bolletjes eronder. */}
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((uc, i) => (
            <figure
              key={uc.src}
              className="snap-start shrink-0 w-full overflow-hidden rounded-2xl border border-repp-gray bg-white"
            >
              <div className="relative aspect-video">
                <Image
                  src={uc.src}
                  alt={uc.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-5 md:p-6 text-center">
                <p className="font-bold text-repp-navy text-lg">{uc.title}</p>
                <p className="mt-1 text-sm text-repp-navy/70 leading-relaxed max-w-xl mx-auto">
                  {uc.body}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            aria-label="Vorige"
            className="w-10 h-10 rounded-full border border-repp-gray bg-white text-repp-navy grid place-items-center hover:border-repp-navy/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            {items.map((uc, i) => (
              <button
                key={uc.src}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Ga naar ${uc.title}`}
                aria-current={i === active}
                className={`h-2 rounded-full transition-all ${
                  i === active
                    ? "w-6 bg-repp-navy"
                    : "w-2 bg-repp-navy/25 hover:bg-repp-navy/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollTo(active + 1)}
            disabled={active === items.length - 1}
            aria-label="Volgende"
            className="w-10 h-10 rounded-full border border-repp-gray bg-white text-repp-navy grid place-items-center hover:border-repp-navy/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
