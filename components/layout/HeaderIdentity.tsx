"use client";

import Link from "next/link";
import { useLeadProfile } from "@/lib/personalization";

export function HeaderIdentity({ projectSlug }: { projectSlug: string }) {
  const profile = useLeadProfile();
  if (!profile?.verified || !profile.name) return null;

  return (
    <Link
      href={`/${projectSlug}/welkom`}
      aria-label={`Ingelogd als ${profile.name}`}
      title={`Ingelogd als ${profile.name}`}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-repp-navy font-bold text-xs hover:brightness-90 transition"
    >
      {initials(profile.name)}
    </Link>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
