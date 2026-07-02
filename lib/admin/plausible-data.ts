// Server-side Plausible Stats API (v2) client voor het admin-dashboard.
//
// Leest bezoekers + verkeersbron uit Plausible.io met een API-key
// (PLAUSIBLE_API_KEY, server-only). De site-id staat niet in de frontend-
// code, dus die is instelbaar via PLAUSIBLE_SITE_ID (default dehofman.nl).
//
// Faalt zacht: ontbreekt de key of klopt de site-id niet, dan connected:false
// en toont de UI eerlijk "—" i.p.v. verzonnen bezoekersaantallen.

import type { TimeRange } from "@/lib/admin/leads-data";

const API = "https://plausible.io/api/v2/query";

export type PlausibleData = {
  /** True zodra de Stats API succesvol data teruggaf. */
  connected: boolean;
  /** Of er überhaupt een API-key is ingesteld (voor foutmelding-nuance). */
  keyPresent: boolean;
  /** Welke site-id we bevraagd hebben (voor diagnose bij mismatch). */
  siteId: string;
  visitors: number | null;
  sources: { label: string; visitors: number }[];
};

function siteId(): string {
  return process.env.PLAUSIBLE_SITE_ID?.trim() || "dehofman.nl";
}

function dateRange(range: TimeRange): string {
  switch (range) {
    case "today":
      return "day";
    case "week":
      return "7d";
    case "month":
      return "30d";
    case "all":
      return "12mo";
  }
}

type QueryResult = { results?: { metrics?: number[]; dimensions?: string[] }[] };

async function query(body: Record<string, unknown>): Promise<QueryResult | null> {
  const key = process.env.PLAUSIBLE_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ site_id: siteId(), ...body }),
    });
    if (!res.ok) {
      console.error("[admin/plausible] non-2xx", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    return (await res.json()) as QueryResult;
  } catch (err) {
    console.error("[admin/plausible] fetch failed", err);
    return null;
  }
}

export async function getPlausibleData(range: TimeRange): Promise<PlausibleData> {
  const keyPresent = !!process.env.PLAUSIBLE_API_KEY?.trim();
  const base: PlausibleData = {
    connected: false,
    keyPresent,
    siteId: siteId(),
    visitors: null,
    sources: [],
  };
  if (!keyPresent) return base;

  const dr = dateRange(range);
  const [agg, src] = await Promise.all([
    query({ metrics: ["visitors"], date_range: dr }),
    query({ metrics: ["visitors"], date_range: dr, dimensions: ["visit:source"] }),
  ]);

  if (!agg) return base; // key aanwezig maar API-call faalde (bv. verkeerde site-id)

  const visitors =
    typeof agg.results?.[0]?.metrics?.[0] === "number"
      ? (agg.results[0].metrics[0] as number)
      : null;

  const sources = (src?.results ?? [])
    .map((r) => ({
      label: r.dimensions?.[0]?.trim() || "Direct / geen bron",
      visitors: r.metrics?.[0] ?? 0,
    }))
    .filter((s) => s.visitors > 0)
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 8);

  return { ...base, connected: true, visitors, sources };
}
