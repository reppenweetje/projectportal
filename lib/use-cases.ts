/**
 * Invullingen van de XXL-unit (unit 14), gedeeld door de carrousel op /xxl
 * en het grid op de homepage.
 *
 * Bewust een losse module zonder "use client": data die uit een
 * client-component wordt geïmporteerd komt in een server-component aan als
 * client-referentie, niet als array.
 */

export type FloorKey = "bg" | "v1" | "v2";

export type UseCase = {
  src: string;
  alt: string;
  title: string;
  body: string;
  /** Op welke laag deze invulling hoort. Het dakterras hoort bij de 2e. */
  floor: FloorKey;
  /** Brede kaart over de volle breedte van het grid. */
  wide?: boolean;
  /** In de carrousel op /xxl. Die toont bewust een selectie. */
  featured?: boolean;
};

export type Floor = {
  key: FloorKey;
  label: string;
  /** Korte specs onder de tabs; komt uit de projectdata. */
  specs: string;
};

export const FLOORS: Floor[] = [
  {
    key: "bg",
    label: "Begane grond",
    specs:
      "60 m² · vrije hoogte 3,69 m · elektrische overheaddeur van 4 m breed en 3,50 m hoog · vloerbelasting 1.000 kg/m²",
  },
  {
    key: "v1",
    label: "1e verdieping",
    specs: "60 m² · vrije hoogte 3,21 m · vloerbelasting 250 kg/m²",
  },
  {
    key: "v2",
    label: "2e verdieping",
    specs:
      "70 m² · vrije hoogte 2,72 m · met een eigen dakterras van 42,5 m² erbij",
  },
];

/** Gedeeld met de homepage, die dezelfde invullingen als grid toont. */
export const USE_CASES: UseCase[] = [
  {
    src: "/images/hofman/xxl/xxl-boutique.jpg",
    alt: "XXL-unit ingericht als boutique met kledingrekken, spiegels en een loungehoek",
    title: "Boutique of showroom",
    body: "Grote glasgevel en volop daglicht aan de zichtzijde. Dé plek om je merk of collectie te tonen.",
    floor: "bg",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-studio.jpg",
    alt: "XXL-unit als creatief bureau met werkplekken, moodboards en designposters",
    title: "Creatief bureau of studio",
    body: "Rustige verdiepingen met veel licht en uitzicht over de polder. Een studio of bureau voor je team.",
    floor: "v2",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-magazijn.jpg",
    alt: "Begane grond van de XXL-unit als magazijn met stellingen, pallets en een palletwagen",
    title: "Opslag & distributie",
    body: "Stellingen, pallets en een brede entree op de begane grond: ruimte voor voorraad, webshop-fulfilment en verzending.",
    floor: "bg",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-kantoor-koffiehoek.jpg",
    alt: "Verdieping van de XXL-unit als kantoor met werkplekken en een eigen koffiehoek met pantry",
    title: "Kantoor met pantry",
    body: "Werkplekken, een vergaderhoek en een eigen koffiehoek met pantry op de verdieping.",
    floor: "v1",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-werkvoorbereiding.jpg",
    alt: "Verdieping van de XXL-unit als werkvoorbereidingskantoor met planborden, bureau en gereedschap",
    title: "Werkvoorbereiding & installatie",
    body: "Werkvoorbereiding, planning en administratie op één plek, met je materiaal en gereedschap binnen handbereik.",
    floor: "v2",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-werkplaats.jpg",
    alt: "Begane grond van de XXL-unit als werkplaats met gereedschapswand en werkbank",
    title: "Werkplaats",
    body: "Begane grond met vrije hoogte van 3,69 m, gereedschapswand en werkbanken, plus opslag onder één dak.",
    floor: "bg",
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-dakterras.jpg",
    alt: "Eigen dakterras van de XXL-unit met loungeset en beplanting",
    title: "Eigen dakterras",
    body: "42,5 m² dakterras bovenop de unit voor pauzes, borrels of het ontvangen van klanten.",
    floor: "v2",
    wide: true,
    featured: true,
  },
  {
    src: "/images/hofman/xxl/xxl-showroom.jpg",
    alt: "Begane grond van de XXL-unit als showroom met presentatietafels en vakkenwanden",
    title: "Showroom met presentatieruimte",
    body: "Presentatietafels en vakkenwanden, met daglicht en zicht vanaf de straat. Voor wie zijn collectie of materialen laat zien.",
    floor: "bg",
  },
  {
    src: "/images/hofman/xxl/xxl-kantoor-pantry.jpg",
    alt: "Verdieping van de XXL-unit als kantoor met vergadertafel, werkplekken en een pantry",
    title: "Kantoor met vergadertafel",
    body: "Werkplekken, een vergadertafel en een eigen pantry op één verdieping.",
    floor: "v1",
  },
  {
    src: "/images/hofman/xxl/xxl-werkplekken.jpg",
    alt: "Verdieping van de XXL-unit met bureaus langs de raampartij en een tekentafel",
    title: "Werkplekken aan het raam",
    body: "Bureaus langs de raampartij, met ruimte voor tekeningen en overleg.",
    floor: "v1",
  },
  {
    src: "/images/hofman/xxl/xxl-opslag.jpg",
    alt: "Verdieping van de XXL-unit met stellingen, een inpaktafel en rolrekken",
    title: "Voorraad en verzending",
    body: "Stellingen, een inpaktafel en rolrekken, vlak boven je werkvloer.",
    floor: "v1",
  },
];

/** De selectie voor de carrousel op /xxl. */
export const FEATURED_USE_CASES = USE_CASES.filter((u) => u.featured);

/** Invullingen per laag, in de volgorde van USE_CASES. */
export function useCasesForFloor(floor: FloorKey): UseCase[] {
  return USE_CASES.filter((u) => u.floor === floor);
}
