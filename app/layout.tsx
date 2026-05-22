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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: getSiteUrl(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${montserrat.variable} h-full antialiased`}>
      <head>
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
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        {children}
      </body>
    </html>
  );
}
