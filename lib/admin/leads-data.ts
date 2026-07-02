// Server-side datalaag voor het admin-dashboard.
//
// Leest ECHTE De Hofman-leads uit de Supabase `leads`-tabel via PostgREST met
// de service-role key (server-only env var, nooit NEXT_PUBLIC_). Read-only:
// we doen alleen een GET, geen schemawijziging, geen writes — de leads-tabel
// wordt gedeeld met CLP + WhatsApp-bot en mag niet gemuteerd worden.
//
// Geen mock/fallback: ontbreekt de key of faalt de fetch, dan is
// `connected:false` en toont de UI eerlijk "niet gekoppeld" i.p.v. verzonnen
// cijfers (data-truth: geen fake data).

export type TimeRange = "today" | "week" | "month" | "all";

// Welke leads horen bij De Hofman. De `project`-kolom is historisch rommelig
// (soms "De Hofman", soms "de-hofman", soms gelijk aan source), dus matchen we
// op source-prefix + de CLP-source + een project-ILIKE als vangnet.
const DH_FILTER =
  "or=(source.like.dehofman_portal*,source.eq.clp_dehofman,project.ilike.*hofman*)";

const RANGE_DAYS: Record<Exclude<TimeRange, "all">, number> = {
  today: 1,
  week: 7,
  month: 30,
};

type LeadRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  source: string | null;
  project: string | null;
  registration_date: string | null;
  temperature: string | null;
  status: string | null;
  size_id: string | null;
  persona: string | null;
  crm_stage: string | null;
};

export type EventType =
  | "lead"
  | "reservation"
  | "xxl"
  | "insider"
  | "notify-status"
  | "report";

export type LeadsData = {
  connected: boolean;
  /** Aantal leads over ALLE tijd (voor de "sinds start"-context). */
  totalAllTime: number;
  overview: {
    leads: number;
    leadsTrend: number | null; // % vs vorige even lange periode; null bij "all"
    hot: number;
    qualified: number; // crm_stage gekwalificeerd of verder
    reservations: number;
  };
  funnel: { label: string; count: number; percent: number }[];
  /** Herkomst van de leads — het hoofdsignaal ("waar komen leads vandaan"). */
  sources: {
    label: string;
    leads: number;
    share: number; // % van totaal in periode
    hot: number;
  }[];
  recent: {
    id: string;
    ts: string;
    type: EventType;
    name: string;
    detail: string;
    temperature: string | null;
  }[];
  /** Interesse per unit-grootte (uit size_id). */
  sizeInterest: { label: string; count: number }[];
};

function friendlySource(source: string | null): string {
  if (!source) return "Onbekend";
  const map: Record<string, string> = {
    clp_dehofman: "CLP chat-landingspagina",
    dehofman_portal: "Portal (dehofman.nl)",
    dehofman_portal_insider: "Portal · Insider",
    dehofman_portal_reservation: "Portal · Reservering",
    dehofman_portal_xxl: "Portal · XXL-interesse",
    dehofman_portal_report: "Portal · Rekenrapport",
    dehofman_portal_notify: "Portal · Status-notificatie",
    dehofman_portal_other: "Portal · Overig",
    "crm-handmatig": "Handmatig toegevoegd (CRM)",
    "crm-import": "Geïmporteerd (CRM)",
  };
  return map[source] ?? source;
}

function eventType(source: string | null): EventType {
  const s = source ?? "";
  if (s.includes("reservation")) return "reservation";
  if (s.includes("insider")) return "insider";
  if (s.includes("xxl")) return "xxl";
  if (s.includes("report")) return "report";
  if (s.includes("notify")) return "notify-status";
  return "lead";
}

function friendlySize(size: string | null): string {
  if (!size) return "Onbekend / niet opgegeven";
  const map: Record<string, string> = {
    tot_50: "Tot 50 m² (L)",
    rond_100: "Rond 100 m² (XL)",
    vanaf_150: "Vanaf 150 m² (XXL)",
    weet_niet: "Weet nog niet",
  };
  return map[size] ?? size;
}

async function fetchDeHofmanLeads(): Promise<LeadRow[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  const select =
    "id,first_name,last_name,email,source,project,registration_date,temperature,status,size_id,persona,crm_stage";
  const endpoint =
    `${url}/rest/v1/leads?deleted_at=is.null&${DH_FILTER}` +
    `&select=${select}&order=registration_date.desc&limit=5000`;

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[admin/leads] non-2xx", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    return (await res.json()) as LeadRow[];
  } catch (err) {
    console.error("[admin/leads] fetch failed", err);
    return null;
  }
}

