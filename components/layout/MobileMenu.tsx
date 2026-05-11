"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Project } from "@/lib/types";
import { useFavoriteCount } from "@/lib/favorites";
import { useLeadProfile } from "@/lib/personalization";

type Item = {
  href: string;
  label: string;
  description?: string;
};

export function MobileMenu({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const favoritesCount = useFavoriteCount();
  const profile = useLeadProfile();

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + ESC handler
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const primaryItems: Item[] = [
    {
      href: `/${project.slug}/units`,
      label: "Plattegrond",
      description: "Alle units en hun status",
    },
    {
      href: `/${project.slug}/bereken`,
      label: "Bereken",
      description: "Maandlast of rendement",
    },
    {
      href: `/${project.slug}/documenten`,
      label: "Alle documenten",
      description: "Brochure, prijslijst en meer",
    },
    {
      href: `/${project.slug}/prijs`,
      label: "Prijsvergelijker",
      description: "Vergelijk met de buurt",
    },
  ];

  const secondaryItems: Item[] = [
    {
      href: `/${project.slug}/xxl`,
      label: "XXL-wachtlijst",
    },
    {
      href: `/${project.slug}/insider`,
      label: "Hofman Insider",
    },
  ];

  if (favoritesCount > 0) {
    secondaryItems.unshift({
      href: `/${project.slug}/favorieten`,
      label: `Favorieten (${favoritesCount})`,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-repp-navy hover:bg-repp-gray/40 transition"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Sluit menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm cursor-default animate-[fadeIn_.15s_ease-out]"
          />

          {/* Side panel — gebruikt h-[100dvh] voor iOS Safari */}
          <div
            className="fixed top-0 right-0 w-[88vw] max-w-sm bg-white shadow-2xl flex flex-col animate-[slideInRight_.22s_ease-out]"
            style={{ height: "100dvh" }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-repp-gray">
              <p className="font-bold text-repp-navy">{project.name}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluit menu"
                className="text-repp-navy/60 hover:text-repp-navy text-2xl w-10 h-10 grid place-items-center -mr-2"
              >
                ×
              </button>
            </div>

            {/* Scrollable nav body */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3">
              <p className="px-5 pb-2 text-[11px] uppercase tracking-wider text-repp-navy/40 font-semibold">
                Bekijk
              </p>
              <ul>
                {primaryItems.map((item) => (
                  <MenuItem key={item.href} item={item} />
                ))}
              </ul>

              <p className="px-5 pt-5 pb-2 text-[11px] uppercase tracking-wider text-repp-navy/40 font-semibold">
                Meer
              </p>
              <ul>
                {secondaryItems.map((item) => (
                  <MenuItem key={item.href} item={item} small />
                ))}
              </ul>

              {profile?.name && (
                <div className="px-5 pt-5 pb-2">
                  <Link
                    href={`/${project.slug}/welkom`}
                    className="block rounded-xl bg-surface-muted border border-repp-gray p-4"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-repp-navy/50 font-semibold">
                      Ingelogd als
                    </p>
                    <p className="mt-0.5 font-bold text-repp-navy">
                      {profile.name}
                    </p>
                    <p className="mt-1 text-xs text-repp-blue font-semibold">
                      Bekijk gegevens →
                    </p>
                  </Link>
                </div>
              )}
            </div>

            {/* Sticky bottom CTAs */}
            <div className="shrink-0 border-t border-repp-gray p-4 space-y-2 bg-white">
              <Link
                href={`/${project.slug}/reserveren`}
                className="block w-full bg-repp-yellow text-repp-navy text-center font-bold px-5 py-3.5 rounded-full hover:brightness-95 transition"
              >
                Reserveer (vrijblijvend)
              </Link>
              <a
                href={`tel:${project.makelaar.phone}`}
                className="block w-full bg-white text-repp-navy text-center text-sm font-semibold px-5 py-3 rounded-full border border-repp-gray hover:border-repp-navy"
              >
                Bel {project.makelaar.phone}
              </a>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideInRight {
              from { transform: translateX(100%) }
              to { transform: translateX(0) }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function MenuItem({
  item,
  small = false,
}: {
  item: Item;
  small?: boolean;
}) {
  return (
    <li>
      <Link
        href={item.href}
        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-muted transition"
      >
        <div className="min-w-0">
          <p
            className={`font-semibold text-repp-navy ${small ? "text-sm" : "text-base"}`}
          >
            {item.label}
          </p>
          {item.description && (
            <p className="text-xs text-repp-navy/60 mt-0.5">
              {item.description}
            </p>
          )}
        </div>
        <span className="text-repp-navy/30 text-lg">→</span>
      </Link>
    </li>
  );
}
