"use client";

import Link from "next/link";
import { useFavoriteCount } from "@/lib/favorites";

export function HeaderFavorites({ projectSlug }: { projectSlug: string }) {
  const count = useFavoriteCount();
  if (count === 0) return null;

  return (
    <Link
      href={`/${projectSlug}/favorieten`}
      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full hover:bg-white/10 transition text-white"
      aria-label={`${count} favorieten`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-rose-500"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-xs font-bold tabular-nums">{count}</span>
    </Link>
  );
}
