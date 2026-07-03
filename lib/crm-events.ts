// REPP CRM website-signalen — SERVER-ONLY helper.
//
// Stuurt portaal-acties (reservering, wachtlijst, document-download, ...) als
// events naar de "clp analytics"-Supabase Edge Function `clp-events-upsert`.
// Het REPP CRM (crm.repp.nl) leest die events en toont ze als signalen in het
// blok "Signalen van de website" bij de bijbehorende lead. Alles wat met
// `unit:reserv` begint verschijnt daar als 🔥 "Unit gereserveerd via het
// portaal"; elk event dat met `portal:` begint verschijnt als los signaal.
//
// LET OP: dit is een ANDER Supabase-project dan de lead-upsert flow
// (lib/lead-sync.ts). lead-upsert = reppbot (public.leads); clp-events-upsert =
// clp-analytics, de bron waar het CRM z'n website-signalen uit haalt. Beide
// praten met de publieke anon/publishable key.
//
// Koppeling event → lead gebeurt op `session_id`:
//   A. Voorkeur — de CLP-sessie die via ?clp_session= aan de portal-link is
//      meegegeven. Matcht direct de bestaande CLP-lead.
//   B. Fallback — kennen we alleen het e-mailadres, dan registreren we eerst
//      een sessie mét e-mail via `clp-leads-upsert` (self-generated uuid) en
//      loggen we het event met diezelfde uuid. Het CRM matcht dan op e-mail.
//
// Best-effort: faalt stil en gooit nooit — een CRM-hiccup mag nooit een
// portaal-flow breken.

import { randomUUID } from "node:crypto";

// Host + key van het clp-analytics project. Publieke publishable key —
// dezelfde die de projectsites in de frontend gebruiken — dus veilig als
// default. Overschrijfbaar via env voor rotatie of andere omgevingen.
const CRM_HOST =
  process.env.CLP_ANALYTICS_URL?.trim() ||
  "https://uksrxvzhmnqisbbpnhmn.supabase.co";
const CRM_KEY =
  process.env.CLP_ANALYTICS_ANON_KEY?.trim() ||
  "sb_publishable_RtKgkbWHcln9UKyiBuc_uw_LKwXAQVG";

// tenant is verplicht in de events-payload; wij zijn altijd dehofman.
const TENANT = "dehofman";
// clp-leads-upsert verwacht een project-specifieke source voor de match.
const LEADS_SOURCE = "clp_dehofman";

const headers = {
  "content-type": "application/json",
  accept: "application/json",
  authorization: `Bearer ${CRM_KEY}`,
  apikey: CRM_KEY,
};

export type CrmEvent = {
  /**
   * `unit:reserved` voor een reservering (→ 🔥 in het CRM). Overige
   * portaal-signalen: `portal:<actie>`, bv. `portal:waitlist` of
   * `portal:doc-downloaded`.
   */
  event_type: string;
  url_path: string;
  /** Vrije context; wordt letterlijk in het CRM getoond. Géén PII. */
  payload?: Record<string, unknown>;
};

export interface SendCrmEventsInput {
  /** CLP-sessie (Optie A). Leeg → val terug op e-mail (Optie B). */
  clpSession?: string | null;
  /** Nodig voor Optie B: koppeling van de lead op e-mail. */
  email?: string | null;
  events: CrmEvent[];
}

export interface SendCrmEventsResult {
  ok: boolean;
  inserted?: number;
  error?: string;
}

/**
 * Optie B — registreer een sessie mét e-mail zodat het CRM het latere event
 * op e-mail kan matchen. Returnt de zelf-gegenereerde session_id, of null als
 * de registratie faalt.
 */
async function registerSessionByEmail(email: string): Promise<string | null> {
  const sessionId = randomUUID();
  try {
    const res = await fetch(`${CRM_HOST}/functions/v1/clp-leads-upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: LEADS_SOURCE,
        session_id: sessionId,
        email,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "[crm-events] clp-leads-upsert non-2xx",
        res.status,
        detail.slice(0, 200),
      );
      return null;
    }
    return sessionId;
  } catch (err) {
    console.error("[crm-events] clp-leads-upsert failed", err);
    return null;
  }
}

/**
 * Log één of meer portaal-events naar het CRM. Lost eerst de session_id op
 * (CLP-sessie of email-registratie) en POST daarna de batch naar
 * clp-events-upsert.
 */
export async function sendCrmEvents(
  input: SendCrmEventsInput,
): Promise<SendCrmEventsResult> {
  const events = input.events.slice(0, 100);
  if (events.length === 0) return { ok: true, inserted: 0 };

  // Sessie bepalen: CLP-sessie (A) heeft voorkeur, anders registreren op
  // e-mail (B). Zonder beide is er niets om aan te koppelen.
  let sessionId = input.clpSession?.trim() || null;
  if (!sessionId) {
    const email = input.email?.trim();
    if (!email) return { ok: false, error: "no_session_no_email" };
    sessionId = await registerSessionByEmail(email);
    if (!sessionId) return { ok: false, error: "session_register_failed" };
  }

  const body = {
    tenant: TENANT,
    events: events.map((e) => ({
      session_id: sessionId,
      event_type: e.event_type,
      url_path: e.url_path,
      payload: e.payload ?? {},
    })),
  };

  try {
    const res = await fetch(`${CRM_HOST}/functions/v1/clp-events-upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "[crm-events] clp-events-upsert non-2xx",
        res.status,
        detail.slice(0, 200),
      );
      return { ok: false, error: `upstream_${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      inserted?: number;
    };
    return { ok: !!data.ok, inserted: data.inserted };
  } catch (err) {
    console.error("[crm-events] clp-events-upsert failed", err);
    return { ok: false, error: "fetch_failed" };
  }
}
