import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { HeaderFavorites } from "./HeaderFavorites";
import { HeaderIdentity } from "./HeaderIdentity";
import { LoginNudge } from "./LoginNudge";
import { MobileMenu } from "./MobileMenu";

type NavChild = { href: string; label: string; description?: string };
type NavItem = { href: string; label: string; children?: NavChild[] };

export function Header({ project }: { project: Project }) {
  const items: NavItem[] = [
    { href: `/${project.slug}/units`, label: "Plattegrond" },
    { href: `/${project.slug}/xxl`, label: "XXL-units" },
    {
      href: `/${project.slug}/bereken`,
      label: "Bereken",
      children: [
        {
          href: `/${project.slug}/bereken`,
          label: "Rendement",
          description: "Maandlast & rendement",
        },
        {
          href: `/${project.slug}/koopvshuur`,
          label: "Koop vs huur",
          description: "Wat levert kopen op?",
        },
      ],
    },
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

        {/* Desktop nav — pas vanaf lg: met alle items + brochure + CTA is de
            nav ~610px en overflowt hij tussen 768 en 1023px (123px op 800px).
            Daaronder toont het hamburger-menu, dat alles al bevat. */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {items.map((i) =>
            i.children ? (
              <div key={i.href} className="relative group">
                <Link
                  href={i.href}
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-sm font-semibold text-white hover:text-repp-yellow transition"
                >
                  {i.label}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Link>
                {/* CSS-only dropdown: zichtbaar bij hover of toetsenbord-focus.
                    De pt-2 zit binnen .group zodat de muis van trigger naar menu
                    kan zonder de hover te verliezen. */}
                <div className="absolute left-0 top-full z-40 hidden pt-2 group-hover:block group-focus-within:block">
                  <div className="min-w-[14rem] overflow-hidden rounded-xl border border-repp-gray bg-white shadow-xl">
                    {i.children.map((c) => (
                      <Link
                        key={c.href + c.label}
                        href={c.href}
                        className="block px-4 py-2.5 hover:bg-surface-muted transition"
                      >
                        <span className="block text-sm font-semibold text-repp-navy">
                          {c.label}
                        </span>
                        {c.description && (
                          <span className="block text-xs text-repp-navy/55">
                            {c.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // XXL-units krijgt standaard de gele accent-kleur zodat het
              // opvalt in de nav (het is het premium-aanbod van het project).
              <Link
                key={i.href}
                href={i.href}
                className={`inline-flex px-2.5 py-2 text-sm font-semibold transition ${
                  i.href.endsWith("/xxl")
                    ? "text-repp-yellow hover:brightness-110"
                    : "text-white hover:text-repp-yellow"
                }`}
              >
                {i.label}
              </Link>
            ),
          )}
          <Link
            href={`/${project.slug}/documenten/brochure`}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-sm font-semibold text-white hover:text-repp-yellow transition"
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
            // ml-2 = expliciete ademruimte tussen het identity-avatar-bolletje
            // en de gele CTA. Zonder marge plakte het visueel direct tegen de F
            // aan terwijl de nav verder gap-0.5 hanteert (zie comment hierboven).
            className="ml-2 inline-flex items-center bg-repp-yellow text-repp-navy text-sm font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
          >
            Reserveer een unit
          </Link>
        </nav>

        {/* Mobile: gele CTA + hamburger. Op mobile sturen we naar de
            documenten-overzichtspagina (niet direct de brochure-viewer):
            de bezoeker kiest daar zelf de Brochure-kaart en krijgt dan pas
            de lead-gate. Korte label "Brochure" zodat de hamburger niet
            off-screen valt op iPhone SE-formaat (375px). Desktop houdt de
            "Reserveer een unit"-CTA. */}
        <div className="flex lg:hidden items-center gap-1">
          <Link
            href={`/${project.slug}/documenten`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy text-xs font-bold px-3 py-1.5 rounded-full hover:brightness-95 transition whitespace-nowrap"
          >
            Brochure
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
