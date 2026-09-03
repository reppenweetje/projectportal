"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
const DRAG_THRESHOLD_PX = 12;

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

  // Drag-to-scroll voor de strip. Touch laat de browser native scrollen
  // (momentum + swipe blijven werken); alleen muis hijacken we voor
  // klik-en-sleep. dragMoved onthoudt of er gesleept is, zodat een sleep
  // niet per ongeluk de lightbox opent.
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  function onPointerDown(e: React.PointerEvent) {
    // Touch laten we native scrollen — alleen de moved-vlag resetten zodat
    // een tap na een eerdere muis-sleep niet per ongeluk geblokkeerd wordt.
    if (e.pointerType !== "mouse") {
      drag.current.moved = false;
      return;
    }
    const el = stripRef.current;
    if (!el) return;
    drag.current = {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = stripRef.current;
    const s = drag.current;
    if (!el || !s.down) return;
    const dx = e.clientX - s.startX;
    // Drempel ruim genoeg dat een klik met wat hand-/trackpadbeweging nog
    // als klik telt; pas daarboven wordt het slepen.
    if (!s.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
      s.moved = true;
      // Pas bij echt slepen de pointer vangen. Doen we dit al bij pointerdown,
      // dan wordt ook het click-event naar de strip omgeleid en komt een
      // gewone klik nooit bij de image-knop aan: de lightbox opent dan niet.
      // Pointer capture houdt move/up-events bij dit element, ook als de
      // cursor snel buiten de strip beweegt. Scroll-snap zetten we uit
      // tijdens het slepen, anders snapt de browser steeds terug.
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
    }
    if (s.moved) el.scrollLeft = s.startScroll - dx;
  }
  function endDrag(e: React.PointerEvent) {
    const el = stripRef.current;
    if (el) {
      el.style.scrollSnapType = "";
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
    drag.current.down = false;
  }

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
            Tik op een impressie voor een grotere weergave en zoom daarin met
            klikken, scrollen of knijpen. Sleep, swipe of scroll door alle{" "}
            {images.length} beelden.
          </p>
        </div>
      </div>

      <div
        ref={stripRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 md:px-[max(1.25rem,calc((100vw-64rem)/2))] pb-6 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "thin" }}
      >
        {images.map((img, idx) => (
          <button
            type="button"
            key={img.src}
            onClick={() => {
              // Een sleep mag de lightbox niet openen.
              if (drag.current.moved) return;
              setOpenIndex(idx);
            }}
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
  // Zoomstand van de afbeelding. Zolang er is ingezoomd, bladert een veeg
  // niet door (die verschuift dan de afbeelding) en bladeren reset de zoom.
  const [zoomed, setZoomed] = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (zoomed) return;
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
        <ZoomableImage
          key={img.src}
          src={img.src}
          alt={img.alt}
          onZoomChange={setZoomed}
        />
        {img.caption && (
          <p className="absolute inset-x-0 -bottom-10 text-center text-sm text-white/85 font-medium px-4 pointer-events-none">
            {img.caption}{" "}
            <span className="text-white/50">
              ({index + 1}/{images.length})
            </span>
            <span className="hidden md:inline text-white/40">
              {" "}
              · {zoomed ? "Klik om uit te zoomen" : "Klik of scroll om in te zoomen"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Zoombare afbeelding in de lightbox ───────────────────────────────────
//
// Echt inzoomen op de impressie, niet alleen groot tonen:
//   - Klik/tap: zoomt in op het aangeklikte punt; nogmaals klikken zoomt uit.
//   - Scrollwiel/trackpad: traploos in- en uitzoomen rond de cursor.
//   - Slepen (muis of één vinger) verschuift de ingezoomde afbeelding.
//   - Knijpen met twee vingers zoomt op touch.
// Alles via pointer events op één element, zodat er geen click-retargeting
// speelt zoals eerder in de strip. Een klik herkennen we zelf op pointerup
// zonder noemenswaardige beweging.

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_CLICK = 2.2;

type PointerInfo = { x: number; y: number };

function ZoomableImage({
  src,
  alt,
  onZoomChange,
}: {
  src: string;
  alt: string;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(true);
  const pointers = useRef(new Map<number, PointerInfo>());
  const gesture = useRef({
    moved: false,
    lastX: 0,
    lastY: 0,
    pinchStartDist: 0,
    pinchStartScale: 1,
  });

  useEffect(() => {
    onZoomChange(view.scale > 1.01);
  }, [view.scale, onZoomChange]);

  // Houdt de afbeelding binnen het kader: bij scale 1 exact gecentreerd,
  // ingezoomd nooit verder verschoven dan de rand.
  const clamp = useCallback((scale: number, x: number, y: number) => {
    const el = boxRef.current;
    if (!el) return { scale, x, y };
    const w = el.clientWidth;
    const h = el.clientHeight;
    const minX = w - w * scale;
    const minY = h - h * scale;
    return {
      scale,
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }, []);

  // Zoomt naar `next` en houdt daarbij het punt (px, py) onder de cursor.
  const zoomAt = useCallback(
    (next: number, px: number, py: number, withAnimation: boolean) => {
      const scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      setAnimate(withAnimation);
      setView((v) => {
        const ratio = scale / v.scale;
        return clamp(scale, px - (px - v.x) * ratio, py - (py - v.y) * ratio);
      });
    },
    [clamp],
  );

  function localPoint(e: { clientX: number; clientY: number }) {
    const r = boxRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  }

  function onPointerDown(e: React.PointerEvent) {
    const el = boxRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.moved = false;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      g.pinchStartScale = view.scale;
      g.moved = true;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (pointers.current.size === 2) {
      // Knijpen: schaal t.o.v. startafstand, rond het midden van de vingers.
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchStartDist > 0) {
        const mid = localPoint({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
        zoomAt((dist / g.pinchStartDist) * g.pinchStartScale, mid.x, mid.y, false);
      }
      return;
    }

    const dx = e.clientX - g.lastX;
    const dy = e.clientY - g.lastY;
    if (Math.abs(e.clientX - g.lastX) > 3 || Math.abs(e.clientY - g.lastY) > 3) {
      g.moved = true;
    }
    if (view.scale > 1 && g.moved) {
      // Slepen: verschuiven, zonder animatie zodat het direct volgt.
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      setAnimate(false);
      setView((v) => clamp(v.scale, v.x + dx, v.y + dy));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const el = boxRef.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    const g = gesture.current;
    if (wasSingle && !g.moved) {
      // Klik/tap zonder beweging: in- of uitzoomen op dit punt.
      const p = localPoint(e);
      if (view.scale > 1.01) zoomAt(1, p.x, p.y, true);
      else zoomAt(ZOOM_CLICK, p.x, p.y, true);
      return;
    }
    if (pointers.current.size === 0) {
      // Na knijpen/slepen: (bijna) volledig uitgezoomd exact terug naar 1,
      // zodat de afbeelding weer strak gecentreerd staat.
      setView((v) => (v.scale <= 1.01 ? { scale: 1, x: 0, y: 0 } : v));
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
  }

  // Scrollwiel/trackpad: niet-passief registreren zodat preventDefault de
  // pagina onder de lightbox niet laat scrollen.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const r = el!.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0022);
      setAnimate(false);
      setView((v) => {
        const scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.scale * factor));
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        const ratio = scale / v.scale;
        return clamp(scale, px - (px - v.x) * ratio, py - (py - v.y) * ratio);
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clamp]);

  const zoomed = view.scale > 1.01;

  return (
    <div
      ref={boxRef}
      data-zoom-scale={view.scale.toFixed(2)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDragStart={(e) => e.preventDefault()}
      className={`absolute inset-0 overflow-hidden select-none ${
        zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
      }`}
      style={{ touchAction: "none" }}
      aria-label={zoomed ? "Ingezoomd; klik om uit te zoomen" : "Klik om in te zoomen"}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transition: animate ? "transform 220ms ease-out" : "none",
          willChange: "transform",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          // Ruim genoeg voor inzoomen: Next levert dan het bronbestand
          // (2200 px) i.p.v. een schermbreed verkleinde variant.
          sizes="2200px"
          quality={85}
          className="object-contain pointer-events-none"
          priority
          draggable={false}
        />
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
