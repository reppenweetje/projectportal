import type { Project, Testimonial } from "@/lib/types";

export function Testimonials({ project }: { project: Project }) {
  const items = project.testimonials;
  if (items.length === 0) return null;

  return (
    <section className="px-5 py-20 md:py-24 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Wat kopers zeggen
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            De eerste ondernemers van De Hofman.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="rounded-2xl border border-repp-gray bg-surface-muted p-6 md:p-7 flex flex-col">
      <QuoteMark />
      <blockquote className="mt-3 text-repp-navy/90 text-[15px] leading-relaxed flex-1">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-5 pt-5 border-t border-repp-gray/70 flex items-center gap-3">
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
  // Subtiel typografisch aanhalingsteken in plaats van het opvallende gele icoon.
  return (
    <span
      aria-hidden
      className="block font-serif text-5xl leading-none text-repp-navy/15 select-none"
    >
      &ldquo;
    </span>
  );
}

function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.photoSrc) {
    return (
      <img
        src={testimonial.photoSrc}
        alt={testimonial.author}
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
