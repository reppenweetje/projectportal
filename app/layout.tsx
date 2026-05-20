import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
    default: "REPP | Projectportal",
    template: "%s | REPP",
  },
  description:
    "REPP Projectportal: koop een bedrijfsunit in een van onze nieuwbouwprojecten.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
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
