import Link from "next/link";
import { SECONDARY_CTA_HREF, SECONDARY_CTA_LABEL } from "@/lib/site-config";

/** "Waarom is unit 14 er nog?": het eerlijke antwoord, met de sparren-CTA. */
export function WhyStillAvailable() {
  return (
    <section className="px-5 py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
          Eerlijk antwoord
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-extrabold text-repp-navy tracking-tight">
          Waarom is unit 14 er nog?
        </h2>
        <p className="mt-4 text-repp-navy/70 leading-relaxed">
          Van de veertien units zijn er twee XXL. Het grootste en duurste type,
          met drie lagen, een dakterras en de kopligging aan de straat. De L- en
          XL-units gingen als eerste, omdat het instapmodel voor de meeste
          ondernemers past. Unit 7, de andere XXL, is verkocht onder voorbehoud
          van financiering. Unit 14 is dus geen restant. Het is de unit waar de
          meeste ruimte, de meeste zichtbaarheid en de langste beslistijd bij
          hoort.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={SECONDARY_CTA_HREF}
            data-cta="waarom"
            className="inline-flex items-center bg-repp-navy text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-repp-blue transition"
          >
            {SECONDARY_CTA_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
}
