"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { UseCase } from "@/lib/use-cases";

/**
 * Slider die één invulling tegelijk toont, op de volle breedte van zijn
 * container. Swipen op touch, pijlen en bolletjes eronder. Gedeeld door de
 * XXL-pagina en de doorklik per verdieping op de homepage.
 *
 * `resetKey` springt terug naar het eerste beeld zodra die verandert, bv.
 * bij het wisselen van verdieping.
 */
export function UseCaseSlider({
  items,
  resetKey,
}: {
  items: UseCase[];
  resetKey?: string;
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
  }, [resetKey]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((uc) => (
          <figure
            key={uc.src}
            className="snap-start shrink-0 w-full overflow-hidden rounded-2xl border border-repp-gray bg-white"
          >
            <div className="relative aspect-video">
              <Image
                src={uc.src}
                alt={uc.alt}
                fill
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
  );
}
