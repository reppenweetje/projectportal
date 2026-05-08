"use client";

import Link from "next/link";
import { useFavorites, useHasMounted } from "@/lib/favorites";
import type { Project } from "@/lib/types";
import { formatEuro, formatM2 } from "@/lib/types";

export function FavoritesPanel({ project }: { project: Project }) {
  const ids = useFavorites();
  const mounted = useHasMounted();
  const units = project.units.filter((u) => ids.includes(u.slug));

  if (!mounted) {
    return null;
  }

  if (units.length === 0) {
    return (
      <div className="rounded-2xl border border-repp-gray bg-white p-8 text-center">
        <p className="text-4xl">🤍</p>
        <h2 className="mt-4 text-2xl font-extrabold text-repp-navy tracking-tight">
          Nog geen favorieten
        </h2>
        <p className="mt-2 text-sm text-repp-navy/70 max-w-sm mx-auto">
          Tik op het hartje bij een unit om hem hier te bewaren; handig om
          later te vergelijken of erop terug te komen.
        </p>
        <Link
          href={`/${project.slug}/units`}
          className="mt-6 inline-flex items-center bg-repp-navy text-white font-semibold px-5 py-3 rounded-full hover:bg-repp-blue transition"
        >
          Bekijk alle units →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-repp-navy/70">
        {units.length} {units.length === 1 ? "unit" : "units"} bewaard. Klik om
        te bekijken of te reserveren.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {units.map((u) => (
          <li key={u.slug}>
            <Link
              href={`/${project.slug}/units/${u.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-repp-gray bg-white p-5 hover:border-repp-navy hover:shadow-md transition"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold">
                  Unit {u.number}
                </p>
                <p className="text-3xl font-extrabold text-repp-navy leading-none mt-1">
                  {u.type}
                </p>
                <p className="text-xs text-repp-navy/60 mt-1.5">
                  {formatM2(u.m2BVO)} · {formatEuro(u.prijsExBtw)} excl. btw
                </p>
              </div>
              <span className="text-sm font-semibold text-repp-blue inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Bekijk →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
