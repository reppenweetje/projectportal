import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";
import { LoginNudge } from "./LoginNudge";
import { MobileMenu } from "./MobileMenu";

export function Header({ project }: { project: Project }) {
  const items = [
    { href: `/${project.slug}/units`, label: "Plattegrond" },
    { href: `/${project.slug}/bereken`, label: "Bereken" },
    { href: `/${project.slug}/documenten`, label: "Documenten" },
  ];

  return (
    <>
    <header
      // Padding-top met safe-area zodat de header op iPhones met notch /
      // dynamic island niet onder de status-bar verdwijnt. viewportFit:
      // cover in layout.tsx laat content tot in de safe-area zone lopen.
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className="sticky top-0 z-30 w-full bg-repp-navy/95 backdrop-blur border-b border-repp-yellow/40"
    >
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
          <Link
            href={`/${project.slug}/documenten/brochure`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white hover:text-repp-yellow transition"
            title="Download de brochure"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Brochure
          </Link>
          <HeaderFavorites projectSlug={project.slug} />
          <HeaderIdentity projectSlug={project.slug} />
          <Link
            href={`/${project.slug}/reserveren`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
          >
            Reserveer
          </Link>
        </nav>

        {/* Mobile: yellow CTA + hamburger. Reserveer kleiner zodat 'ie
            niet visueel concurreert met andere yellow-CTAs (zoals Bekijk
            in ScarcityStrip eronder). */}
        <div className="flex md:hidden items-center gap-1.5">
          <Link
            href={`/${project.slug}/reserveren`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-[11px] font-bold px-2.5 py-1.5 rounded-full hover:brightness-95 transition"
          >
            Reserveer
          </Link>
          <MobileMenu project={project} />
        </div>
      </div>
    </header>
    {/* LoginNudge buiten sticky header zodat 'ie wegscrollt met content
        ipv permanent ruimte te pakken op mobile. Rendert alleen voor
        uitgelogde bezoekers (interne useLeadProfile check). */}
    <LoginNudge />
    </>
  );
}
