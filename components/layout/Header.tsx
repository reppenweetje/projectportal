import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";
import { MobileMenu } from "./MobileMenu";

export function Header({ project }: { project: Project }) {
  const items = [
    { href: `/${project.slug}/units`, label: "Plattegrond" },
    { href: `/${project.slug}/bereken`, label: "Bereken" },
    { href: `/${project.slug}/documenten`, label: "Documenten" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-repp-navy/95 backdrop-blur border-b border-repp-yellow/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
        <Link
          href={`/${project.slug}`}
          aria-label={`${project.name}, REPP`}
          className="shrink-0"
        >
          <Image
            src="/images/logos/repp-bedrijfsmakelaar-wit.svg"
            alt="REPP Bedrijfsmakelaar"
            width={84}
            height={24}
            className="h-5 sm:h-6 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="inline-flex px-3 py-2 text-sm font-semibold text-white hover:text-repp-yellow transition"
            >
              {i.label}
            </Link>
          ))}
          <HeaderFavorites projectSlug={project.slug} />
          <HeaderIdentity projectSlug={project.slug} />
          <Link
            href={`/${project.slug}/reserveren`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
          >
            Reserveer
          </Link>
        </nav>

        {/* Mobile: yellow CTA + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            href={`/${project.slug}/reserveren`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-xs font-bold px-3 py-2 rounded-full hover:brightness-95 transition"
          >
            Reserveer
          </Link>
          <MobileMenu project={project} />
        </div>
      </div>
    </header>
  );
}
