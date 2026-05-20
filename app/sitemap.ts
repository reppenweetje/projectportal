/**
 * Sitemap — mode-aware.
 *
 * Single-project mode (NEXT_PUBLIC_DEFAULT_PROJECT gezet):
 *   Toont de project-URLs zonder slug-prefix (`/`, `/units`, `/units/[slug]`).
 *
 * Multi-project mode:
 *   Zou alle projecten met slug-prefix tonen. Voor nu één project.
 *
 * Auto-gegenereerd bij `next build`. Beschikbaar op /sitemap.xml.
 */

import type { MetadataRoute } from 'next';
import { projects } from '@/lib/projects/de-hofman';

const DEFAULT_PROJECT = process.env.NEXT_PUBLIC_DEFAULT_PROJECT?.trim();

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

function pathFor(slug: string, subpath?: string): string {
  if (DEFAULT_PROJECT === slug) {
    return subpath ? `/${subpath}` : '/';
  }
  return subpath ? `/${slug}/${subpath}` : `/${slug}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = projects.flatMap((project) => {
    const slug = project.slug;

    // De rijke sub-routes uit projectportal
    const subPaths = [
      { sub: '', changeFrequency: 'weekly' as const, priority: 1.0 },
      { sub: 'units', changeFrequency: 'daily' as const, priority: 0.9 },
      { sub: 'bereken', changeFrequency: 'monthly' as const, priority: 0.7 },
      { sub: 'documenten', changeFrequency: 'monthly' as const, priority: 0.7 },
      { sub: 'prijs', changeFrequency: 'monthly' as const, priority: 0.7 },
      { sub: 'info', changeFrequency: 'monthly' as const, priority: 0.6 },
      { sub: 'insider', changeFrequency: 'monthly' as const, priority: 0.5 },
      { sub: 'xxl', changeFrequency: 'monthly' as const, priority: 0.6 },
    ];

    const projectEntries = subPaths.map(({ sub, changeFrequency, priority }) => ({
      url: `${base}${pathFor(slug, sub || undefined)}`,
      lastModified: now,
      changeFrequency,
      priority,
    }));

    // Unit-detail pagina's — alleen units met echte slug
    const unitEntries = project.units
      .filter((u) => !!u.slug)
      .map((unit) => ({
        url: `${base}${pathFor(slug, `units/${unit.slug}`)}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));

    return [...projectEntries, ...unitEntries];
  });

  return entries;
}
