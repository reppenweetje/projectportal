import type { Project } from "@/lib/types";

/**
 * ProjectJsonLd — structured-data voor het project, voor rich Google-results.
 *
 * Gebruikt Schema.org's "RealEstateListing" + "Place" types. Renders 2
 * losse JSON-LD scripts:
 *   1. RealEstateListing — het hele blok als 1 listing met aantal units
 *   2. Organization — REPP als verkoper / makelaar
 *
 * Niet-blocking want script-tag in body wordt door crawlers parsed maar
 * niet uitgevoerd. Geen invloed op LCP.
 */
export function ProjectJsonLd({
  project,
  baseUrl,
}: {
  project: Project;
  baseUrl: string;
}) {
  const availableUnits = project.units.filter(
    (u) => u.status === "available" || u.status === "in_optie",
  );
  const minPrice = availableUnits.length
    ? Math.min(...availableUnits.map((u) => u.prijsExBtw))
    : project.units[0].prijsExBtw;

  const listing = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${project.name}, ${project.city}`,
    description: `${project.tagline} ${project.totalUnits} hoogwaardige bedrijfsunits in ${project.city}, Waarderpolder.`,
    url: `${baseUrl}/`,
    image: project.heroImage ? `${baseUrl}${project.heroImage.src}` : undefined,
    datePosted: new Date().toISOString().slice(0, 10),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address,
      addressLocality: project.city,
      addressRegion: "Noord-Holland",
      addressCountry: "NL",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: minPrice,
      offerCount: availableUnits.length,
      availability:
        availableUnits.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    numberOfRooms: project.totalUnits,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "REPP Bedrijfsmakelaar",
    url: "https://repp.nl",
    logo: `${baseUrl}/images/logos/repp-bedrijfsmakelaar-wit.svg`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NL",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: project.makelaar?.phone,
      contactType: "sales",
      areaServed: "NL",
      availableLanguage: "Dutch",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listing) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
