export type UnitStatus =
  | "available"
  | "in_optie"
  | "verkocht_ovb"
  | "sold"
  | "coming_soon";

export type UnitType = "L" | "XL" | "XXL";

export type Unit = {
  number: number;
  slug: string;
  type: UnitType;
  m2BVO: number;
  m2BeganeGrond: number;
  m2EersteVerdieping: number;
  m2TweedeVerdieping: number | null;
  layers: 2 | 3;
  prijsExBtw: number;
  prijsZonderWoningExBtw?: number;
  vvePerMaand: number;
  status: UnitStatus;
  metBedrijfsgebondenWoning?: boolean;
};

export type UnitSpecs = {
  vrijeHoogteBeganeGrond: string;
  vrijeHoogteEersteVerdieping: string;
  vrijeHoogteTweedeVerdieping?: string;
  vloerbelastingBeganeGrond: string;
  vloerbelastingEersteVerdieping: string;
  overheaddeur: string;
  elektra: string;
  parkeerplaats: string;
};

export type Persona = {
  key: "vakman" | "creatief" | "mkb" | "belegger";
  label: string;
  hookHero: string;
  primaryCtaLabel: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  /** Higher = more prominent. Hero = 100, secondary = 50, etc. */
  weight?: number;
};

export type ProjectDocument = {
  slug: string;
  label: string;
  body: string;
  group: "essentieel" | "juridisch";
  href: string;
  /** File size in MB, for UI hint */
  sizeMb?: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  pullQuote?: string;
  author: string;
  company: string;
  unitContext?: string; // "Unit 2 + 3 (gekoppeld)", "XL unit", etc.
  /** Initials for avatar fallback when no photo */
  initials: string;
  /** Optional photo URL */
  photoSrc?: string;
  /** Which audience this resonates with most */
  audience?: "vakman" | "mkb" | "creatief" | "belegger";
};

export type TrustPartner = {
  name: string;
  role: string; // "Ontwikkelaar", "Bouwer", etc.
  logoSrc?: string;
  href?: string;
};

export type Faq = {
  q: string;
  a: string;
};

export type PriceBenchmark = {
  label: string;
  sublabel: string;
  pricePerM2: number;
  isHofman?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  city: string;
  address: string;
  totalUnits: number;
  vveInitial: number;
  units: Unit[];
  defaultSpecsByType: Record<UnitType, UnitSpecs>;
  personas: Persona[];
  prijsVergelijking: {
    marktPerM2Min: number;
    marktPerM2Max: number;
    eigenPerM2: number;
  };
  /** Concrete benchmark vergelijking voor /prijs pagina */
  prijsBenchmarks: PriceBenchmark[];
  whatsAppNumber: string;
  makelaar: { name: string; role: string; phone: string };
  beleggingsSpecialist: { name: string; role: string; phone: string };
  rendementBrutoMin: number;
  rendementBrutoMax: number;
  /** Hero image for top of pages */
  heroImage: ProjectImage;
  /** Gallery images (renders, impressies) */
  gallery: ProjectImage[];
  /** Optional video file URL */
  videoSrc?: string;
  /** Optional poster image for video (defaults to heroImage) */
  videoPoster?: string;
  documents: ProjectDocument[];
  testimonials: Testimonial[];
  trustPartners: TrustPartner[];
  faqs: Faq[];
};

export const formatEuro = (amount: number): string =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatM2 = (m2: number): string =>
  `${m2.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} m²`;
