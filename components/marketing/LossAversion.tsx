import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatEuro } from "@/lib/types";

const HUUR_PER_M2_PER_JAAR = 165; // realistisch voor Waarderpolder
const REPRESENTATIVE_M2 = 105; // L unit

export function LossAversion({ project }: { project: Project }) {
  const { marktPerM2Min, marktPerM2Max, eigenPerM2 } = project.prijsVergelijking;
  const savingsPerM2 = marktPerM2Min - eigenPerM2; // 250
  const savingsForLUnit = savingsPerM2 * REPRESENTATIVE_M2;
  const huurPerJaar = HUUR_PER_M2_PER_JAAR * REPRESENTATIVE_M2;

  return (
    <section className="px-5 py-20 md:py-28 bg-repp-navy text-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-yellow font-semibold">
            Wat het je kost om níet te kiezen
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
            Twee keer per jaar verlies je dit.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Card
            badge="Per jaar weg aan huur"
            big={`±${formatEuro(huurPerJaar)}`}
            sub={`bij ${REPRESENTATIVE_M2} m² × €${HUUR_PER_M2_PER_JAAR}/m²/jr huur`}
            body="Geld dat je elk jaar weggeeft. Bij een eigen pand bouw je in dezelfde maandlast vermogen op, én profiteer je van waardestijging."
          />
          <Card
            badge="Voordeel t.o.v. de markt"
            big={`±${formatEuro(savingsForLUnit)}`}
            sub={`€${savingsPerM2}/m² goedkoper × ${REPRESENTATIVE_M2} m²`}
            body={`Vergelijkbare nieuwbouw in de Waarderpolder: €${marktPerM2Min.toLocaleString("nl-NL")}–€${marktPerM2Max.toLocaleString("nl-NL")}/m². Bij De Hofman: €${eigenPerM2.toLocaleString("nl-NL")}/m². Dat zit direct in jouw eigen vermogen.`}
            highlight
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${project.slug}/bereken`}
            className="inline-flex items-center bg-repp-yellow text-repp-navy font-bold px-6 py-3.5 rounded-full hover:brightness-95 transition"
          >
            Reken het uit voor jouw situatie →
          </Link>
          <Link
            href={`/${project.slug}/units`}
            className="inline-flex items-center text-white/80 hover:text-white text-sm font-semibold py-2"
          >
            Of bekijk de beschikbare units →
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-white/40 text-center">
          Indicatieve cijfers op basis van een L-unit van 105 m² en marktconforme huurprijzen.
          Aan deze indicaties kunnen geen rechten worden ontleend.
        </p>
      </div>
    </section>
  );
}

function Card({
  badge,
  big,
  sub,
  body,
  highlight,
}: {
  badge: string;
  big: string;
  sub: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 md:p-7 ${
        highlight
          ? "bg-repp-yellow/10 border-2 border-repp-yellow/40"
          : "bg-white/5 border border-white/10"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wider font-semibold ${
          highlight ? "text-repp-yellow" : "text-white/60"
        }`}
      >
        {badge}
      </p>
      <p
        className={`mt-2 text-4xl md:text-5xl font-extrabold tracking-tight ${
          highlight ? "text-repp-yellow" : "text-white"
        }`}
      >
        {big}
      </p>
      <p className="mt-1 text-sm text-white/60">{sub}</p>
      <p className="mt-4 text-sm text-white/85 leading-relaxed">{body}</p>
    </div>
  );
}