function inRange(row: LeadRow, since: number | null): boolean {
  if (since === null) return true; // "all"
  if (!row.registration_date) return false;
  return new Date(row.registration_date).getTime() >= since;
}

const QUALIFIED_STAGES = new Set(["gekwalificeerd", "onderhandeling"]);
const CONTACTED_STAGES = new Set(["in_gesprek", "gekwalificeerd", "onderhandeling"]);

export async function getLeadsData(range: TimeRange): Promise<LeadsData> {
  const rows = await fetchDeHofmanLeads();

  if (!rows) {
    return {
      connected: false,
      totalAllTime: 0,
      overview: { leads: 0, leadsTrend: null, hot: 0, qualified: 0, reservations: 0 },
      funnel: [],
      sources: [],
      recent: [],
      sizeInterest: [],
    };
  }

  const now = Date.now();
  const days = range === "all" ? null : RANGE_DAYS[range];
  const since = days === null ? null : now - days * 86_400_000;
  const prevSince = days === null ? null : now - days * 2 * 86_400_000;

  const inPeriod = rows.filter((r) => inRange(r, since));
  const inPrev =
    days === null
      ? []
      : rows.filter(
          (r) =>
            r.registration_date &&
            new Date(r.registration_date).getTime() >= (prevSince as number) &&
            new Date(r.registration_date).getTime() < (since as number),
        );

  const leads = inPeriod.length;
  const hot = inPeriod.filter((r) => r.temperature === "hot").length;
  const qualified = inPeriod.filter((r) => QUALIFIED_STAGES.has(r.crm_stage ?? "")).length;
  const reservations = inPeriod.filter((r) => (r.source ?? "").includes("reservation")).length;

  const leadsTrend =
    days === null || inPrev.length === 0
      ? days === null
        ? null
        : leads > 0
          ? 100
          : 0
      : Math.round(((leads - inPrev.length) / inPrev.length) * 100);

  // Funnel (kwalificatie, monotoon dalend op basis van huidige crm_stage).
  const contacted = inPeriod.filter((r) => CONTACTED_STAGES.has(r.crm_stage ?? "")).length;
  const negotiation = inPeriod.filter((r) => r.crm_stage === "onderhandeling").length;
  const pct = (n: number) => (leads > 0 ? (n / leads) * 100 : 0);
  const funnel = [
    { label: "Leads binnen", count: leads, percent: 100 },
    { label: "Contact gelegd", count: contacted, percent: pct(contacted) },
    { label: "Gekwalificeerd", count: qualified, percent: pct(qualified) },
    { label: "In onderhandeling", count: negotiation, percent: pct(negotiation) },
  ];

  // Herkomst: groepeer op source.
  const bySource = new Map<string, { leads: number; hot: number }>();
  for (const r of inPeriod) {
    const label = friendlySource(r.source);
    const cur = bySource.get(label) ?? { leads: 0, hot: 0 };
    cur.leads += 1;
    if (r.temperature === "hot") cur.hot += 1;
    bySource.set(label, cur);
  }
  const sources = [...bySource.entries()]
    .map(([label, v]) => ({
      label,
      leads: v.leads,
      hot: v.hot,
      share: leads > 0 ? (v.leads / leads) * 100 : 0,
    }))
    .sort((a, b) => b.leads - a.leads);

  // Recente activiteit: nieuwste leads (over alle tijd, niet periode-gefilterd).
  const recent = rows.slice(0, 12).map((r) => {
    const naam = r.first_name?.trim() || "Onbekende lead";
    const emailMasked = r.email ? maskEmail(r.email) : "geen e-mail";
    return {
      id: r.id,
      ts: r.registration_date ?? new Date(now).toISOString(),
      type: eventType(r.source),
      name: naam,
      detail: `${friendlySource(r.source)} · ${emailMasked}`,
      temperature: r.temperature,
    };
  });

  // Interesse per unit-grootte.
  const bySize = new Map<string, number>();
  for (const r of inPeriod) {
    const label = friendlySize(r.size_id);
    bySize.set(label, (bySize.get(label) ?? 0) + 1);
  }
  const sizeInterest = [...bySize.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    connected: true,
    totalAllTime: rows.length,
    overview: { leads, leadsTrend, hot, qualified, reservations },
    funnel,
    sources,
    recent,
    sizeInterest,
  };
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const head = user.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}
