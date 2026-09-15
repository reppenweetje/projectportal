/**
 * Invullingen van de XXL-unit (unit 14), gedeeld door de carrousel op /xxl
 * en het grid op de homepage.
 *
 * Bewust een losse module zonder "use client": data die uit een
 * client-component wordt geïmporteerd komt in een server-component aan als
 * client-referentie, niet als array.
 */

export type UseCase = {
  src: string;
  alt: string;
  title: string;
  body: string;
};

/** Gedeeld met de homepage, die dezelfde invullingen als grid toont. */
export const USE_CASES: UseCase[] = [
  {
    src: "/images/hofman/xxl/xxl-boutique.jpg",
    alt: "XXL-unit ingericht als boutique met kledingrekken, spiegels en een loungehoek",
    title: "Boutique of showroom",
    body: "Grote glasgevel en volop daglicht aan de zichtzijde. Dé plek om je merk of collectie te tonen.",
  },
  {
    src: "/images/hofman/xxl/xxl-studio.jpg",
    alt: "XXL-unit als creatief bureau met werkplekken, moodboards en designposters",
    title: "Creatief bureau of studio",
    body: "Rustige verdiepingen met veel licht en uitzicht over de polder. Een studio of bureau voor je team.",
  },
  {
    src: "/images/hofman/xxl/xxl-magazijn.jpg",
    alt: "Begane grond van de XXL-unit als magazijn met stellingen, pallets en een palletwagen",
    title: "Opslag & distributie",
    body: "Stellingen, pallets en een brede entree op de begane grond: ruimte voor voorraad, webshop-fulfilment en verzending.",
  },
  {
    src: "/images/hofman/xxl/xxl-kantoor-koffiehoek.jpg",
    alt: "Verdieping van de XXL-unit als kantoor met werkplekken en een eigen koffiehoek met pantry",
    title: "Kantoor met pantry",
    body: "Werkplekken, een vergaderhoek en een eigen koffiehoek met pantry op de verdieping.",
  },
  {
    src: "/images/hofman/xxl/xxl-werkvoorbereiding.jpg",
    alt: "Verdieping van de XXL-unit als werkvoorbereidingskantoor met planborden, bureau en gereedschap",
    title: "Werkvoorbereiding & installatie",
    body: "Werkvoorbereiding, planning en administratie op één plek, met je materiaal en gereedschap binnen handbereik.",
  },
  {
    src: "/images/hofman/xxl/xxl-werkplaats.jpg",
    alt: "Begane grond van de XXL-unit als werkplaats met gereedschapswand en werkbank",
    title: "Werkplaats",
    body: "Begane grond met vrije hoogte van 3,69 m, gereedschapswand en werkbanken, plus opslag onder één dak.",
  },
  {
    src: "/images/hofman/xxl/xxl-dakterras.jpg",
    alt: "Eigen dakterras van de XXL-unit met loungeset en beplanting",
    title: "Eigen dakterras",
    body: "42,5 m² dakterras bovenop de unit voor pauzes, borrels of het ontvangen van klanten.",
  },
];
