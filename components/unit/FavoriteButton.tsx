"use client";

import { useFavorite } from "@/lib/favorites";

export function FavoriteButton({
  unitSlug,
  size = "md",
  variant = "solid",
  onToggleLabel,
}: {
  unitSlug: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost" | "overlay";
  /** When true, show "Favoriet" / "Bewaard" label next to icon */
  onToggleLabel?: boolean;
}) {
  const { isFavorite, toggle } = useFavorite(unitSlug);

  const sizing =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  const variantCls =
    variant === "overlay"
      ? "bg-white/90 backdrop-blur shadow-md hover:bg-white"
      : variant === "ghost"
        ? "bg-transparent hover:bg-repp-gray/40"
        : "bg-white border border-repp-gray hover:border-repp-navy";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      className={`group inline-flex items-center justify-center gap-2 rounded-full ${sizing} ${variantCls} transition`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${iconSize} transition ${
          isFavorite ? "text-rose-500 fill-rose-500" : "text-repp-navy/60 fill-none"
        }`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {onToggleLabel && (
        <span className="text-sm font-semibold text-repp-navy pr-2">
          {isFavorite ? "Bewaard" : "Bewaar"}
        </span>
      )}
    </button>
  );
}
