import type { Project, Unit, UnitSpecs } from "@/lib/types";

const sharedSpecsLXL: UnitSpecs = {
  vrijeHoogteBeganeGrond: "3,69 m",
  vrijeHoogteEersteVerdieping: "3,21 m",
  vloerbelastingBeganeGrond: "1.000 kg/m²",
  vloerbelastingEersteVerdieping: "250 kg/m²",
  overheaddeur: "Elektrisch, 4 m breed × 3,50 m hoog",
  elektra: "3 × 25 A, 230 V, complete verdeelkast",
  parkeerplaats: "1 eigen parkeerplaats direct voor de deur",
};

const specsXXL: UnitSpecs = {
  ...sharedSpecsLXL,
  vrijeHoogteTweedeVerdieping: "2,72 m",
};

// Verdeling volgens REPP's actuele situatieplattegrond (20-5-2026):
//   Verkocht (rood):                  1, 2, 3, 8, 9, 10
//   Verkocht onder voorbehoud (oranje): 11
//   In optie (lichtgeel):             6, 12, 13
//   Beschikbaar (groen):              4, 5
//   Coming soon (wit, XXL):           7, 14
const status = (n: number): Unit["status"] => {
  if (n === 7 || n === 14) return "coming_soon";
  if ([1, 2, 3, 8, 9, 10].includes(n)) return "sold";
  if (n === 11) return "verkocht_ovb";
  if ([6, 12, 13].includes(n)) return "in_optie";
  return "available";  // 4, 5
};

const buildUnit = (n: number): Unit => {
  if (n === 7 || n === 14) {
    return {
      number: n,
      slug: `unit-${n}`,
      type: "XXL",
      m2BVO: 191.4,
      m2BeganeGrond: 60.7,
      m2EersteVerdieping: 60.7,
      m2TweedeVerdieping: 70,
      layers: 3,
      prijsExBtw: 515500,
      // prijsZonderWoningExBtw tijdelijk weggehaald: XXL wordt vooralsnog
      // alleen aangeboden inclusief bedrijfsgebonden woning.
      vvePerMaand: 160,
      status: status(n),
      metBedrijfsgebondenWoning: true,
    };
  }
  if (n === 1 || n === 8) {
    return {
      number: n,
      slug: `unit-${n}`,
      type: "XL",
      m2BVO: 113,
      m2BeganeGrond: 56.5,
      m2EersteVerdieping: 56.5,
      m2TweedeVerdieping: null,
      layers: 2,
      prijsExBtw: 259500,
      vvePerMaand: 105,
      status: status(n),
    };
  }
  return {
    number: n,
    slug: `unit-${n}`,
    type: "L",
    m2BVO: 105,
    m2BeganeGrond: 52.5,
    m2EersteVerdieping: 52.5,
    m2TweedeVerdieping: null,
    layers: 2,
    prijsExBtw: 239500,
    vvePerMaand: 100,
    status: status(n),
  };
};

const baseRender = "/images/hofman/renders";

