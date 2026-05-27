import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
  // Favicon: app/icon.svg wordt automatisch gepicked door Next.js
  // (App Router convention). De .ico is verwijderd zodat 'ie niet
  // overrides. Geen apple-touch-icon yet (PNG vereist) — modern iOS
  // gebruikt de SVG ook.
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

  return (
    <html lang="nl" className={`${montserrat.variable} h-full antialiased`}>
      <head>
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

        {/* Meta Pixel — fired event-based vanuit client components via
            lib/metaPixel.ts. Lead-event triggert bij eerste walk-in lead
            (LeadCaptureForm submit success). Optimaliseert ad-campagnes
            op echte conversies, niet op page-views. PageView fired hier
            wel eenmalig zodat retargeting-audience op site-bezoek werkt. */}
        {metaPixelId && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
            </Script>
            <noscript>
              {/* Fallback voor users met JS disabled — moet IN body
                  per HTML5 spec. Next.js noscript in head wordt door
                  Next automatisch verplaatst naar correct positie. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        {children}
      </body>
    </html>
  );
}
