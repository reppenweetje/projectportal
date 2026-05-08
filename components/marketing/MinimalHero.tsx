import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";

export function MinimalHero({ project }: { project: Project }) {
  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[560px] max-h-[820px] w-full overflow-hidden">
        <Image
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/0 to-black/80" />

        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1" />
          <div className="px-5 pb-14 md:pb-20">
            <div className="mx-auto max-w-5xl">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                {project.city} · Waarderpolder
              </p>
              <h1 className="mt-3 text-7xl md:text-9xl font-extrabold text-white leading-[0.9] tracking-tight">
                {project.name}
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-white/85 font-light max-w-xl">
                {project.tagline}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={`/${project.slug}/bereken?modus=ondernemer`}
                  className="inline-flex items-center bg-repp-yellow text-repp-navy text-base font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
                >
                  Voor mijn bedrijf →
                </Link>
                <Link
                  href={`/${project.slug}/bereken?modus=belegger`}
                  className="inline-flex items-center bg-white/10 backdrop-blur border border-white/40 text-white text-base font-bold px-6 py-3.5 rounded-full hover:bg-white/20 transition"
                >
                  Als belegging →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
