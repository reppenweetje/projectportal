import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  PRIMARY_CTA_LABEL_SHORT,
} from "@/lib/site-config";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";
import { LoginNudge } from "./LoginNudge";
import { MobileMenu } from "./MobileMenu";
import { StatusBanner } from "./StatusBanner";

type NavItem = {
  href: string;
  label: string;
  /** Geel in plaats van wit: één item mag eruit springen. */
  accent?: boolean;
};

/** Hoofdnavigatie, gedeeld door desktop-nav en mobiel menu. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/xxl", label: "Laatste unit", accent: true },
  { href: "/units", label: "Plattegrond" },
  { href: "/bereken", label: "Bereken" },
  { href: "/koopvshuur", label: "Kopen of huren" },
  { href: "/documenten", label: "Documenten" },
];

export function Header({
  project,
  loginNudge = false,
}: {
  project: Project;
  /** Strook "Maak account" onder de header. Standaard uit: boven de pagina
      hoort maar één balk te staan (de sitebrede status-banner), en de
      inlog/account-ingang staat al in de footer. */
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
          className="min-w-0"
        >
          <Image
            src="/images/logos/repp-bedrijfsmakelaar-wit.svg"
            alt="REPP Bedrijfsmakelaar"
            width={84}
            height={24}
            // Kleiner op smalle telefoons: met de volle breedte duwde het
            // logo de CTA en het hamburger-menu van het scherm op 375 px.
            className="h-4 sm:h-5 md:h-6 w-auto max-w-full object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop nav vanaf xl: met vijf menu-items plus de gele knop past
            de balk onder 1280 px niet meer op één regel, dus daaronder het
            hamburger-menu (dat dezelfde items toont). */}
        <nav className="hidden xl:flex items-center gap-0.5">
          {NAV_ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`inline-flex whitespace-nowrap px-2.5 py-2 text-sm font-semibold transition ${
                i.accent
                  ? "text-repp-yellow font-bold hover:brightness-110"
                  : "text-white hover:text-repp-yellow"
              }`}
            >
              {i.label}
            </Link>
          ))}
          <HeaderFavorites />
          <HeaderIdentity />
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="nav"
            className="ml-2 inline-flex items-center h-9 whitespace-nowrap bg-repp-yellow text-repp-navy text-[13px] font-bold px-4 rounded-full hover:brightness-95 transition"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
        </nav>

        {/* Mobiel: primaire CTA + hamburger. Kort label, anders duwt de
            knop het hamburger-menu van het scherm op een iPhone SE. */}
        <div className="flex xl:hidden items-center gap-1">
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="nav"
            className="inline-flex items-center h-8 bg-repp-yellow text-repp-navy text-[11px] font-bold px-3 rounded-full hover:brightness-95 transition whitespace-nowrap"
          >
            {PRIMARY_CTA_LABEL_SHORT}
          </Link>
          <MobileMenu project={project} />
        </div>
      </div>
    </header>
    {loginNudge && <LoginNudge project={project} />}
    </>
  );
}
