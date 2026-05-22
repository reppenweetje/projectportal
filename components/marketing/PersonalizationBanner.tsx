"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeadProfile } from "@/lib/personalization";
import { countByStatus } from "@/lib/projects/de-hofman";
import type { Project } from "@/lib/types";

export function PersonalizationBanner({ project }: { project: Project }) {
  const profile = useLeadProfile();
  const [dismissed, setDismissed] = useState(false);

  if (!profile?.name || dismissed) return null;

  // Live unit-count zodat de banner-copy ("nog X units beschikbaar")
  // matched met de situatieplattegrond. Available + in_optie tellen
  // we beide als "beschikbaar" want in_optie is nog reserveerbaar.
  const counts = countByStatus(project);
  const stillAvailable = counts.available + counts.in_optie;

  if (profile.verified) {
    return (
      <VerifiedBanner
        project={project}
        profile={profile}
        stillAvailable={stillAvailable}
        onClose={() => setDismissed(true)}
      />
    );
  }

  return (
    <NeedsVerifyBanner
      project={project}
      profile={profile}
      onClose={() => setDismissed(true)}
    />
  );
}

function VerifiedBanner({
  project,
  profile,
  stillAvailable,
  onClose,
}: {
  project: Project;
  profile: NonNullable<ReturnType<typeof useLeadProfile>>;
  stillAvailable: number;
  onClose: () => void;
}) {
  // Banner-copy aanpassen op live unit-availability:
  //   - 0 beschikbaar  → "alle units zijn vergeven" (extreme urgency)
  //   - 1 beschikbaar  → "nog 1 unit beschikbaar"
  //   - 2-5            → "Er zijn nog X units beschikbaar"  (acute scarcity)
  //   - 6+             → "De verkoop is open."             (geen urgency yet)
  const availabilityCopy =
    stillAvailable === 0
      ? "alle units zijn voorlopig vergeven."
      : stillAvailable === 1
        ? "nog 1 unit beschikbaar."
        : stillAvailable <= 5
          ? `er zijn nog ${stillAvailable} units beschikbaar.`
          : "de verkoop is open.";

  // CTA leidt naar de plattegrond — leads willen vrijwel altijd eerst
  // zien welke units nog beschikbaar zijn voordat ze verder kwalificeren.
  // Modus-routing naar /bereken voelde te smal; /units geeft het complete
  // beeld inclusief prijzen + status per unit.
  const ctaLink = `/${project.slug}/units`;

  return (
    <div className="bg-repp-yellow text-repp-navy">
      <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:grid w-8 h-8 rounded-full bg-repp-navy text-white place-items-center text-xs font-extrabold shrink-0">
            {initials(profile.name ?? "")}
          </div>
          <p className="text-sm leading-snug">
            <span className="font-bold">Welkom {profile.name},</span>{" "}
            <span>{availabilityCopy}</span>
            <Link
              href={ctaLink}
              className="ml-2 underline underline-offset-2 font-semibold hover:no-underline"
            >
              Bekijk beschikbaarheid →
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Verberg dit bericht"
          className="shrink-0 text-repp-navy/60 hover:text-repp-navy text-xl w-7 h-7 grid place-items-center"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function NeedsVerifyBanner({
  project,
  profile,
  onClose,
}: {
  project: Project;
  profile: NonNullable<ReturnType<typeof useLeadProfile>>;
  onClose: () => void;
}) {
  return (
    <div className="bg-repp-blue text-white">
      <div className="mx-auto max-w-6xl px-5 py-2.5 flex items-center justify-between gap-3 text-sm">
        <p className="leading-snug min-w-0">
          <span className="font-bold">Hoi {profile.name}!</span>{" "}
          <span className="hidden sm:inline text-white/85">
            Even checken of je gegevens nog kloppen, dan houden we het kort
            zometeen.
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/${project.slug}/welkom`}
            className="bg-repp-yellow text-repp-navy text-xs font-bold px-3 py-1.5 rounded-full hover:brightness-95 transition whitespace-nowrap"
          >
            Controleer →
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Verberg dit bericht"
            className="text-white/60 hover:text-white text-xl w-7 h-7 grid place-items-center"
          >
            ×
          </button>
        </div>
      </div>
    </div>
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
