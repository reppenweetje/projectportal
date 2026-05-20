/**
 * Middleware — clean URLs in single-project mode.
 *
 * Wanneer env-var NEXT_PUBLIC_DEFAULT_PROJECT gezet is (bv. 'de-hofman'):
 *
 *  - Requests naar `/de-hofman/...` worden 301 ge-redirect naar `/...`
 *    (browser URL wordt schoon)
 *  - Requests naar `/...` (clean) worden intern gerewrite naar `/de-hofman/...`
 *    (server rendert juiste route, browser URL blijft schoon)
 *
 * Wanneer env-var NIET gezet is: middleware is no-op (multi-project mode).
 *
 * Middleware draait ÉÉN keer per request — rewrites re-triggeren niet,
 * dus geen loops zoals bij next.config rewrites+redirects-combinatie.
 */

import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_PROJECT = process.env.NEXT_PUBLIC_DEFAULT_PROJECT?.trim();

export function middleware(request: NextRequest) {
  if (!DEFAULT_PROJECT) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const projectPrefix = `/${DEFAULT_PROJECT}`;

  // 1) /de-hofman exact → redirect naar /
  if (pathname === projectPrefix) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }

  // 2) /de-hofman/X → redirect naar /X (browser URL wordt schoon)
  if (pathname.startsWith(`${projectPrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(projectPrefix.length);
    return NextResponse.redirect(url, 301);
  }

  // 3) / clean → rewrite naar /de-hofman (intern, browser blijft op /)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = projectPrefix;
    return NextResponse.rewrite(url);
  }

  // 4) /X (alle overige) → rewrite naar /de-hofman/X
  // Matcher hieronder excluded al /api, /admin, /_next, static files.
  const url = request.nextUrl.clone();
  url.pathname = `${projectPrefix}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip:
  //  - /_next (Next.js internals)
  //  - /api (API routes — die staan op root, niet onder [projectSlug])
  //  - /admin (admin dashboard, eigen route)
  //  - /favicon.ico, /robots.txt, /sitemap.xml, /opengraph-image*
  //  - alles met een extensie (.png, .jpg, .svg, etc.) — statische assets
  matcher: [
    '/((?!_next|api|admin|favicon|robots|sitemap|opengraph-image|.*\\..*).*)',
  ],
};
