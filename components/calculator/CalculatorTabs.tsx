"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { MaandlastCalculator } from "./MaandlastCalculator";
import { RendementCalculator } from "./RendementCalculator";
import { KoopVsHuurCalculator } from "./KoopVsHuurCalculator";
import type { CalculatorUnitType } from "./UnitTypePicker";

type Modus = "ondernemer" | "belegger" | "huren";

export function CalculatorTabs({ project }: { project: Project }) {
  const params = useSearchParams();
  const router = useRouter();
  const modusParam = params.get("modus");
  const initial: Modus =
    modusParam === "belegger"
      ? "belegger"
      : modusParam === "huren"
        ? "huren"
        : "ondernemer";
  // ?unit=unit-14 (bv. vanaf de homepage) selecteert het bijbehorende
  // unit-type voor in de calculators.
  const unitParam = params.get("unit");
  const initialType: CalculatorUnitType | undefined = unitParam
    ? project.units.find((u) => u.slug === unitParam)?.type
    : undefined;
  const [modus, setModus] = useState<Modus>(initial);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("modus", modus);
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
      scroll: false,
    });
  }, [modus, router]);

  return (
    <div className="flex flex-col items-stretch w-full">
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 bg-repp-gray/40 rounded-full p-1">
          <button
            type="button"
            onClick={() => setModus("ondernemer")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              modus === "ondernemer"
                ? "bg-white text-repp-navy shadow"
                : "text-repp-navy/60 hover:text-repp-navy"
            }`}
          >
            Voor mijn bedrijf
          </button>
          <button
            type="button"
            onClick={() => setModus("belegger")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              modus === "belegger"
                ? "bg-white text-repp-navy shadow"
                : "text-repp-navy/60 hover:text-repp-navy"
            }`}
          >
            Als belegging
          </button>
          <button
            type="button"
            onClick={() => setModus("huren")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              modus === "huren"
                ? "bg-white text-repp-navy shadow"
                : "text-repp-navy/60 hover:text-repp-navy"
            }`}
          >
            Kopen of huren
          </button>
        </div>
      </div>

      <div className="mt-8 text-left">
        {modus === "ondernemer" ? (
          <MaandlastCalculator project={project} initialType={initialType} />
        ) : modus === "belegger" ? (
          <RendementCalculator project={project} initialType={initialType} />
        ) : (
          <KoopVsHuurCalculator project={project} />
        )}
      </div>
    </div>
  );
}
