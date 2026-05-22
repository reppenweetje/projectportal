/**
 * PrivacyConsent — kleine helper-component die de privacy-zin onder
 * elk lead-capture form rendert. Centraal zodat:
 *   - URL/copy consistent is op alle plekken
 *   - tone/styling makkelijk aanpasbaar (light/dark/inline)
 *   - bij vervangen van privacy-verklaring 1 plek wijzigen
 *
 * Per AVG / GDPR: bij elke verwerking van persoonsgegevens moet de
 * gebruiker geïnformeerd zijn over wie de data ontvangt en met welk
 * doel. Een inline link onder het formulier voldoet daaraan zolang
 * de privacy-verklaring zelf compleet is.
 */

import Link from "next/link";

export const PRIVACY_POLICY_URL =
  "https://repp.nl/wp-content/uploads/2025/03/PRIVACY-VERKLARING.pdf";

type Tone = "light" | "dark" | "muted";

const TONE_CLS: Record<Tone, string> = {
  light: "text-repp-navy/55",
  dark: "text-white/55",
  muted: "text-repp-navy/40",
};

const LINK_CLS: Record<Tone, string> = {
  light: "underline hover:text-repp-navy",
  dark: "underline hover:text-white",
  muted: "underline hover:text-repp-navy/70",
};

/**
 * Default: korte zin met link naar privacy-verklaring. Plaats direct
 * onder een submit-button zodat 'akkoord met submit' impliciet ook
 * akkoord met privacy-verklaring betekent.
 */
export function PrivacyConsent({
  tone = "light",
  className = "",
  actionLabel = "verzenden",
}: {
  tone?: Tone;
  className?: string;
  /** Tekst van de submit-actie. Default "verzenden". Wordt in zin
   *  gebruikt: "Door {actionLabel} ga je akkoord met onze..."  */
  actionLabel?: string;
}) {
  return (
    <p
      className={`text-[11px] leading-relaxed ${TONE_CLS[tone]} ${className}`}
    >
      Door op {actionLabel} te klikken ga je akkoord met onze{" "}
      <Link
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLS[tone]}
      >
        privacyverklaring
      </Link>
      . We gebruiken je gegevens uitsluitend voor contact over De Hofman
      en delen ze niet met derden.
    </p>
  );
}

/**
 * Compact: alleen de link voor in een footer of secundaire context.
 */
export function PrivacyLink({
  tone = "light",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <Link
      href={PRIVACY_POLICY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs ${LINK_CLS[tone]} ${className}`}
    >
      Privacyverklaring
    </Link>
  );
}
