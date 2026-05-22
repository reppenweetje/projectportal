import Image from "next/image";
import type { Project } from "@/lib/types";

export function Gallery({ project }: { project: Project }) {
  const images = [...project.gallery].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );

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
            Swipe of scroll door {images.length} impressies.
          </p>
        </div>
      </div>

      <div
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 md:px-[max(1.25rem,calc((100vw-64rem)/2))] pb-6"
        style={{ scrollbarWidth: "thin" }}
      >
        {images.map((img) => (
          <figure
            key={img.src}
            className="relative shrink-0 snap-start overflow-hidden rounded-2xl bg-repp-gray w-[80vw] sm:w-[55vw] md:w-[42vw] lg:w-[36vw] aspect-[4/3]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 55vw, 36vw"
              className="object-cover"
            />
            {img.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-repp-navy/80 via-repp-navy/40 to-transparent text-white text-xs md:text-sm font-medium px-4 py-3">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-repp-navy/40 text-center px-5">
        Impressies. Aan afbeeldingen kunnen geen rechten worden ontleend.
      </p>
    </section>
  );
}
