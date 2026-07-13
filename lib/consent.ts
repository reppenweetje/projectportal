/**
 * Cookie-consent — AVG/ePrivacy + Google Consent Mode v2.
 *
 * Drie categorieën:
 *   - noodzakelijk : altijd aan (functionele cookies dh_session/repp_*).
 *                    Geen toestemming vereist, valt buiten de cookiewet.
 *   - analytics    : GA4 (analytics_storage). Plausible is cookieloos en
 *                    draait ALTIJD, los van deze keuze.
 *   - marketing    : Google Ads + Meta Pixel (ad_storage, ad_user_data,
 *                    ad_personalization).
 *
 * Default = alles geweigerd (opt-in). De keuze wordt in het `repp_consent`
 * cookie opgeslagen met versie + timestamp (bewijs + houdbaarheid). Na
 * CONSENT_TTL_DAYS vervalt 'ie en vragen we opnieuw.
 *
 * Consent Mode v2: de default-denied staat wordt vóór alle Google-tags
 * gezet in app/layout.tsx (inline script). Deze module stuurt de `update`
 * bij een keuze, plus een window-event zodat de Meta Pixel-loader reageert.
 *
 * Alle functies zijn SSR-veilig (no-op zonder document/window).
 */

export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = ConsentChoice & {
  /** Schema-versie; bump om iedereen opnieuw te laten kiezen. */
  v: number;
  /** ISO-timestamp van het moment van keuze (bewijs van toestemming). */
  ts: string;
};

const COOKIE_NAME = "repp_consent";
const CONSENT_VERSION = 1;
const CONSENT_TTL_DAYS = 180;

/** Window-event dat vuurt bij elke keuze, zodat loaders kunnen reageren. */
export const CONSENT_EVENT = "repp:consent-change";
/** Window-event om de voorkeuren-balk/modal te heropenen (footer-link). */
export const CONSENT_OPEN_EVENT = "repp:consent-open";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

function readCookie(): StoredConsent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      decodeURIComponent(raw.slice(COOKIE_NAME.length + 1)),
    ) as StoredConsent;
    // Verlopen of oude schema-versie -> behandel als "nog niet gekozen".
    if (parsed.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCookie(choice: ConsentChoice): StoredConsent {
  const stored: StoredConsent = {
    ...choice,
    v: CONSENT_VERSION,
    ts: new Date().toISOString(),
  };
  if (typeof document === "undefined") return stored;
  const expires = new Date(
    Date.now() + CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toUTCString();
  const value = encodeURIComponent(JSON.stringify(stored));
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Lax${secure}`;
  return stored;
}

/** Huidige opgeslagen keuze, of null als er nog niet gekozen is. */
export function getConsent(): StoredConsent | null {
  return readCookie();
}

/** Heeft de bezoeker al een (geldige, niet-verlopen) keuze gemaakt? */
export function hasConsentDecision(): boolean {
  return readCookie() !== null;
}

/** Vertaal een keuze naar de vier Consent Mode v2-signalen en stuur ze. */
function applyToGtag(choice: ConsentChoice): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
  });
}

/**
 * Leg een keuze vast: schrijf cookie, update Consent Mode, en broadcast
 * een window-event zodat de Meta Pixel-loader (en evt. andere listeners)
 * meteen kunnen reageren. Returnt de opgeslagen keuze.
 */
export function setConsent(choice: ConsentChoice): StoredConsent {
  const stored = writeCookie(choice);
  applyToGtag(choice);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }),
    );
  }
  return stored;
}

/**
 * Her-signaleer een reeds opgeslagen keuze naar Consent Mode (bij elke page
 * load). Doet niets als er nog niet gekozen is — dan geldt de default-denied
 * staat uit het inline script. Broadcast óók het event zodat de Pixel bij
 * een terugkerende bezoeker met marketing-consent alsnog laadt.
 */
export function reapplyStoredConsent(): StoredConsent | null {
  const stored = readCookie();
  if (!stored) return null;
  const choice: ConsentChoice = {
    analytics: stored.analytics,
    marketing: stored.marketing,
  };
  applyToGtag(choice);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }),
    );
  }
  return stored;
}

/** Shortcuts voor de twee één-tik-knoppen. */
export const ACCEPT_ALL: ConsentChoice = { analytics: true, marketing: true };
export const REJECT_ALL: ConsentChoice = { analytics: false, marketing: false };

/** Open de voorkeuren opnieuw (bv. vanaf een footer-link). */
export function openConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
