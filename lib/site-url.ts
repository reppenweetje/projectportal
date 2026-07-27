/**
 * Canonieke site-URL — één bron voor metadataBase, canonical, robots en
 * sitemap. Voorheen stond deze functie 4x los gekopieerd (layout, sitemap,
 * robots, [projectSlug]/page); nu centraal.
 *
 * WWW-normalisatie: het apex-domein dehofman.nl 307't naar www.dehofman.nl
 * (Vercel primary domain = www). Als canonical/robots/sitemap dan naar de
 * apex wijzen, stuurt Google naar een URL die meteen wegredirect. Dat maakt
 * de host-koppeling dubbelzinnig — o.a. de favicon in de zoekresultaten/ads
 * hangt aan het canonieke domein. We forceren daarom het apex-domein hier
 * hard naar www, ongeacht wat NEXT_PUBLIC_SITE_URL is gezet. Andere hosts
 * (Vercel-previews, localhost, een toekomstig domein) blijven ongemoeid.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");

  const clean = raw.replace(/\/$/, "");

  // Alleen het kale apex-domein dehofman.nl -> www.dehofman.nl. De lookahead
  // (?=$|/) zorgt dat we de hele host matchen en niet iets als
  // dehofman.nl.voorbeeld.com.
  return clean.replace(
    /^https:\/\/dehofman\.nl(?=$|\/)/,
    "https://www.dehofman.nl",
  );
}
