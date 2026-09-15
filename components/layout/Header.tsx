import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/site-config";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";
import { LoginNudge } from "./LoginNudge";
import { MobileMenu } from "./MobileMenu";
import { StatusBanner } from "./StatusBanner";

type NavItem = { href: string; label: string };

/** Hoofdnavigatie, gedeeld door desktop-nav en mobiel menu. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/xxl", label: "Unit 14" },
  { href: "/units", label: "Plattegrond" },
  { href: "/bereken", label: "Bereken" },
  { href: "/documenten", label: "Documenten" },
];

export function Header({
  project,
  loginNudge = true,
}: {
  project: Project;
  /** Strook "Maak account" onder de header. Uit op pagina's die daar zelf
      al een grote CTA hebben. */
  loginNudge?: boolean;
}) {
  return (
    <>
    <StatusBanner />
    <header
      // De sticky offset (onder de status-banner) staat in .site-header in
      // globals.css, inclusief de safe-area van iPhones met notch.
      className="site-header sticky z-30 w-full bg-repp-navy/95 backdrop-blur border-b border-repp-yellow/40"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
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

        {/* Desktop nav vanaf lg; daaronder het hamburger-menu. */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="inline-flex px-2.5 py-2 text-sm font-semibold text-white hover:text-repp-yellow transition"
            >
              {i.label}
            </Link>
          ))}
          <HeaderFavorites />
          <HeaderIdentity />
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="nav"
            className="ml-2 inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
        </nav>

        {/* Mobiel: primaire CTA + hamburger. */}
        <div className="flex lg:hidden items-center gap-1">
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="nav"
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-xs font-bold px-3 py-1.5 rounded-full hover:brightness-95 transition whitespace-nowrap"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
          <MobileMenu project={project} />
        </div>
      </div>
    </header>
    {loginNudge && <LoginNudge project={project} />}
    </>
  );
}
