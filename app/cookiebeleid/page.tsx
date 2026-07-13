import type { Metadata } from "next";
import Link from "next/link";
import ConsentPreferencesButton from "@/components/consent/ConsentPreferencesButton";

export const metadata: Metadata = {
  title: "Cookiebeleid",
  description:
    "Welke cookies De Hofman (REPP) plaatst, met welk doel en hoe je je toestemming beheert.",
};

/**
 * Cookiebeleid — de "informed consent"-onderbouwing waar de banner naar linkt.
 * Bevat de concrete, dehofman-specifieke cookietabel (die de generieke REPP-
 * privacyverklaring niet heeft) plus een knop om de keuze te wijzigen.
 *
 * Let op: de tabel is opgesteld op basis van wat de site technisch plaatst.
 * Laat de definitieve tekst + bewaartermijnen aftikken door de FG van REPP
 * (JM van den Heuvel, jann@repp.nl) voordat je hem als juridisch eindpunt ziet.
 */

type Cookie = {
  naam: string;
  door: string;
  doel: string;
  bewaartermijn: string;
};

const FUNCTIONEEL: Cookie[] = [
  {
    naam: "repp_consent",
    door: "De Hofman",
    doel: "Onthoudt je cookiekeuze zodat we het niet telkens opnieuw vragen.",
    bewaartermijn: "6 maanden",
  },
  {
    naam: "dh_session",
    door: "De Hofman",
    doel: "Beveiligde sessie voor het afgeschermde portaal (inloggen).",
    bewaartermijn: "7 dagen",
  },
  {
    naam: "dh_profile",
    door: "De Hofman",
    doel: "Herkent een terugkerende bezoeker die eerder zijn gegevens achterliet.",
    bewaartermijn: "Enkele maanden",
  },
  {
    naam: "repp_lead",
    door: "De Hofman",
    doel: "Vult formulieren vast in voor een bekende bezoeker.",
    bewaartermijn: "Enkele maanden",
  },
];

const ANALYTICS: Cookie[] = [
  {
    naam: "Plausible (geen cookie)",
    door: "Plausible Analytics",
    doel: "Anoniem, cookieloos bezoek meten. Plaatst geen cookie en verwerkt geen persoonsgegevens — draait daarom altijd.",
    bewaartermijn: "n.v.t.",
  },
  {
    naam: "_ga, _ga_*",
    door: "Google Analytics 4",
    doel: "Meet hoe bezoekers de site gebruiken, om 'm te verbeteren.",
    bewaartermijn: "Tot 2 jaar",
  },
];

const MARKETING: Cookie[] = [
  {
    naam: "_fbp",
    door: "Meta (Facebook) Pixel",
    doel: "Meet advertentie-conversies en bouwt doelgroepen voor Meta-advertenties.",
    bewaartermijn: "3 maanden",
  },
  {
    naam: "_gcl_au",
    door: "Google Ads",
    doel: "Meet advertentie-conversies en koppelt bezoek aan een advertentieklik.",
    bewaartermijn: "3 maanden",
  },
  {
    naam: "repp_attr",
    door: "De Hofman",
    doel: "Onthoudt via welke advertentie je binnenkwam, zodat een conversie aan de juiste campagne wordt toegeschreven.",
    bewaartermijn: "90 dagen",
  },
  {
    naam: "repp_lead_fired",
    door: "De Hofman",
    doel: "Voorkomt dat één persoon meerdere keren als conversie wordt geteld.",
    bewaartermijn: "6 maanden",
  },
];

function CookieTable({ title, intro, rows }: {
  title: string;
  intro: string;
  rows: Cookie[];
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-repp-navy">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{intro}</p>
      <div className="mt-4 overflow-x-auto rounded-card border border-repp-gray">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface-muted text-xs uppercase tracking-wide text-repp-navy/60">
              <th className="px-4 py-3 font-semibold">Cookie</th>
              <th className="px-4 py-3 font-semibold">Door</th>
              <th className="px-4 py-3 font-semibold">Doel</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Bewaartermijn
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.naam} className="border-t border-repp-gray/60">
                <td className="px-4 py-3 font-mono text-xs text-ink">
                  {c.naam}
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.door}</td>
                <td className="px-4 py-3 text-ink-soft">{c.doel}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {c.bewaartermijn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CookiebeleidPage() {
  return (
    <main className="flex-1 bg-surface-muted">
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-repp-navy/50">
          De Hofman · REPP
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-repp-navy">
          Cookiebeleid
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Deze site gebruikt cookies. Noodzakelijke cookies staan altijd aan —
          die zijn nodig om de site te laten werken. Analytics- en
          marketing­cookies plaatsen we alleen met jouw toestemming. Je keuze
          leg je vast in de banner en kun je hieronder altijd wijzigen.
        </p>

        <div className="mt-6">
          <ConsentPreferencesButton />
        </div>

        <CookieTable
          title="Noodzakelijk"
          intro="Altijd actief. Zorgen dat de site werkt en veilig is; hiervoor is geen toestemming nodig."
          rows={FUNCTIONEEL}
        />
        <CookieTable
          title="Analytics"
          intro="Om te meten hoe de site gebruikt wordt, zodat we 'm kunnen verbeteren. Plausible is cookieloos en draait altijd; Google Analytics plaatsen we alleen na toestemming."
          rows={ANALYTICS}
        />
        <CookieTable
          title="Marketing"
          intro="Om advertenties op Google en Meta relevanter te maken en conversies te meten. Alleen na jouw toestemming."
          rows={MARKETING}
        />

        <section className="mt-12 rounded-card border border-repp-gray bg-surface p-6">
          <h2 className="text-lg font-bold text-repp-navy">
            Privacy &amp; je rechten
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Hoe REPP met je persoonsgegevens omgaat — en hoe je die kunt inzien,
            corrigeren of laten verwijderen — lees je in de volledige
            privacyverklaring.
          </p>
          <p className="mt-4">
            <a
              href="/privacyverklaring.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-repp-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Privacyverklaring (PDF)
            </a>
          </p>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Vragen over cookies of privacy? Mail{" "}
            <a
              href="mailto:info@repp.nl"
              className="underline underline-offset-2 hover:text-ink"
            >
              info@repp.nl
            </a>
            . Functionaris Gegevensbescherming: JM van den Heuvel (jann@repp.nl).
          </p>
        </section>

        <p className="mt-10 text-sm">
          <Link
            href="/"
            className="text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            ← Terug naar de site
          </Link>
        </p>
      </div>
    </main>
  );
}
