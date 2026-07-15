"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * XxlUseCases: carrousel met invulmogelijkheden voor de XXL-unit. Toont per
 * slide een use-case (showroom, opslag, studio, werkplaats, kantoor, dakterras)
 * met een render en een korte omschrijving, zodat een ondernemer ziet wat er
 * met de 3 lagen + dakterras kan.
 *
 * Dependency-vrij: horizontale scroll-snap container (native swipe op mobile),
 * met prev/next-knoppen en dot-indicators. Combineert de nieuwe use-case-
 * renders met de bestaande XXL-beelden.
 */

type UseCase = {
  src: string;
  alt: string;
  title: string;
  body: string;
};

const USE_CASES: UseCase[] = [
  {
    src: "/images/hofman/xxl/xxl-boutique.jpg",
    alt: "XXL-unit ingericht als boutique met kledingrekken, spiegels en een loungehoek",
    title: "Boutique of showroom",
    body: "Grote glasgevel en volop daglicht aan de zichtzijde. Dé plek om je merk of collectie te tonen.",
  },
  {
    src: "/images/hofman/xxl/xxl-opslag.jpg",
    alt: "XXL-unit als opslag- en distributieruimte met stellingkasten, dozen en kledingrekken",
    title: "Opslag & distributie",
    body: "Vloerbelasting 1.000 kg/m² en een brede overheaddeur: ruimte voor voorraad, webshop-fulfilment en verzending.",
  },
  {
    src: "/images/hofman/xxl/xxl-studio.jpg",
    alt: "XXL-unit als creatief bureau met werkplekken, moodboards en designposters",
    title: "Creatief bureau of studio",
    body: "Rustige verdiepingen met veel licht en uitzicht over de polder. Een studio of kantoor voor je team.",
  },
  {
    src: "/images/hofman/xxl/xxl-werkplaats.jpg",
    alt: "Begane grond van de XXL-unit als werkplaats met gereedschapswand en werkbank",
    title: "Werkplaats",
    body: "Begane grond met vrije hoogte van 3,69 m, gereedschapswand en werkbanken, plus opslag onder één dak.",
  },
  {
    src: "/images/hofman/xxl/xxl-kantoor-pantry.jpg",
    alt: "Verdieping van de XXL-unit als kantoor met werkplekken, vergadertafel en pantry",
    title: "Kantoor met pantry",
    body: "Een hele verdieping als kantoor: werkplekken, een vergadertafel en een eigen pantry.",
  },
  {
    src: "/images/hofman/xxl/xxl-dakterras.jpg",
    alt: "Eigen dakterras van de XXL-unit met loungeset en beplanting",
    title: "Eigen dakterras",
    body: "42,5 m² dakterras bovenop de unit voor pauzes, borrels of het ontvangen van klanten.",
  },
];

export function XxlUseCases() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Bijhouden welke slide het meest in beeld is (voor de dots + knop-states).
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slideWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16 // + gap-4
      : el.clientWidth;
    setActive(Math.round(el.scrollLeft / slideWidth));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(USE_CASES.length - 1, index));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="mt-8">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {USE_CASES.map((uc) => (
          <figure
            key={uc.src}
            className="snap-start shrink-0 w-[85%] sm:w-[58%] lg:w-[46%] overflow-hidden rounded-2xl border border-repp-gray bg-white"
          >
            <div className="relative aspect-video">
              <Image
                src={uc.src}
                alt={uc.alt}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 58vw, 46vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-5">
              <p className="font-bold text-repp-navy">{uc.title}</p>
              <p className="mt-1 text-sm text-repp-navy/70 leading-relaxed">
                {uc.body}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Bediening: pijlen + dots */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          aria-label="Vorige"
          className="w-10 h-10 rounded-full border border-repp-gray bg-white text-repp-navy grid place-items-center hover:border-repp-navy/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          {USE_CASES.map((uc, i) => (
            <button
              key={uc.src}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Ga naar ${uc.title}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-6 bg-repp-navy"
                  : "w-2 bg-repp-navy/25 hover:bg-repp-navy/40"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollTo(active + 1)}
          disabled={active === USE_CASES.length - 1}
          aria-label="Volgende"
          className="w-10 h-10 rounded-full border border-repp-gray bg-white text-repp-navy grid place-items-center hover:border-repp-navy/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
