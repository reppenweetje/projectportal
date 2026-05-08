import Link from "next/link";
import type { Project } from "@/lib/types";

export function PathChooser({ project }: { project: Project }) {
  return (
    <section className="px-5 pb-24 md:pb-32 pt-24 md:pt-32">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
          Twee paden
        </p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
          Wat past bij jou?
        </h2>
      </div>
      <div className="mx-auto max-w-3xl grid sm:grid-cols-2 gap-4">
        <PathTile
          href={`/${project.slug}/bereken?modus=ondernemer`}
          eyebrow="Voor mijn bedrijf"
          title="Eigen pand"
          body="Lagere maandlast dan huur. Vermogen opbouwen in je eigen vastgoed."
          cta="Bereken + reserveer"
        />
        <PathTile
          href={`/${project.slug}/bereken?modus=belegger`}
          eyebrow="Als belegging"
          title="6–8% bruto"
          body="Schaars MRA-vastgoed met laag leegstandsrisico. Indicatief rendement."
          cta="Bereken rendement"
          accent
        />
      </div>
    </section>
  );
}

function PathTile({
  href,
  eyebrow,
  title,
  body,
  cta,
  accent = false,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-2xl p-7 md:p-8 transition border ${
        accent
          ? "bg-repp-navy text-white border-repp-navy hover:bg-repp-blue"
          : "bg-white text-repp-navy border-repp-gray hover:border-repp-navy hover:shadow-md"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wider font-semibold ${
          accent ? "text-repp-yellow" : "text-repp-navy/60"
        }`}
      >
        {eyebrow}
      </p>
      <p className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
        {title}
      </p>
      <p
        className={`mt-3 text-sm leading-relaxed ${
          accent ? "text-white/80" : "text-repp-navy/70"
        }`}
      >
        {body}
      </p>
      <p
        className={`mt-6 text-sm font-semibold inline-flex items-center gap-1 ${
          accent ? "text-repp-yellow" : "text-repp-blue"
        }`}
      >
        {cta} <span className="group-hover:translate-x-0.5 transition">→</span>
      </p>
    </Link>
  );
}
