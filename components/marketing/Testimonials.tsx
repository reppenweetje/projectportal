import Image from "next/image";
import type { Project, Testimonial } from "@/lib/types";

export function Testimonials({ project }: { project: Project }) {
  const items = project.testimonials;
  if (items.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-6 md:mb-10 px-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Wat kopers zeggen
          </p>
          <h2 className="mt-2 text-2xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            De eerste ondernemers van De Hofman.
          </h2>
        </div>

        {/* Mobile: horizontal-scroll-snap zodat quotes 1× zichtbaar zijn
            en je kunt swipen ipv eindeloos verticaal scrollen.
            Desktop: 3-koloms grid zoals voorheen. */}
        <div
          className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-3"
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((t) => (
            <div key={t.id} className="shrink-0 snap-start w-[85vw] sm:w-[60vw]">
              <TestimonialCard testimonial={t} compact />
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-5 px-5">
          {items.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  compact,
}: {
  testimonial: Testimonial;
  compact?: boolean;
}) {
  return (
    <figure
      className={`rounded-2xl border border-repp-gray bg-surface-muted flex flex-col h-full ${
        compact ? "p-4" : "p-5 md:p-6"
      }`}
    >
      <QuoteMark />
      <blockquote
        className={`mt-2 text-repp-navy/90 leading-snug flex-1 ${
          compact ? "text-sm line-clamp-6" : "text-[15px] leading-relaxed"
        }`}
      >
        {testimonial.quote}
      </blockquote>
      <figcaption
        className={`flex items-center gap-3 border-t border-repp-gray/70 ${
          compact ? "mt-3 pt-3" : "mt-5 pt-5"
        }`}
      >
        <Avatar testimonial={testimonial} />
        <div className="min-w-0">
          <p className="font-bold text-repp-navy text-sm">{testimonial.author}</p>
          <p className="text-xs text-repp-navy/60 truncate">
            {testimonial.company}
            {testimonial.unitContext && ` · ${testimonial.unitContext}`}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function QuoteMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-7 h-7 text-repp-navy"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.17 6C4.31 6 2 8.31 2 11.17v6.66h6.66v-6.66H4.83C4.83 8.6 6.05 7 7.17 6zm10 0c-2.86 0-5.17 2.31-5.17 5.17v6.66h6.66v-6.66h-3.83C14.83 8.6 16.05 7 17.17 6z" />
    </svg>
  );
}

function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.photoSrc) {
    return (
      <Image
        src={testimonial.photoSrc}
        alt={testimonial.author}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-repp-navy text-white grid place-items-center font-bold text-sm">
      {testimonial.initials}
    </div>
  );
}
