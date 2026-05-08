import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";

export function Header({ project }: { project: Project }) {
  const items = [
    { href: `/${project.slug}/units`, label: "Plattegrond" },
    { href: `/${project.slug}/bereken`, label: "Bereken" },
    { href: `/${project.slug}/documenten`, label: "Documenten" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-repp-gray/60">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
        <Link
          href={`/${project.slug}`}
          aria-label={`${project.name}, REPP`}
          className="shrink-0"
        >
          <Image
            src="/images/logos/repp-bedrijfsmakelaar.svg"
            alt="REPP Bedrijfsmakelaar"
            width={84}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="hidden md:inline-flex px-3 py-2 text-sm font-semibold text-repp-navy hover:text-repp-blue transition"
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
      </div>
    </header>
  );
}
