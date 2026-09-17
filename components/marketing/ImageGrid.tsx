"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/lib/types";
import { Lightbox } from "./Gallery";

/**
 * Raster met alle impressies, voor de beeldpagina. Klik op een beeld opent
 * dezelfde lightbox als de carrousel op de projectpagina: pijltjes, swipen,
 * zoomen en ESC om te sluiten.
 *
 * Bewust een raster en geen carrousel: op een pagina die alleen over beeld
 * gaat wil je alles in één oogopslag kunnen overzien.
 */
export function ImageGrid({ images }: { images: ProjectImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const onPrev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const onNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  const onClose = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [openIndex, onClose, onNext, onPrev]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {images.map((img, idx) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setOpenIndex(idx)}
              aria-label={`Vergroot impressie: ${img.alt}`}
              className="group relative block w-full overflow-hidden rounded-2xl bg-repp-gray aspect-[4/3] cursor-zoom-in focus:outline-none focus:ring-4 focus:ring-repp-blue/40"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition group-hover:scale-[1.03]"
              />
              {img.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-repp-navy/85 via-repp-navy/40 to-transparent text-white text-xs md:text-sm font-medium px-4 py-3 text-left pointer-events-none">
                  {img.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </>
  );
}
