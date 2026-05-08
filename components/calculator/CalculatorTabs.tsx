"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { MaandlastCalculator } from "./MaandlastCalculator";
import { RendementCalculator } from "./RendementCalculator";

type Modus = "ondernemer" | "belegger";

export function CalculatorTabs({ project }: { project: Project }) {
  const params = useSearchParams();
  const router = useRouter();
  const initial: Modus =
    params.get("modus") === "belegger" ? "belegger" : "ondernemer";
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
        <div className="inline-flex bg-repp-gray/40 rounded-full p-1">
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
        </div>
      </div>

      <div className="mt-8 text-left">
        {modus === "ondernemer" ? (
          <MaandlastCalculator project={project} />
        ) : (
          <RendementCalculator project={project} />
        )}
      </div>
    </div>
  );
}
