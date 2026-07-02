import { logoutAdmin } from "@/app/admin/actions";
import {
  getLeadsData,
  type EventType,
  type TimeRange,
} from "@/lib/admin/leads-data";

const RANGE_LABELS: Record<TimeRange, string> = {
  today: "Vandaag",
  week: "Deze week",
  month: "Deze maand",
  all: "Sinds start",
};

export async function AdminDashboard({ range }: { range: TimeRange }) {
  const data = await getLeadsData(range);
  const plausibleConnected = !!process.env.PLAUSIBLE_API_KEY;

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <header className="bg-repp-navy text-white">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-repp-yellow font-semibold">
              REPP Admin
            </p>
            <p className="text-sm font-bold">Projectportal · De Hofman</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/de-hofman"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/80 hover:text-white inline-flex items-center gap-1"
            >
              Open site ↗
            </a>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
              >
                Log uit
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Status banner */}
      {data.connected ? (
        <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs px-5 py-2 text-center">
          <span className="font-bold">Live data.</span> Echte leads uit Supabase
          ({data.totalAllTime.toLocaleString("nl-NL")} De Hofman-leads totaal).
          Bezoekers en verkeersbron volgen zodra Plausible gekoppeld is — zie{" "}
          <a href="#integraties" className="underline font-semibold">
            Integratie-status
          </a>
          .
        </div>
      ) : (
        <div className="bg-rose-50 text-rose-800 border-b border-rose-200 text-xs px-5 py-2 text-center">
          <span className="font-bold">Leads-database niet gekoppeld.</span> Zet{" "}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel
          (Production) en redeploy. Tot dan toont het dashboard geen cijfers —
          bewust geen demo-data.
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 py-8 md:py-12 space-y-12">
        {/* Time range tabs */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight">
              Overzicht · {RANGE_LABELS[range]}
            </h1>
            <div className="inline-flex bg-white border border-repp-gray rounded-full p-1">
              {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
                <a
                  key={r}
                  href={`/admin?range=${r}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    range === r
                      ? "bg-repp-navy text-white"
                      : "text-repp-navy/70 hover:text-repp-navy"
                  }`}
                >
                  {RANGE_LABELS[r]}
                </a>
              ))}
            </div>
          </div>

          {/* Overview cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              label="Leads binnen"
              value={data.overview.leads.toLocaleString("nl-NL")}
              trend={data.overview.leadsTrend ?? undefined}
            />
            <Stat
              label="Hot leads"
              value={data.overview.hot.toLocaleString("nl-NL")}
              hint="temperatuur = hot"
            />
            <Stat
              label="Gekwalificeerd"
              value={data.overview.qualified.toLocaleString("nl-NL")}
              hint="gekwalificeerd of verder"
            />
            <Stat
              label="Bezoekers"
              value={plausibleConnected ? "—" : "—"}
              hint="Plausible · stap 2"
            />
          </div>
        </section>

        {/* Herkomst leads — hoofdweergave */}
        <section>
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-1">
            Waar komen leads vandaan
          </h2>
          <p className="text-sm text-repp-navy/60 mb-4">
            Verdeling van de {data.overview.leads.toLocaleString("nl-NL")} leads
            in deze periode over de kanalen die ze binnenbrachten.
          </p>
          <div className="rounded-2xl bg-white border border-repp-gray p-5 md:p-7">
            {data.sources.length === 0 ? (
              <EmptyRow>Geen leads in deze periode.</EmptyRow>
            ) : (
              <ul className="space-y-4">
                {data.sources.map((s) => (
                  <li key={s.label}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm font-semibold text-repp-navy">
                        {s.label}
                      </span>
                      <span className="text-sm text-repp-navy/70 tabular-nums">
                        <span className="font-bold text-repp-navy">
                          {s.leads}
                        </span>{" "}
                        lead{s.leads === 1 ? "" : "s"} · {s.share.toFixed(0)}%
                        {s.hot > 0 && (
                          <span className="ml-2 text-rose-600 font-semibold">
                            {s.hot} hot
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="relative h-3 bg-repp-gray/40 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-repp-blue"
                        style={{ width: `${Math.max(2, s.share)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Funnel */}
        <section>
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
            Kwalificatie-funnel
          </h2>
          <div className="rounded-2xl bg-white border border-repp-gray p-5 md:p-7">
            {data.funnel.length === 0 ? (
              <EmptyRow>Nog geen leads om een funnel te tonen.</EmptyRow>
            ) : (
              <ul className="space-y-3">
                {data.funnel.map((step, idx) => (
                  <li
                    key={step.label}
                    className="grid grid-cols-[150px_1fr_70px] md:grid-cols-[190px_1fr_90px] gap-3 items-center"
                  >
                    <span className="text-sm font-semibold text-repp-navy">
                      {step.label}
                    </span>
                    <div className="relative h-7 bg-repp-gray/40 rounded-md overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-md transition-all ${
                          idx === 0
                            ? "bg-repp-navy"
                            : idx === data.funnel.length - 1
                              ? "bg-repp-yellow"
                              : "bg-repp-blue"
                        }`}
                        style={{ width: `${Math.max(step.count > 0 ? 3 : 0, step.percent)}%` }}
                      />
                      <span
                        className={`absolute inset-0 flex items-center px-3 text-xs font-bold ${
                          idx === data.funnel.length - 1
                            ? "text-repp-navy"
                            : "text-white"
                        }`}
                      >
                        {step.count.toLocaleString("nl-NL")}
                      </span>
                    </div>
                    <span className="text-sm text-repp-navy/65 text-right tabular-nums">
                      {step.percent.toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Grootte-interesse + Recente activiteit side-by-side */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
              Interesse per grootte
            </h2>
            <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
              {data.sizeInterest.length === 0 ? (
                <EmptyRow>Geen data.</EmptyRow>
              ) : (
                data.sizeInterest.map((s) => (
                  <div
                    key={s.label}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-repp-navy">
                      {s.label}
                    </span>
                    <span className="text-sm font-bold text-repp-navy tabular-nums">
                      {s.count}
                    </span>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-repp-navy/50 leading-relaxed">
              Views/favorieten per losse unit volgen met Plausible (stap 2).
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
              Recente activiteit
            </h2>
            <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
              {data.recent.length === 0 ? (
                <EmptyRow>Nog geen leads.</EmptyRow>
              ) : (
                data.recent.map((e) => (
                  <div
                    key={e.id}
                    className="px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <EventTypeBadge type={e.type} />
                        <span className="text-sm font-bold text-repp-navy">
                          {e.name}
                        </span>
                        {e.temperature === "hot" && (
                          <span className="text-[10px] uppercase font-bold text-rose-600">
                            hot
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-repp-navy/65 mt-1 truncate">
                        {e.detail}
                      </p>
                    </div>
                    <span className="text-[11px] text-repp-navy/45 whitespace-nowrap">
                      {relativeTime(e.ts)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Integration status */}
        <section id="integraties">
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
            Integratie-status
          </h2>
          <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
            {integrationStatus(data.connected, plausibleConnected).map((it) => (
              <div
                key={it.name}
                className="px-4 py-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-repp-navy">{it.name}</p>
                  <p className="text-sm text-repp-navy/65 mt-0.5 leading-relaxed">
                    {it.description}
                  </p>
                </div>
                <IntegrationBadge status={it.status} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function integrationStatus(
  supabaseLive: boolean,
  plausibleLive: boolean,
): { name: string; description: string; status: "live" | "mock" | "todo" }[] {
  return [
    {
      name: "Supabase leads",
      status: supabaseLive ? "live" : "todo",
      description: supabaseLive
        ? "Dashboard leest echte De Hofman-leads uit de leads-tabel (read-only, service-role)."
        : "Zet SUPABASE_SERVICE_ROLE_KEY in Vercel (Production) en redeploy.",
    },
    {
      name: "Plausible — tracking",
      status: "live",
      description:
        "Pageviews + custom events worden live verzameld (script in layout.tsx).",
    },
    {
      name: "Plausible — Stats API",
      status: plausibleLive ? "live" : "todo",
      description: plausibleLive
        ? "Bezoekers en verkeersbron worden uit de Stats API gelezen."
        : "Zet PLAUSIBLE_API_KEY in Vercel om bezoekers/verkeersbron te tonen (stap 2).",
    },
    {
      name: "Vercel hosting + GitHub",
      status: "live",
      description: "reppenweetje/projectportal — auto-deploy bij elke push.",
    },
  ];
}

function Stat({
  label,
  value,
  trend,
  hint,
}: {
  label: string;
  value: string;
  trend?: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-repp-gray p-5">
      <p className="text-xs uppercase tracking-wider text-repp-navy/55 font-semibold">
        {label}
      </p>
      <p className="mt-2 text-3xl md:text-4xl font-extrabold text-repp-navy tabular-nums">
        {value}
      </p>
      {trend !== undefined && (
        <p
          className={`mt-1 text-xs font-bold tabular-nums ${
            trend > 0
              ? "text-emerald-600"
              : trend < 0
                ? "text-rose-600"
                : "text-repp-navy/50"
          }`}
        >
          {trend > 0 ? "▲" : trend < 0 ? "▼" : "·"} {Math.abs(trend)}% vs vorige
          periode
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-repp-navy/55">{hint}</p>}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-repp-navy/50 text-center py-6">{children}</p>
  );
}

function EventTypeBadge({ type }: { type: EventType }) {
  const styles: Record<EventType, string> = {
    lead: "bg-status-coming/15 text-status-coming",
    reservation: "bg-repp-yellow/30 text-repp-navy",
    xxl: "bg-status-optie/25 text-repp-navy",
    insider: "bg-emerald-100 text-emerald-700",
    "notify-status": "bg-sky-100 text-sky-700",
    report: "bg-violet-100 text-violet-700",
  };
  const labels: Record<EventType, string> = {
    lead: "Lead",
    reservation: "Reserveer",
    xxl: "XXL",
    insider: "Insider",
    "notify-status": "Notify",
    report: "Rapport",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

function IntegrationBadge({ status }: { status: "live" | "mock" | "todo" }) {
  const map = {
    live: {
      label: "Live",
      cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
    mock: {
      label: "Mock",
      cls: "bg-amber-100 text-amber-700 border-amber-300",
    },
    todo: { label: "Todo", cls: "bg-rose-100 text-rose-700 border-rose-300" },
  };
  const s = map[status];
  return (
    <span
      className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.cls}`}
    >
      ● {s.label}
    </span>
  );
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "nu";
  if (min < 60) return `${min} min geleden`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} u geleden`;
  const dy = Math.round(hr / 24);
  return `${dy} dag${dy === 1 ? "" : "en"} geleden`;
}
