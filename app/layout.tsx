import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import AttributionTracker from "@/components/analytics/AttributionTracker";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import ConsentBanner from "@/components/consent/ConsentBanner";
import MetaPixelLoader from "@/components/consent/MetaPixelLoader";
import "./globals.css";

// Cookiebeleid-link voor de consent-banner. Wijs naar de pagina/verklaring
// die uitlegt welke cookies we plaatsen (vereist voor informed consent).
const PRIVACY_HREF = "/cookiebeleid";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewportFit cover voor iPhone-notch / dynamic island — content kan tot
  // randen lopen, env(safe-area-inset-*) regelt padding waar nodig.
  viewportFit: "cover",
  themeColor: "#0f0f70",
};

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "De Hofman, Haarlem | REPP Bedrijfsmakelaar",
    template: "%s | De Hofman",
  },
  description:
    "Koop je eigen bedrijfsunit in De Hofman, Waarderpolder Haarlem. 14 hoogwaardige units vanaf €239.500 v.o.n. — zonder overdrachtsbelasting. Plug-and-play opgeleverd Q3 2027.",
  applicationName: "De Hofman · REPP",
  authors: [{ name: "REPP Bedrijfsmakelaar", url: "https://repp.nl" }],
  creator: "REPP Bedrijfsmakelaar",
  publisher: "REPP Bedrijfsmakelaar",
  category: "real estate",
  formatDetection: {
    email: false,
    telephone: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "De Hofman",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@repp_nl",
  },
  // Favicon: app/icon.png (1000x1000, vierkant) wordt automatisch
  // gepicked door Next.js (App Router convention). Vierkant + raster
  // zodat Google 'm als zoekresultaat-favicon accepteert; de oude brede
  // wordmark-SVG werd door Google afgekeurd (niet vierkant → globe).
  alternates: {
    canonical: getSiteUrl(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Meta Pixel ID via env. Niet gezet -> Pixel-script wordt niet geladen
  // en de helpers (lib/metaPixel.ts) zijn no-op. Zo kunnen we op dev /
  // preview omgevingen zonder Pixel draaien en op productie de Pixel
  // simpelweg via Vercel env var aan zetten.
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

  // Google Tag Manager-container via env. Niet gezet -> GTM wordt niet geladen
  // (dev/preview draait zonder). In productie zet je NEXT_PUBLIC_GTM_ID op de
  // container-ID (GTM-XXXXXXX); van daaruit beheer je Google Ads/GA4-tags
  // zonder code-deploy. Consent Mode v2 (default-denied hierboven) gate't de
  // cookies; conversie-events komen binnen via de dataLayer-push in lib/track.
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

  return (
    <html lang="nl" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        {/* Google Consent Mode v2 — MOET vóór alle Google-tags (GTM/Ads/GA4)
            én vóór de Meta Pixel-loader draaien. Zet alle toestemming default
            op "denied" (opt-in). De banner stuurt daarna een `update` zodra de
            bezoeker kiest. functionality/security_storage staan granted want
            dat zijn noodzakelijke, niet-tracking cookies. wait_for_update geeft
            de banner even tijd voordat tags eventueel cookieloos vuren. */}
        <Script id="consent-mode-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);`}
        </Script>

        {/* Meta domain verification voor dehofman.nl. Vereist door Meta
            Business Manager om iOS 14+ attribution + Aggregated Event
            Measurement te kunnen gebruiken. Tag MOET in <head> staan,
            anders faalt Meta's crawler. */}
        <meta
          name="facebook-domain-verification"
          content="isp530fvb5yb9qmcpcoeqjsuyyakap"
        />

        {/* Plausible analytics — privacy-friendly, geen cookies, geen PII.
            afterInteractive = laadt na page-interactive zodat LCP/INP niet wordt
            geraakt. Project script-tag van Plausible.io. */}
        <Script
          defer
          src="https://plausible.io/js/pa-eFSYAFqqhvm0T_2-rG-QC.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>

        {/* Meta Pixel wordt NIET meer onvoorwaardelijk hier geladen. Sinds de
            consent-gate laadt 'ie via <MetaPixelLoader> in de body, pas nadat
            de bezoeker marketing-cookies accepteert (AVG/ePrivacy). De helpers
            in lib/metaPixel.ts blijven no-op zolang window.fbq nog niet bestaat. */}
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        {/* Google Tag Manager (Consent Mode v2 advanced). Laadt altijd; de
            default-denied staat hierboven zorgt dat Google-tags zonder
            toestemming alleen cookieloos pingen. Geen gtmId -> no-op. */}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {/* Legt marketing-herkomst (utm/fbclid/gclid) vast in repp_attr cookie
            zodat conversie-events alleen voor betaald ad-verkeer vuren. */}
        <AttributionTracker />
        {/* Meta Pixel achter de marketing-consent. Geen pixelId -> no-op. */}
        {metaPixelId && <MetaPixelLoader pixelId={metaPixelId} />}
        {children}
        {/* Cookie-consent banner (Consent Mode v2). Niet-blokkerend; regelt de
            toestemming voor GA4/Google Ads (via Consent Mode) én de Meta Pixel. */}
        <ConsentBanner privacyHref={PRIVACY_HREF} />
      </body>
    </html>
  );
}
