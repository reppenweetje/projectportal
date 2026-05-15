import { logoutAdmin } from "@/app/admin/actions";
import {
  getFunnel,
  getIntegrationStatus,
  getOverview,
  getRecentEvents,
  getSources,
  getUnitInterest,
  type TimeRange,
} from "@/lib/admin/mock-data";

const RANGE_LABELS: Record<TimeRange, string> = {
  today: "Vandaag",
  week: "Deze week",
  month: "Deze maand",
  all: "Sinds start",
};

export function AdminDashboard({ range }: { range: TimeRange }) {
  const overview = getOverview(range);
  const funnel = getFunnel(range);
  const sources = getSources(range);
  const units = getUnitInterest(range);
  const events = getRecentEvents();
  const integrations = getIntegrationStatus();

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

      {/* Demo banner */}
      <div className="bg-repp-yellow text-repp-navy text-xs px-5 py-2 text-center">
        <span className="font-bold">Demo data.</span> Cijfers zijn synthetisch
        zolang de API-endpoints nog naar de console loggen. Zie{" "}
        <a href="#integraties" className="underline font-semibold">
          Integratie-status
        </a>{" "}
        onderaan.
      </div>

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
              label="Bezoekers"
              value={overview.visitors.toLocaleString("nl-NL")}
              trend={overview.visitorsTrend}
            />
            <Stat
              label="Leads gecaptured"
              value={overview.leads.toLocaleString("nl-NL")}
              trend={overview.leadsTrend}
            />
            <Stat
              label="Reserveringen"
              value={overview.reservations.toLocaleString("nl-NL")}
              trend={overview.reservationsTrend}
            />
            <Stat
              label="Conversie"
              value={`${overview.conversionRate.toFixed(1)}%`}
              hint="leads / bezoekers"
            />
          </div>
        </section>

        {/* Funnel */}
        <section>
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
            Conversie-funnel
          </h2>
          <div className="rounded-2xl bg-white border border-repp-gray p-5 md:p-7">
            <ul className="space-y-3">
              {funnel.map((step, idx) => (
                <li
                  key={step.label}
                  className="grid grid-cols-[160px_1fr_70px] md:grid-cols-[200px_1fr_90px] gap-3 items-center"
                >
                  <span className="text-sm font-semibold text-repp-navy">
                    {step.label}
                  </span>
                  <div className="relative h-7 bg-repp-gray/40 rounded-md overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-md transition-all ${
                        idx === 0
                          ? "bg-repp-navy"
                          : idx === funnel.length - 1
                            ? "bg-repp-yellow"
                            : "bg-repp-blue"
                      }`}
                      style={{ width: `${step.percent}%` }}
                    />
                    <span
                      className={`absolute inset-0 flex items-center px-3 text-xs font-bold ${
                        idx === funnel.length - 1
                          ? "text-repp-navy"
                          : "text-white"
                      }`}
                    >
                      {step.count.toLocaleString("nl-NL")}
                    </span>
                  </div>
                  <span className="text-sm text-repp-navy/65 text-right tabular-nums">
                    {step.percent.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sources + Recent events side-by-side */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
              Verkeerbron
            </h2>
            <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
              {sources.map((s) => (
                <div
                  key={s.label}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-repp-navy">
                    {s.label}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-repp-navy tabular-nums">
                      {s.visitors.toLocaleString("nl-NL")}
                    </p>
                    <p className="text-[11px] text-repp-navy/60">
                      {s.leads} leads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
              Recente activiteit
            </h2>
            <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="px-4 py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <EventTypeBadge type={e.type} />
                      <span className="text-sm font-bold text-repp-navy">
                        {e.label}
                      </span>
                    </div>
                    <p className="text-xs text-repp-navy/65 mt-1 truncate">
                      {e.detail}
                    </p>
                  </div>
                  <span className="text-[11px] text-repp-navy/45 whitespace-nowrap">
                    {relativeTime(e.ts)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Per unit */}
        <section>
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
            Interesse per unit
          </h2>
          <div className="rounded-2xl bg-white border border-repp-gray overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-repp-gray/30 text-xs uppercase tracking-wider text-repp-navy/60">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Unit</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Views</th>
                  <th className="text-right px-4 py-3 font-semibold">Favorieten</th>
                  <th className="text-right px-4 py-3 font-semibold">Reserveer-aanvragen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-repp-gray/60">
                {units.map((u) => (
                  <tr key={u.unitNumber} className="hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-bold text-repp-navy">
                      U-{u.unitNumber}
                    </td>
                    <td className="px-4 py-3 text-repp-navy/80">{u.type}</td>
                    <td className="px-4 py-3">
                      <UnitStatusPill status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-repp-navy">
                      {u.views.toLocaleString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-repp-navy">
                      {u.favorites}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-repp-navy">
                      {u.reservationRequests || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Integration status */}
        <section id="integraties">
          <h2 className="text-xl font-extrabold text-repp-navy tracking-tight mb-4">
            Integratie-status
          </h2>
          <div className="rounded-2xl bg-white border border-repp-gray divide-y divide-repp-gray/60">
            {integrations.map((it) => (
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
          <p className="mt-4 text-xs text-repp-navy/55 leading-relaxed">
            Wil je echte data tonen? Stap 1 is meestal{" "}
            <a
              href="https://vercel.com/docs/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-repp-navy"
            >
              Vercel Analytics aanzetten
            </a>{" "}
            (1 install, paste in layout). Voor lead data: Supabase tabel of
            Resend Audience koppelen aan de bestaande mock-endpoints.
          </p>
        </section>
      </main>
    </div>
  );
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
          {trend > 0 ? "▲" : trend < 0 ? "▼" : "·"} {Math.abs(trend)}% vs
          vorige periode
        </p>
      )}
      {hint && (
        <p className="mt-1 text-xs text-repp-navy/55">{hint}</p>
      )}
    </div>
  );
}

function EventTypeBadge({
  type,
}: {
  type: "lead" | "reservation" | "xxl" | "insider" | "notify-status" | "report";
}) {
  const styles: Record<typeof type, string> = {
    lead: "bg-status-coming/15 text-status-coming",
    reservation: "bg-repp-yellow/30 text-repp-navy",
    xxl: "bg-status-optie/25 text-repp-navy",
    insider: "bg-emerald-100 text-emerald-700",
    "notify-status": "bg-sky-100 text-sky-700",
    report: "bg-violet-100 text-violet-700",
  };
  const labels: Record<typeof type, string> = {
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

function UnitStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    available: {
      label: "Vrij",
      cls: "bg-status-available/20 text-emerald-700",
    },
    in_optie: {
      label: "In optie",
      cls: "bg-status-optie/30 text-amber-700",
    },
    verkocht_ovb: {
      label: "Verkocht o.v.b.",
      cls: "bg-status-optie/25 text-amber-700",
    },
    sold: {
      label: "Verkocht",
      cls: "bg-status-sold/20 text-rose-700",
    },
    coming_soon: {
      label: "Binnenkort",
      cls: "bg-repp-gray/40 text-repp-navy/70",
    },
  };
  const s = map[status] ?? { label: status, cls: "bg-repp-gray/40 text-repp-navy/70" };
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}
    >
      {s.label}
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
