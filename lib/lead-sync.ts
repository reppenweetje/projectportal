// Shared helper voor portal-side /api routes om walk-in leads naar de
// Supabase `lead-upsert` Edge Function te sturen. Centraliseert de
// boilerplate (env-vars, error-handling, UUID-generation) zodat elke
// /api route alleen z'n eigen field-mapping hoeft te doen.
//
// Belangrijk: deze helper draait SERVER-SIDE (Next.js API route, Node-
// runtime). Anon-key is in env als NEXT_PUBLIC_SUPABASE_ANON_KEY want
// hij wordt ook door middleware/client gebruikt voor portal-resolve.
// Service-role-key blijft server-only in Supabase Edge.
//
// De lead-upsert function:
//   - INSERT'd of UPDATE't op (source, session_id)
//   - Genereert portal_token via DB DEFAULT bij eerste INSERT
//   - Triggert Brevo upsert (PORTAL list voor source=dehofman_portal_*)
//   - Triggert Slack-notify als temperature === 'hot'
//   - Triggert Zapier walk-in webhook als source begint met dehofman_portal_*
//
// Een portal-form-submit zou normaal ÉÉN INSERT zijn (random session_id
// per submit). Dat is OK want de lead-upsert dedupliceert in Brevo op
// email — meerdere submits van dezelfde persoon updaten één Brevo-rij.

import { randomUUID } from "node:crypto";

export type WalkinSource =
  | "dehofman_portal_reservation"
  | "dehofman_portal_insider"
  | "dehofman_portal_interest"
  | "dehofman_portal_xxl"
  | "dehofman_portal_report"
  | "dehofman_portal_notify"
  | "dehofman_portal_other";

export interface WalkinLead {
  source: WalkinSource;
  email?: string | null;
  first_name?: string | null;
  phone?: string | null;
  /** ondernemer | belegger — gemapt naar lead-upsert persona */
  modus?: "ondernemer" | "belegger" | null;
  unit_id?: string | null; // bv "unit-1", "unit-7"
  unit_type?: "L" | "XL" | "XXL" | null;
  /** Vrije tekst, sales-context. Gaat naar attributes.note. */
  note?: string | null;
  /** Wanneer mogen we bellen — asap / this_week / no_pref */
  contact_moment?: "asap" | "this_week" | "no_pref" | null;
  /** Indien beschikbaar (lead kwam al via CLP, browser-cookie heeft 't) */
  session_id?: string;
  /** Voor hot-lead detection. Reservering is altijd warm-tot-hot. */
  temperature?: "cold" | "warm" | "hot" | null;
  /** Free-form extra context, niet primair geïndexeerd */
  attributes?: Record<string, unknown>;
}

export interface UpsertResult {
  ok: boolean;
  lead_id?: string | null;
  portal_token?: string | null;
  error?: string;
}

/**
 * Stuurt een walk-in lead naar lead-upsert. Genereert session_id als
 * 'ie niet meegegeven is. Returnt portal_token zodat de UI 'm in de
 * cookie kan zetten / mee kan sturen in een Brevo-mail-link.
 */
export async function upsertWalkinLead(lead: WalkinLead): Promise<UpsertResult> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!SUPABASE_URL || !ANON_KEY) {
    return { ok: false, error: "supabase_env_missing" };
  }

  const sessionId = lead.session_id ?? randomUUID();

  // Map naar lead-upsert LeadPayload shape. CLP gebruikt persona "eigen_gebruiker"
  // / "belegger" als enum; portal gebruikt "ondernemer" / "belegger". Map hier
  // zodat downstream segmentatie consistent is.
  const persona =
    lead.modus === "ondernemer"
      ? "eigen_gebruiker"
      : lead.modus === "belegger"
        ? "belegger"
        : undefined;

  const payload: Record<string, unknown> = {
    session_id: sessionId,
    source: lead.source,
  };
  if (lead.email) payload.email = lead.email;
  if (lead.first_name) payload.first_name = lead.first_name;
  if (lead.phone) payload.phone = lead.phone;
  if (persona) payload.persona = persona;
  if (lead.unit_type) payload.size_id = lead.unit_type;
  if (lead.temperature) payload.temperature = lead.temperature;

  // Walk-in submits hebben geen kwalificatie-flow, dus geen score/stage
  // tenzij sales 'em later upgrade. Default markeren we als "warm" zodat
  // het ergens tussen CLP-leads in zit.
  if (!payload.temperature) payload.temperature = "warm";

  // Vrij-formulier velden in attributes-bag stoppen — lead-upsert zet ze
  // door naar Supabase als jsonb. Brevo/Zapier pakken de relevante velden
  // er weer uit (rentRange, gateContext etc).
  const attributes: Record<string, unknown> = { ...(lead.attributes ?? {}) };
  if (lead.unit_id) attributes.unit_id = lead.unit_id;
  if (lead.note) attributes.note = lead.note;
  if (lead.contact_moment) attributes.contact_moment = lead.contact_moment;
  if (Object.keys(attributes).length > 0) payload.attributes = attributes;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/lead-upsert`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[lead-sync] non-2xx", res.status, detail.slice(0, 300));
      return { ok: false, error: `upstream_${res.status}` };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      lead_id?: string | null;
      portal_token?: string | null;
    };
    return {
      ok: !!data.ok,
      lead_id: data.lead_id ?? null,
      portal_token: data.portal_token ?? null,
    };
  } catch (err) {
    console.error("[lead-sync] fetch failed", err);
    return { ok: false, error: "fetch_failed" };
  }
}
