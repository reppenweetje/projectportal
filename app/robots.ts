/**
 * robots.txt — laat alles crawlen, verwijs naar sitemap.
 *
 * Auto-gegenereerd op /robots.txt.
 */

import type { MetadataRoute } from 'next';

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/reserveren', // form-flow, niet nuttig voor crawlers
          '/welkom',     // verificatie-flow, persoonlijk
          '/admin',      // dashboard
          '/api/',       // mock endpoints
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
