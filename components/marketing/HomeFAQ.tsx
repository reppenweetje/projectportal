import Link from "next/link";
import type { Faq } from "@/lib/types";
import { FAQ } from "./FAQ";
import { WhatsAppLink } from "@/components/conversion/WhatsAppLink";
import {
  PRIMARY_CTA_HREF,
  PRIMARY_CTA_LABEL,
  WHATSAPP_HREF,
} from "@/lib/site-config";

export const HOME_FAQ: Faq[] = [
  {
    q: "Hoe zit het met financiering?",
    a: "Credion is financieringspartner van De Hofman en kent het project. Zij kunnen je in een gesprek laten zien wat er mogelijk is bij jouw eigen inbreng en cijfers. We brengen je graag in contact, of je regelt het via je eigen bank of adviseur.",
  },
  {
    q: "Is de btw terug te vorderen?",
    a: "De koopsom is € 475.000 exclusief 21% btw. Als btw-ondernemer vorder je die btw terug via je aangifte. Bespreek je situatie met je boekhouder.",
  },
  {
    q: "Wat betaal ik maandelijks aan de VVE?",
    a: "De VVE-bijdrage is indicatief € 160 per maand. Daaruit worden onder meer het gezamenlijke onderhoud en de verzekering van het gebouw betaald. Het huishoudelijk reglement staat bij de documenten.",
  },
  {
    q: "Wanneer wordt opgeleverd?",
    a: "De omgevingsvergunning is onherroepelijk, de sloop is afgerond en de bouw start in oktober 2026. De verwachte oplevering is Q3 2027.",
  },
  {
    q: "Kan ik de indeling aanpassen?",
    a: "Ja. Er is een optielijst met meer- en minderwerk, en je kunt met de aannemer over aanpassingen spreken. De optielijst staat bij de documenten.",
  },
  {
    q: "Kan ik unit 14 ook koppelen met unit 7?",
    a: "Unit 7 is verkocht onder voorbehoud van financiering. Gaat die verkoop niet door, dan zijn 7 en 14 samen te koppelen tot ca. 380 m². Meld je aan, dan hoor je het als eerste.",
  },
];

/** FAQ-blok op de homepage: de zes vragen bij € 475.000. */
export function HomeFAQ() {
  return (
    <section className="px-5 py-16 md:py-24 bg-surface-muted">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Voor je belt
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            De vragen die iedereen stelt bij € 475.000
          </h2>
        </div>
        <FAQ items={HOME_FAQ} openFirst={false} />
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <Link
            href={PRIMARY_CTA_HREF}
            data-cta="faq"
            className="inline-flex items-center bg-repp-yellow text-repp-navy font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
          <WhatsAppLink
            href={WHATSAPP_HREF}
            cta="faq-whatsapp"
            className="text-sm font-semibold text-repp-navy/80 hover:text-repp-navy"
          >
            Of stel je vraag via WhatsApp →
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}
