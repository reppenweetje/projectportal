"use client";

import { openConsentPreferences } from "@/lib/consent";

/**
 * Heropent de cookie-voorkeuren (banner in voorkeuren-modus). Voldoet aan de
 * wettelijke eis dat toestemming even makkelijk in te trekken/wijzigen is als
 * te geven. Plaats op de cookiebeleid-pagina en desgewenst in de footer.
 */
export default function ConsentPreferencesButton({
  className,
  children = "Cookievoorkeuren wijzigen",
}: {
  className?: string;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className={
        className ??
        "rounded-full border border-repp-navy px-5 py-2.5 text-sm font-semibold text-repp-navy transition hover:bg-repp-navy/5"
      }
    >
      {children}
    </button>
  );
}
