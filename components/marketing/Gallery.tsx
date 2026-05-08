import Image from "next/image";
import type { Project } from "@/lib/types";

export function Gallery({ project }: { project: Project }) {
  const images = [...project.gallery]
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 6);

  if (images.length === 0) return null;

  // Editorial mosaic — first image spans 2 cols on md+
  return (
    <section className="px-5 py-20 md:py-28 bg-surface-muted">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            In beeld
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Een blik op De Hofman
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.src}
              className={`relative overflow-hidden rounded-2xl bg-repp-gray ${
                idx === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover hover:scale-105 transition duration-700"
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-repp-navy/40 text-center">
          Impressies. Aan afbeeldingen kunnen geen rechten worden ontleend.
        </p>
      </div>
    </section>
  );
}
