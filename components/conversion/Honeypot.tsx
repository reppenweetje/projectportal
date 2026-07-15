"use client";

import { HONEYPOT_FIELD } from "@/lib/botGuard";

/**
 * Visueel verborgen honeypot-veld. Een mens ziet en bereikt dit nooit (off-
 * screen, aria-hidden, tabIndex -1). Bots vullen het wel in — zie lib/botGuard.ts.
 *
 * Controlled via value/onChange zodat het formulier de waarde mee kan sturen
 * in de fetch-body (server-side dubbele check).
 */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      {/* Geen zichtbaar <label> (bv. "Bedrijfsnaam"): autofill leest ook
          label-tekst en zou het veld dan alsnog voor een echte bezoeker
          invullen. Alleen een neutrale name + autocomplete=off. */}
      <input
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
