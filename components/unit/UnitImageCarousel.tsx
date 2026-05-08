"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/lib/types";

export function UnitImageCarousel({ images }: { images: ProjectImage[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track which slide is most visible
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(images.length - 1, idx));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl border border-repp-gray bg-repp-gray no-scrollbar"
      >
        {images.map((img) => (
          <div
            key={img.src}
            className="relative shrink-0 w-full snap-center aspect-[16/9]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={img === images[0]}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Arrow controls — desktop */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Vorige"
            onClick={() => scrollTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            className="hidden md:grid place-items-center absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md text-repp-navy disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Volgende"
            onClick={() => scrollTo(activeIdx + 1)}
            disabled={activeIdx === images.length - 1}
            className="hidden md:grid place-items-center absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md text-repp-navy disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur px-2.5 py-1.5 rounded-full">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Naar afbeelding ${idx + 1}`}
              onClick={() => scrollTo(idx)}
              className={`w-1.5 h-1.5 rounded-full transition ${
                idx === activeIdx
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums">
        {activeIdx + 1} / {images.length}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
