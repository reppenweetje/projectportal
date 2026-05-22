import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basis security headers — Vercel zet HSTS al automatisch op het edge,
  // deze dekken extra surfaces. Geen CSP omdat we Plausible inline
  // bootstrap én next/script gebruiken — strict-CSP zou die breken.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Voorkomt MIME-sniff exploits (browser raadt content-type)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Voorkomt clickjacking (iframe-embedding van onze site door
          // andere domains; Vercel deploy-preview gebruikt geen iframes)
          { key: "X-Frame-Options", value: "DENY" },
          // Stuur Referer alleen bij dezelfde origin om PII-lek in
          // URL-paden naar third-parties (analytics, embedded fonts) te
          // beperken. Bij cross-origin alleen scheme+host, geen path.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Sluit alle device-features uit waar we geen permissie voor
          // hoeven te vragen. Voorkomt dat third-party scripts via
          // <iframe>-embed microfoon/camera/locatie kunnen aanvragen.
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()",
              "payment=()",
              "usb=()",
              "magnetometer=()",
              "accelerometer=()",
              "gyroscope=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
