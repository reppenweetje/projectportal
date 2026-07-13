"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, getConsent, type ConsentChoice } from "@/lib/consent";

/**
 * Laadt de Meta Pixel UITSLUITEND nadat de bezoeker marketing-cookies heeft
 * geaccepteerd. Voorheen laadde de Pixel onvoorwaardelijk in layout.tsx —
 * dat plaatste cookies vóór toestemming (AVG/ePrivacy-overtreding). Nu:
 *
 *   - Bij mount lezen we het opgeslagen consent-cookie. Marketing granted
 *     -> Pixel laden (init + PageView).
 *   - We luisteren naar CONSENT_EVENT zodat de Pixel meteen laadt op het
 *     moment dat de bezoeker in de banner "Accepteren" tikt, zonder reload.
 *   - De helpers in lib/metaPixel.ts blijven no-op zolang window.fbq nog
 *     niet bestaat (dus vóór toestemming vuurt er niks).
 *
 * Zonder pixelId (env var niet gezet) rendert dit niks — identiek gedrag
 * als voorheen op dev/preview.
 */
export default function MetaPixelLoader({
  pixelId,
}: {
  pixelId: string;
}): React.ReactElement | null {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    // Reeds eerder toestemming gegeven? Dan meteen laden.
    if (getConsent()?.marketing) {
      setLoad(true);
      return;
    }
    // Anders wachten op een keuze in de banner.
    const onChange = (e: Event) => {
      const choice = (e as CustomEvent<ConsentChoice>).detail;
      if (choice?.marketing) setLoad(true);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!load) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
    </>
  );
}
