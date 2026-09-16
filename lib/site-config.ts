/**
 * Site-config: de sitebrede waarden voor de verkoopfase "laatste unit".
 *
 * Alle schaarste-teksten, prijzen en CTA-labels komen hier vandaan zodat
 * er maar op één plek iets hoeft te veranderen als de status wijzigt.
 */

export const UNITS_TOTAL = 14;
export const UNITS_AVAILABLE = 1;
export const STATUS_DATE = "15 september 2026";

export const SCARCITY_LINE = "Nog 1 van 14 units te koop";
export const SCARCITY_LINE_SHORT = "Nog 1 van 14 te koop";

export const XXL_PRICE = 475000;
export const XXL_AREA_LABEL = "ca. 190 m²";
export const VVE_MONTHLY = 160;
export const RENT_PER_M2_YEAR = 145;

export const PRIMARY_CTA_LABEL = "Reserveer de laatste XXL-unit";
/** Iets korter, voor de desktop-navigatie naast de menu-items. */
export const PRIMARY_CTA_LABEL_NAV = "Reserveer de XXL-unit";
/** Korte variant voor krappe plekken, zoals de mobiele header. */
export const PRIMARY_CTA_LABEL_SHORT = "Reserveer";
export const PRIMARY_CTA_HREF = "/xxl#aanmelden";
export const SECONDARY_CTA_LABEL = "Ik wil de mogelijkheden bespreken";
export const SECONDARY_CTA_HREF = "/xxl?intent=sparren#aanmelden";

export const WHATSAPP_HREF =
  "https://wa.me/31617192538?text=Hallo%2C+ik+heb+interesse+in+de+laatste+XXL-unit+van+De+Hofman.";

/** Beeld van de XXL-unit dat overal als hoofdbeeld dient (hero, OG, unit-blok). */
export const UNIT14_IMAGE = "/images/hofman/xxl/xxl-voorzijde-v3.jpg";

/** Financieringsaannames, gelijk aan /bereken en /koopvshuur. */
export const FINANCE_ASSUMPTIONS = {
  ownPercent: 20,
  interestPct: 4.97,
  termYears: 25,
} as const;
