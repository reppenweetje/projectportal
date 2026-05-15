import { deHofman } from "@/lib/projects/de-hofman";

export type TimeRange = "today" | "week" | "month" | "all";

/** Deterministic pseudo-random based on a string seed (so numbers don't flicker on reload) */
function seedRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function randomInRange(seed: string, min: number, max: number): number {
  return Math.round(min + seedRandom(seed) * (max - min));
}

/** Today's date as a stable seed (so daily numbers don't change on each reload) */
function dailySeed(suffix: string): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${suffix}`;
}

export type Overview = {
  visitors: number;
  visitorsTrend: number; // +/- percent vs previous period
  leads: number; // total lead-captures (interest + insider + xxl + reservations)
  leadsTrend: number;
  reservations: number;
  reservationsTrend: number;
  conversionRate: number; // leads / visitors * 100
};

export function getOverview(range: TimeRange): Overview {
  const multipliers: Record<TimeRange, number> = {
    today: 1,
    week: 6,
    month: 22,
    all: 78,
  };
  const m = multipliers[range];
  const seed = `${range}-overview`;
  const visitors = randomInRange(dailySeed(seed + "v"), 60, 180) * m;
  const leads = Math.round(visitors * (0.04 + seedRandom(dailySeed(seed + "l")) * 0.04));
  const reservations = Math.round(leads * (0.18 + seedRandom(dailySeed(seed + "r")) * 0.12));
  const conversionRate = (leads / visitors) * 100;
  return {
    visitors,
    visitorsTrend: Math.round((seedRandom(dailySeed(seed + "vt")) - 0.3) * 30),
    leads,
    leadsTrend: Math.round((seedRandom(dailySeed(seed + "lt")) - 0.3) * 35),
    reservations,
    reservationsTrend: Math.round((seedRandom(dailySeed(seed + "rt")) - 0.2) * 40),
    conversionRate,
  };
}

export type FunnelStep = {
  label: string;
  count: number;
  percent: number;
};

export function getFunnel(range: TimeRange): FunnelStep[] {
  const ov = getOverview(range);
  const v = ov.visitors;
  const calculatorUsed = Math.round(v * (0.22 + seedRandom(dailySeed("fc")) * 0.1));
  const docViewed = Math.round(v * (0.18 + seedRandom(dailySeed("fd")) * 0.08));
  const leads = ov.leads;
  const reservations = ov.reservations;
  return [
    { label: "Bezoekers", count: v, percent: 100 },
    {
      label: "Calculator gebruikt",
      count: calculatorUsed,
      percent: (calculatorUsed / v) * 100,
    },
    {
      label: "Document bekeken",
      count: docViewed,
      percent: (docViewed / v) * 100,
    },
    { label: "Lead gecaptured", count: leads, percent: (leads / v) * 100 },
    {
      label: "Reservering aangevraagd",
      count: reservations,
      percent: (reservations / v) * 100,
    },
  ];
}

export type Source = {
  label: string;
  visitors: number;
  leads: number;
};

export function getSources(range: TimeRange): Source[] {
  const ov = getOverview(range);
  const breakdown = [
    { label: "CLP (campagne)", weight: 0.42 },
    { label: "Direct / mail", weight: 0.21 },
    { label: "Google search", weight: 0.18 },
    { label: "Social (Meta/LinkedIn)", weight: 0.12 },
    { label: "Referrals", weight: 0.07 },
  ];
  return breakdown.map((s) => ({
    label: s.label,
    visitors: Math.round(ov.visitors * s.weight),
    leads: Math.round(ov.leads * s.weight * (0.8 + seedRandom(dailySeed(s.label)) * 0.4)),
  }));
}

export type UnitInterest = {
  unitNumber: number;
  type: "L" | "XL" | "XXL";
  status: string;
  views: number;
  favorites: number;
  reservationRequests: number;
};

export function getUnitInterest(range: TimeRange): UnitInterest[] {
  const ov = getOverview(range);
  return deHofman.units.map((u) => {
    const popularity = seedRandom(dailySeed(`u${u.number}`)); // 0-1
    const baseViews = Math.round(ov.visitors * (0.06 + popularity * 0.18));
    const isAvailable = u.status === "available";
    const isOvb = u.status === "verkocht_ovb";
    const interactionRate = isAvailable ? 1 : isOvb ? 0.6 : 0.25;
    return {
      unitNumber: u.number,
      type: u.type,
      status: u.status,
      views: baseViews,
      favorites: Math.round(baseViews * (0.04 + popularity * 0.08) * interactionRate),
      reservationRequests: isAvailable
        ? Math.round(baseViews * 0.02 * (0.5 + popularity))
        : 0,
    };
  });
}

export type RecentEvent = {
  id: string;
  ts: string; // ISO
  type: "lead" | "reservation" | "xxl" | "insider" | "notify-status" | "report";
  label: string;
  detail: string;
  source?: string;
};

export function getRecentEvents(): RecentEvent[] {
  const now = Date.now();
  // Synthesize a feed of plausible recent events
  const seedNames = [
    "Jesse",
    "Mark",
    "Sanne",
    "Pieter",
    "Lisa",
    "Hans",
    "Ahmed",
    "Eva",
    "Marc",
    "Tom",
    "Anouk",
    "Jeroen",
  ];
  const seedDomains = ["@jt-bouw.nl", "@gmail.com", "@kpnmail.nl", "@hotmail.com", "@stadsbouwers.nl"];
  const types: RecentEvent["type"][] = [
    "lead",
    "reservation",
    "xxl",
    "insider",
    "notify-status",
    "report",
    "lead",
    "insider",
    "lead",
    "reservation",
  ];
  return types.map((type, i) => {
    const nameSeed = `n-${i}-${new Date().toISOString().slice(0, 10)}`;
    const name = seedNames[Math.floor(seedRandom(nameSeed) * seedNames.length)];
    const domain = seedDomains[Math.floor(seedRandom(nameSeed + "d") * seedDomains.length)];
    const minutesAgo = Math.round(5 + seedRandom(nameSeed + "t") * 60 * 36);
    const ts = new Date(now - minutesAgo * 60 * 1000).toISOString();
    const labels: Record<RecentEvent["type"], string> = {
      lead: "Lead capture",
      reservation: "Reserveringsverzoek",
      xxl: "XXL-wachtlijst",
      insider: "Insider inschrijving",
      "notify-status": "Status-notificatie ingesteld",
      report: "Calculator-rapport gevraagd",
    };
    const details: Record<RecentEvent["type"], string> = {
      lead: `${name}${domain} via brochure-banner`,
      reservation: `${name} — Unit ${[4, 6, 12, 13][Math.floor(seedRandom(nameSeed + "u") * 4)]}`,
      xxl: `${name} — voorkeur Unit ${seedRandom(nameSeed + "x") < 0.5 ? "7" : "14"}, met woning`,
      insider: `${name}${domain} — alle updates`,
      "notify-status": `${name} — Unit ${[4, 6, 12, 13][Math.floor(seedRandom(nameSeed + "n") * 4)]}`,
      report: `${name}${domain} — maandlast-scenario`,
    };
    return {
      id: `evt-${i}-${ts}`,
      ts,
      type,
      label: labels[type],
      detail: details[type],
      source: ["clp", "direct", "google", "social"][
        Math.floor(seedRandom(nameSeed + "s") * 4)
      ],
    };
  });
}

export type IntegrationStatus = {
  name: string;
  status: "live" | "mock" | "todo";
  description: string;
};

export function getIntegrationStatus(): IntegrationStatus[] {
  return [
    {
      name: "Vercel hosting",
      status: "live",
      description: "Production builds + auto-deploy bij elke push",
    },
    {
      name: "GitHub repo",
      status: "live",
      description: "reppenweetje/projectportal — alle code versioned",
    },
    {
      name: "Web analytics",
      status: "todo",
      description:
        "Vercel Analytics of Plausible voor echte bezoeker-data. 1 install + paste in layout.",
    },
    {
      name: "Lead capture (/api/interest)",
      status: "mock",
      description:
        "Endpoint logt naar Vercel server-logs. Koppelen aan Resend audience of Supabase tabel.",
    },
    {
      name: "Reserveringen (/api/reservation)",
      status: "mock",
      description:
        "Endpoint logt naar Vercel server-logs. Koppelen aan Slack-webhook + Supabase + Mollie iDeal.",
    },
    {
      name: "XXL-wachtlijst (/api/xxl-interest)",
      status: "mock",
      description: "Endpoint logt naar Vercel server-logs. Koppelen aan CRM met tag 'xxl'.",
    },
    {
      name: "Insider-inschrijvingen (/api/insider)",
      status: "mock",
      description:
        "Endpoint logt naar Vercel server-logs. Koppelen aan Resend Audience met tags voor segmentatie.",
    },
    {
      name: "Status-notificaties (/api/notify-status)",
      status: "mock",
      description:
        "Endpoint logt naar Vercel server-logs. Vereist subscriptions-tabel + cron job.",
    },
    {
      name: "PDF-rapport mailen (/api/report)",
      status: "mock",
      description:
        "Endpoint logt naar Vercel server-logs. Koppelen aan Puppeteer/Chromium PDF-render + Resend met attachment.",
    },
    {
      name: "Notaris-koppeling",
      status: "todo",
      description: "DocuSign of SignRequest voor digitaal koopcontract.",
    },
    {
      name: "iDeal aanbetaling",
      status: "todo",
      description: "Mollie integratie voor 5% naar notarisrekening.",
    },
  ];
}
