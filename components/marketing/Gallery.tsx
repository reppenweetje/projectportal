"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Project } from "@/lib/types";

/**
 * Gallery — sfeer-carrousel met click-to-expand lightbox.
 *
 * Werkt op:
 *   - Desktop: klik image → opent fullscreen lightbox. Pijltjes-toetsen
 *     of klik-arrows voor navigatie. ESC sluit.
 *   - Mobile: tap image → fullscreen overlay. Swipe links/rechts om door
 *     andere images te bladeren. Tap backdrop / X-knop sluit.
 *
 * Single source van images = project.gallery, gesorteerd op weight.
 */
export function Gallery({ project }: { project: Project }) {
  const images = [...project.gallery].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const onPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const onNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  const onClose = useCallback(() => setOpenIndex(null), []);

  // Keyboard navigation
  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    }
    document.addEventListener("keydown", onKey);
    // Lock body scroll
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [openIndex, onClose, onNext, onPrev]);

  if (images.length === 0) return null;

  return (
    <section className="pt-2 pb-16 md:pt-4 md:pb-24 bg-surface-muted">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            In beeld
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Een blik op De Hofman
          </h2>
          <p className="mt-3 text-sm text-repp-navy/60">
            Tik op een impressie voor een grotere weergave. Swipe of scroll
            door alle {images.length} beelden.
          </p>
        </div>
      </div>

      <div
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 md:px-[max(1.25rem,calc((100vw-64rem)/2))] pb-6"
        style={{ scrollbarWidth: "thin" }}
      >
        {images.map((img, idx) => (
          <button
            type="button"
            key={img.src}
            onClick={() => setOpenIndex(idx)}
            aria-label={`Vergroot impressie: ${img.alt}`}
            className="group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-repp-gray w-[80vw] sm:w-[55vw] md:w-[42vw] lg:w-[36vw] aspect-[4/3] cursor-zoom-in focus:outline-none focus:ring-4 focus:ring-repp-blue/40 hover:brightness-110 transition"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 55vw, 36vw"
              className="object-cover transition group-hover:scale-[1.02]"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-repp-navy/80 via-repp-navy/40 to-transparent text-white text-xs md:text-sm font-medium px-4 py-3 text-left pointer-events-none">
                {img.caption}
              </span>
            )}
            {/* Subtle zoom-cue rechtsboven */}
            <span
              aria-hidden
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur text-repp-navy grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-md"
            >
              <ExpandIcon />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-repp-navy/40 text-center px-5">
        Impressies. Aan afbeeldingen kunnen geen rechten worden ontleend.
      </p>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </section>
  );
}

// ─── Lightbox component ───────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: Project["gallery"];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];
  // Touch swipe state — vanggrip op horizontale veeg ≥ 50px om door
  // images te bladeren. Verticale gestures laten we erdoor (browser
  // scroll-back, pull-to-refresh blijft werken).
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null || touchStartY === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    setTouchStartX(null);
    setTouchStartY(null);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) onPrev();
      else onNext();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Impressie ${index + 1} van ${images.length}: ${img.alt}`}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button — top-right, met safe-area inset voor notch */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Sluit"
        className="absolute z-[81] w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white grid place-items-center transition"
        style={{
          top: "calc(1rem + env(safe-area-inset-top, 0px))",
          right: "calc(1rem + env(safe-area-inset-right, 0px))",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      {/* Prev button — desktop alleen, mobiel = swipe */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Vorige impressie"
        className="hidden md:grid absolute left-6 top-1/2 -translate-y-1/2 z-[81] w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white place-items-center transition"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Volgende impressie"
        className="hidden md:grid absolute right-6 top-1/2 -translate-y-1/2 z-[81] w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white place-items-center transition"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* The image itself — click op image zelf moet niet doorbubblen
          naar de backdrop-close. */}
      <div
        className="relative w-full h-full max-w-6xl max-h-[88vh] mx-4 my-12 md:my-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
        {img.caption && (
          <p className="absolute inset-x-0 -bottom-10 text-center text-sm text-white/85 font-medium px-4">
            {img.caption}{" "}
            <span className="text-white/50">
              ({index + 1}/{images.length})
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
