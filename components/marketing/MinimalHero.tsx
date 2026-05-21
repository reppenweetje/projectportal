import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";

export function MinimalHero({ project }: { project: Project }) {
  return (
    <section className="relative">
      <div className="relative h-[68vh] min-h-[480px] max-h-[760px] w-full overflow-hidden">
        <Image
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle gradient: lichte top, zware bottom zodat title leesbaar
            blijft op het donkere onderste deel van het hero-blok. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1" />
          <div className="px-5 pb-8 sm:pb-14 md:pb-20">
            <div className="mx-auto max-w-5xl">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                {project.city} · Waarderpolder
              </p>
              <h1 className="mt-2 text-5xl sm:text-7xl md:text-9xl font-extrabold text-white leading-[0.95] tracking-tight">
                {project.name}
              </h1>
              <p className="mt-2 sm:mt-4 text-base sm:text-xl md:text-2xl text-white/85 font-light max-w-xl">
                {project.tagline}
              </p>

              <div className="mt-5 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
                <Link
                  href={`/${project.slug}/bereken?modus=ondernemer`}
                  className="inline-flex items-center justify-center bg-repp-yellow text-repp-navy text-sm sm:text-base font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-full hover:brightness-95 transition"
                >
                  Voor mijn bedrijf →
                </Link>
                <Link
                  href={`/${project.slug}/bereken?modus=belegger`}
                  className="inline-flex items-center justify-center bg-white/10 backdrop-blur border border-white/40 text-white text-sm sm:text-base font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-full hover:bg-white/20 transition"
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