export const deHofman: Project = {
  slug: "de-hofman",
  name: "De Hofman",
  tagline: "Omdat Haarlem werkt.",
  city: "Haarlem",
  address: "A. Hofmanweg 23, Waarderpolder",
  totalUnits: 14,
  vveInitial: 950,
  units: Array.from({ length: 14 }, (_, i) => buildUnit(i + 1)),
  defaultSpecsByType: {
    L: sharedSpecsLXL,
    XL: sharedSpecsLXL,
    XXL: specsXXL,
  },
  personas: [
    {
      key: "vakman",
      label: "Vakman / maker",
      hookHero: "Een eigen werkplaats. Lagere maandlasten dan huur.",
      primaryCtaLabel: "Bekijk beschikbare units",
    },
    {
      key: "creatief",
      label: "Creatief / dienstverlener",
      hookHero: "Een eigen studio op een toplocatie in Haarlem.",
      primaryCtaLabel: "Bekijk beschikbare units",
    },
    {
      key: "mkb",
      label: "MKB-groeier",
      hookHero: "Showroom beneden, kantoor boven. Eén adres.",
      primaryCtaLabel: "Bekijk beschikbare units",
    },
    {
      key: "belegger",
      label: "Belegger",
      hookHero: "6–8% bruto rendement op schaars MRA-vastgoed.",
      primaryCtaLabel: "Bekijk rendement",
    },
  ],
  prijsVergelijking: {
    marktPerM2Min: 2500,
    marktPerM2Max: 3058,
    eigenPerM2: 2250,
  },
  prijsBenchmarks: [
    {
      label: "De Hofman L",
      sublabel: "Regulier",
      pricePerM2: 2281,
      isHofman: true,
    },
    {
      label: "De Hofman XL",
      sublabel: "Regulier",
      pricePerM2: 2296,
      isHofman: true,
    },
    {
      label: "Wateringweg",
      sublabel: "Bestaand 2022",
      pricePerM2: 2375,
    },
    {
      label: "Nijverheidsweg",
      sublabel: "Nieuwbouw",
      pricePerM2: 2500,
    },
    {
      label: "Beijnesweg",
      sublabel: "Nieuwbouw",
      pricePerM2: 2533,
    },
    {
      label: "Enschedéweg",
      sublabel: "Bestaand 2022",
      pricePerM2: 2539,
    },
  ],
  whatsAppNumber: "31202610080",
  makelaar: {
    name: "Makelaar REPP",
    role: "Jouw vaste contactpersoon",
    phone: "+31202610080",
  },
  beleggingsSpecialist: {
    name: "Beleggings-specialist REPP",
    role: "Voor rendement, financiering en exit-vragen",
    phone: "+31202610080",
  },
  rendementBrutoMin: 6,
  rendementBrutoMax: 8,
  heroImage: {
    // 2-eve toont De Hofman in 3/4-perspectief, DE HOFMAN-belettering staat
    // klein in de upper-right zodat de H1 "De Hofman" overlay er niet mee
    // botst. Hoofdgevel-render hero-dusk.jpg blijft beschikbaar in de
    // gallery-carrousel onder.
    src: `${baseRender}/2-eve.jpg`,
    alt: "De Hofman bij avond, schuin aanzicht met entree en parkeren",
    caption: "Impressie · De Hofman bij schemering",
  },
  gallery: [
    {
      src: `${baseRender}/hero-dusk.jpg`,
      alt: "De Hofman bij schemering, hoofdgevel met DE HOFMAN-belettering",
      caption: "Hoofdgevel bij schemering",
      weight: 100,
    },
    {
      src: `${baseRender}/aerial-roof.jpg`,
      alt: "Luchtfoto van De Hofman met dakterras op unit 27",
      caption: "Dakterras op de bovenste verdieping",
      weight: 95,
    },
    {
      src: `${baseRender}/exterior-day.jpg`,
      alt: "De Hofman 23 overdag, oprit met geparkeerde auto's",
      caption: "Hoofdentree overdag",
      weight: 90,
    },
    {
      src: `${baseRender}/facade-green.jpg`,
      alt: "Voorgevel met groene wanden en DE HOFMAN-bord",
      caption: "Groene gevel met entree",
      weight: 85,
    },
    {
      src: `${baseRender}/units-service.jpg`,
      alt: "Drie units in gebruik als service, werkplaats en koffiebranderij",
      caption: "Units zoals ze er kunnen uitzien",
      weight: 80,
    },
    {
      src: `${baseRender}/interior-showroom.jpg`,
      alt: "Showroom-interieur op de verdieping met vergadertafel en moodboards",
      caption: "Interieur eerste verdieping",
      weight: 75,
    },
    {
      src: `${baseRender}/xl-storefront.jpg`,
      alt: "XL-unit van buiten, twee entrees met Reclame-belettering",
      caption: "XL-unit met dubbele entree",
      weight: 70,
    },
    {
      src: `${baseRender}/interior-bikeshop.jpg`,
      alt: "Unit-interieur ingericht als urban e-bike showroom",
      caption: "Unit als e-bike showroom",
      weight: 65,
    },
    {
      src: `${baseRender}/interior-webshop.jpg`,
      alt: "Unit-interieur ingericht als webshop-fulfilment met dozen en fotostudio",
      caption: "Unit als webshop-fulfilment",
      weight: 60,
    },
    {
      src: `${baseRender}/2-eve.jpg`,
      alt: "Hoofdaanzicht bij avond",
      caption: "Hoofdaanzicht bij avond",
      weight: 50,
    },
    {
      src: `${baseRender}/3-eve.jpg`,
      alt: "Zijgevel met units bij avond",
      caption: "Zijgevel bij avond",
      weight: 40,
    },
  ],
  videoSrc: "/video/de-hofman.mp4",
  testimonials: [
    {
      id: "jt-bouw",
      quote:
        "Voor een aannemingsbedrijf moet je ruimte hebben: werkplaats, opslag, kantoor. Twee units koppelen geeft ons 210 m² aan eigen werkruimte op één adres. Beneden m'n machines en materiaal, boven het kantoor, busjes voor de deur. En dat voor een scherpe prijs in de Waarderpolder.",
      pullQuote: "210 m² aan eigen werkruimte op één adres.",
      author: "Jesse van Riessen",
      company: "JT Bouw",
      unitContext: "2 gekoppelde units",
      initials: "JR",
      audience: "vakman",
    },
    {
      id: "stadsbouwers",
      quote:
        "Wij hebben gekozen voor een XL-unit in De Hofman, vanwege de mooie ruimte én synergie met bevriende ondernemers in de units naast ons. De locatie, uitstraling en kwaliteit van De Hofman passen perfect bij de toekomst van ons bedrijf.",
      pullQuote: "Locatie, uitstraling en kwaliteit passen perfect.",
      author: "Jacco Kingsbergen",
      company: "De Stadsbouwers Haarlem",
      unitContext: "XL unit",
      initials: "JK",
      audience: "mkb",
    },
    {
      id: "cleaning-buddies",
      quote:
        "Vanaf het eerste gesprek voelde het persoonlijk en betrokken. De begeleiding tijdens het aankoopproces was duidelijk en prettig, daardoor hebben we met vertrouwen gekozen voor een mooie XL-unit in De Hofman.",
      pullQuote: "Met vertrouwen gekozen, duidelijk en prettig begeleid.",
      author: "Michiel",
      company: "Cleaning Buddies",
      unitContext: "XL unit",
      initials: "MC",
      audience: "creatief",
    },
  ],
  trustPartners: [
    {
      name: "REPP Bedrijfsmakelaar",
      role: "Verkoop & begeleiding",
      logoSrc: "/images/logos/repp-bedrijfsmakelaar.svg",
      href: "https://repp.nl",
    },
    {
      name: "RENO Projecten",
      role: "Bouwpartner",
      logoSrc: "/images/logos/reno-projecten.png",
      href: "https://www.reno.nl",
    },
    {
      name: "Credion",
      role: "Financieringspartner",
      logoSrc: "/images/logos/credion.webp",
      href: "https://credion.nl",
    },
  ],
  faqs: [
    {
      q: "Wat is 'v.o.n.' en zit er nog overdrachtsbelasting bovenop?",
      a: "V.o.n. staat voor Vrij Op Naam: alle kosten voor de overdracht (notaris, kadaster, splitsing) zijn al in de koopsom verwerkt. Bovendien betaal je bij nieuwbouw geen 10,4% overdrachtsbelasting. Bij een unit van €239.500 scheelt dat alleen al ruim €24.000 vergeleken met bestaande bouw. Geen verrassingen achteraf.",
    },
    {
      q: "Kan ik de BTW terugvragen?",
      a: "Ja. De 21% BTW (~€50.295 bij een L-unit) is volledig terugvorderbaar voor zowel zakelijke kopers als particuliere beleggers die de unit verhuren. Je betaalt het wel eerst, maar krijgt het in de eerstvolgende BTW-aangifte terug. Dit maakt de effectieve koopsom voor zakelijke gebruikers fors lager dan een vergelijkbare bestaande unit zonder BTW-teruggave.",
    },
    {
      q: "Hoeveel betaal ik per maand aan VVE?",
      a: "L: €100/mnd · XL: €105/mnd · XXL: €160/mnd. Daarbij komt een eenmalige initiële bijdrage van €950 om de VVE op te starten. Deze bedragen worden uiteindelijk vastgesteld door de inzittende beheerders (jullie zelf), zodra alle units bewoond zijn. De VVE dekt onderhoud van het gemeenschappelijke deel, opstalverzekering, schoonmaak en periodieke reservering voor groot onderhoud.",
    },
    {
      q: "Past mijn bedrijfsbusje en werkmateriaal er in?",
      a: "Bijna altijd ja. De begane grond heeft 3,69 m vrije hoogte, een elektrische overheaddeur van 4 m breed × 3,5 m hoog, en een vloerbelasting van 1.000 kg/m². Een gemiddelde bestelbus (Mercedes Sprinter, Ford Transit) rijdt direct naar binnen. Voor zware machines, stellingen of voorraad biedt de vloer ruim voldoende capaciteit. Twijfel je over jouw specifieke uitrusting? Stuur een appje, dan kijken we even mee.",
    },
    {
      q: "Welk rendement kan ik verwachten als belegger?",
      a: "Indicatief 6–8% bruto aanvangsrendement, afhankelijk van het unit-type, huurprijs en eigen inbreng. In de Waarderpolder liggen huren voor vergelijkbare nieuwbouw rond €145–€180 per m² per jaar. Bij een L-unit (105 m²) komt dat neer op circa €15.000–€19.000 huurinkomsten per jaar. Reken het zelf precies uit op de Bereken-pagina met jouw eigen inbreng en huurprijs. Aan deze indicatie kunnen geen rechten worden ontleend.",
    },
    {
      q: "Hoeveel eigen inbreng heb ik nodig?",
      a: "Voor eigen gebruik: zakelijke hypotheek tot circa 70% van de marktwaarde (dus 30% eigen inbreng, bij een L-unit zo'n €72.000). Voor verhuur als belegger: houd rekening met 35 tot 40% eigen inbreng. Onze partner Credion regelt vrijblijvend een financieringsscan op basis van jouw situatie. Vaak blijken de mogelijkheden gunstiger dan kopers vooraf inschatten.",
    },
    {
      q: "Wanneer is de oplevering?",
      a: "We zijn nu in de afrondende fase van de omgevingsvergunning. Verwachting: vergunning onherroepelijk binnen 6 tot 8 weken. Zodra dat rond is, start RENO Projectbouw direct met de bouw; er zit dus amper tijd tussen vergunning en eerste paal. Dat is gunstig voor jou: tussen het moment van financiering en oplevering is de doorlooptijd kort, dus minder rente over een nog niet opgeleverd pand. Indicatieve oplevering: eind 2026.",
    },
    {
      q: "Wat als ik twee units wil koppelen?",
      a: "Dat kan, en het wordt al gedaan, bijvoorbeeld door JT Bouw die twee units heeft gekoppeld voor 210 m² aan werkruimte. De units zijn slim ontworpen met schakelbare wanden, dus uitbreiden of koppelen is bouwtechnisch eenvoudig. Vraag de makelaar naar de mogelijkheden; niet alle unit-combinaties zijn even logisch, en sommige vereisen vroeg afstemmen voor de bouwspecificaties.",
    },
    {
      q: "Kan ik in een unit wonen én werken?",
      a: "De twee XXL-units (Unit 7 en 14) worden opgeleverd met bedrijfsgebonden woning op de tweede verdieping. Bedrijf op de begane grond en eerste verdieping, wonen erboven. Bij L- en XL-units is wonen niet aan de orde; dat zijn pure bedrijfsruimtes. Wil je wonen én werken? Schrijf je dan in voor de XXL-wachtlijst, je krijgt voorrang zodra ze in actieve verkoop gaan.",
    },
    {
      q: "Is de reservering bindend?",
      a: "Nee, de eerste stap is altijd vrijblijvend. Je geeft aan dat je een specifieke unit wilt, daarna nemen we contact op om alles door te spreken. Pas wanneer jij klaar bent en de financiering rond is, gaan we naar een officiële reservering met 5% aanbetaling op de notarisrekening. Dat geld staat veilig en wordt pas overgeheveld bij definitieve levering. Geen geld kwijt zonder dat je het zeker weet.",
    },
    {
      q: "Wat is de scherpste prijs van de Waarderpolder?",
      a: "Vergelijkbare nieuwbouw bedrijfsunits in de Waarderpolder kosten momenteel tussen €2.500 en €3.058 per m². Bij De Hofman zit je op €2.250 per m², en aansluitkosten voor nutsvoorzieningen (€3.000 tot €5.000 elders) zijn al inbegrepen. Dat scheelt minimaal €250 per m². Bij een L-unit van 105 m² houd je daarmee meer dan €26.000 in eigen vermogen i.p.v. in de aankoopprijs.",
    },
    {
      q: "Wat als ik nu niet beslis?",
      a: "Eerlijk: meer dan 50% is al verkocht in een paar maanden. De L-units gaan het snelst; er zijn er nog enkele vrij. Wij dwingen je niet, maar de markt is wat hij is: nieuwbouw in de Waarderpolder is schaars en wordt schaarser. Wil je niet meteen reserveren? Schrijf je dan in voor 'Hofman Insider', dan krijg je als eerste bericht over prijsindexaties, statuswijzigingen en de start van de XXL-verkoop.",
    },
  ],
  documents: [
    {
      slug: "brochure",
      label: "Brochure",
      body: "Het project compleet in beeld",
      group: "essentieel",
      href: "/docs/de-hofman/brochure.pdf",
    },
    {
      slug: "prijslijst",
      label: "Prijslijst",
      body: "Alle 14 units en koopsommen",
      group: "essentieel",
      href: "/docs/de-hofman/prijslijst.pdf",
    },
    {
      slug: "plattegronden",
      label: "Plattegronden",
      body: "Per unit-type",
      group: "essentieel",
      href: "/docs/de-hofman/plattegronden.pdf",
    },
    {
      slug: "situatietekening",
      label: "Situatietekening",
      body: "De ligging van het blok",
      group: "essentieel",
      href: "/docs/de-hofman/situatietekening.pdf",
    },
    {
      slug: "impressies",
      label: "Impressies",
      body: "Visualisaties en sfeerbeelden",
      group: "essentieel",
      href: "/docs/de-hofman/impressies.pdf",
    },
    {
      slug: "optielijst",
      label: "Optielijst",
      body: "Wat je later kunt aanpassen",
      group: "essentieel",
      href: "/docs/de-hofman/optielijst.pdf",
    },
    {
      slug: "technische-omschrijving",
      label: "Technische Omschrijving",
      body: "Bouwspecificaties in detail",
      group: "juridisch",
      href: "/docs/de-hofman/technische-omschrijving.pdf",
    },
    {
      slug: "koop-aannemingsovereenkomst",
      label: "Koop-Aannemingsovereenkomst",
      body: "Concept, voor de notaris",
      group: "juridisch",
      href: "/docs/de-hofman/koop-aannemingsovereenkomst-concept.pdf",
    },
    {
      slug: "huishoudelijk-reglement",
      label: "Huishoudelijk Reglement",
      body: "Afspraken binnen de VVE",
      group: "juridisch",
      href: "/docs/de-hofman/huishoudelijk-reglement.pdf",
    },
  ],
};

export const projects = [deHofman];

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const getUnit = (projectSlug: string, unitSlug: string) => {
  const project = getProjectBySlug(projectSlug);
  if (!project) return null;
  const unit = project.units.find((u) => u.slug === unitSlug);
  return unit ? { project, unit } : null;
};

export const countByStatus = (project: Project) => {
  const counts = {
    available: 0,
    in_optie: 0,
    verkocht_ovb: 0,
    sold: 0,
    coming_soon: 0,
  };
  for (const u of project.units) counts[u.status]++;
  return counts;
};
