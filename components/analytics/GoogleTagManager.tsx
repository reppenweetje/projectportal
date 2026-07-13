import Script from "next/script";

/**
 * Google Tag Manager — geladen via Consent Mode v2 *advanced*.
 *
 * GTM laadt op ELKE pageload (niet achter de banner), maar de default-denied
 * consent-staat staat al vóór dit script (in app/layout.tsx head). Gevolg:
 *   - Zonder toestemming: Google-tags (Ads/GA4) sturen alleen cookieloze
 *     pings → conversies worden nog steeds geteld/gemodelleerd, maar er komen
 *     geen cookies/persoonsgegevens → AVG/ePrivacy-proof.
 *   - Na "Accepteren" (marketing): de banner stuurt `consent update` en de
 *     tags schakelen naar volledige, cookie-gebaseerde meting.
 *
 * ID komt uit NEXT_PUBLIC_GTM_ID. Niet gezet -> component rendert niets, dus
 * dev/preview draait zonder GTM (identiek patroon aan de Meta Pixel).
 *
 * Conversie-events komen binnen via de dataLayer-push in lib/track.ts; koppel
 * die in de GTM-UI aan een Custom Event-trigger + Google Ads-conversietag.
 */
export default function GoogleTagManager({
  gtmId,
}: {
  gtmId: string;
}): React.ReactElement {
  return (
    <>
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="gtm"
        />
      </noscript>
    </>
  );
}
