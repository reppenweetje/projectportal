import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getUnit } from "@/lib/projects/de-hofman";
import { formatEuro, formatM2 } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { UnitStatusBadge } from "@/components/unit/UnitStatusBadge";
import { UnitGrid } from "@/components/unit/UnitGrid";
import { UnitImageCarousel } from "@/components/unit/UnitImageCarousel";
import { SaveForLater } from "@/components/unit/SaveForLater";
import { ScarcityStrip } from "@/components/marketing/ScarcityStrip";
import { buildWhatsAppLink } from "@/lib/utils";

type Params = { projectSlug: string; unitSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { projectSlug, unitSlug } = await params;
  const found = getUnit(projectSlug, unitSlug);
  if (!found) return { title: "Unit niet gevonden" };
  const { project, unit } = found;
  return {
    title: `Unit ${unit.number} (${unit.type}), ${project.name}`,
    description: `${unit.type}-unit ${formatM2(unit.m2BVO)} in ${project.name}. ${formatEuro(unit.prijsExBtw)} excl. btw.`,
  };
}

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug, unitSlug } = await params;
  const found = getUnit(projectSlug, unitSlug);
  if (!found) notFound();
  const { project, unit } = found;
  const specs = project.defaultSpecsByType[unit.type];

  const isReservable =
    unit.status === "available" || unit.status === "in_optie";
  const isWachtlijst = unit.status === "verkocht_ovb";

  // Per-type scarcity for FOMO
  const sameType = project.units.filter((u) => u.type === unit.type);
  const sameTypeAvailable = sameType.filter(
    (u) => u.status === "available",
  ).length;
  const sameTypeInOptie = sameType.filter(
    (u) => u.status === "in_optie",
  ).length;

  const waMessage = `Hallo, ik heb een vraag over Unit ${unit.number} (${unit.type}) in ${project.name}.`;

  return (
    <>
      <Header project={project} />
      <ScarcityStrip project={project} />
      <main className="flex-1 has-sticky-cta">
        <section className="px-5 pt-8 md:pt-10">
          <div className="mx-auto max-w-5xl">
            <Link
              href={`/${project.slug}/units`}
              className="text-sm text-repp-navy/60 hover:text-repp-navy inline-flex items-center gap-1"
            >
              ← Alle units
            </Link>
          </div>
        </section>

        {/* Hero: type, m², status */}
        <section className="px-5 pt-6 pb-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-baseline justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
                  Unit {unit.number}
                </p>
                <h1 className="mt-3 text-6xl md:text-8xl font-extrabold text-repp-navy tracking-tight leading-none">
                  {unit.type}
                </h1>
                <p className="mt-4 text-repp-navy/70">
                  {formatM2(unit.m2BVO)} bvo · {unit.layers} lagen
                  {unit.metBedrijfsgebondenWoning &&
                    " · met bedrijfsgebonden woning"}
                </p>
              </div>
              <div>
                <UnitStatusBadge status={unit.status} />
              </div>
            </div>
          </div>
        </section>

        {/* Plattegrond LEFT (small) + Carousel RIGHT (big) — stacked on mobile */}
        <section className="px-5">
          <div className="mx-auto max-w-5xl grid gap-4 md:grid-cols-3">
            <aside className="md:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold mb-2">
                Plattegrond
              </p>
              <UnitGrid
                project={project}
                mode="link"
                size="mini"
                currentSlug={unit.slug}
              />
              <Link
                href={`/${project.slug}/units`}
                className="mt-3 block text-center text-xs text-repp-blue hover:text-repp-navy font-semibold"
              >
                Alle units bekijken →
              </Link>
            </aside>
            <div className="md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold mb-2">
                Impressies
              </p>
              <UnitImageCarousel images={project.gallery} />
              <p className="mt-2 text-[11px] text-repp-navy/40">
                Impressies van het project. Plattegrond per type in de{" "}
                <Link
                  href={`/${project.slug}/documenten/plattegronden`}
                  className="underline hover:text-repp-blue"
                >
                  plattegronden-PDF
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 mt-16">
          <div className="mx-auto max-w-5xl grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <SpecGroup
                title="Ruimteverdeling"
                items={[
                  ["Begane grond", formatM2(unit.m2BeganeGrond)],
                  ["Eerste verdieping", formatM2(unit.m2EersteVerdieping)],
                  ...(unit.m2TweedeVerdieping
                    ? ([
                        [
                          "Tweede verdieping",
                          `${formatM2(unit.m2TweedeVerdieping)} (bedrijfsgebonden woning)`,
                        ],
                      ] as [string, string][])
                    : []),
                  ["Totaal bvo", formatM2(unit.m2BVO)],
                ]}
              />
              <SpecGroup
                title="Specificaties"
                items={[
                  ["Vrije hoogte begane grond", specs.vrijeHoogteBeganeGrond],
                  ["Vrije hoogte 1e verdieping", specs.vrijeHoogteEersteVerdieping],
                  ...(specs.vrijeHoogteTweedeVerdieping
                    ? ([
                        [
                          "Vrije hoogte 2e verdieping",
                          specs.vrijeHoogteTweedeVerdieping,
                        ],
                      ] as [string, string][])
                    : []),
                  ["Vloerbelasting begane grond", specs.vloerbelastingBeganeGrond],
                  ["Vloerbelasting 1e verdieping", specs.vloerbelastingEersteVerdieping],
                  ["Overheaddeur", specs.overheaddeur],
                  ["Elektra", specs.elektra],
                  ["Parkeerplaats", specs.parkeerplaats],
                ]}
              />
            </div>

            <aside className="lg:sticky lg:top-24 self-start space-y-4">
              <div className="rounded-2xl bg-repp-navy text-white p-6">
                <p className="text-xs uppercase tracking-wider text-repp-yellow font-semibold">
                  Koopsom
                </p>
                <p className="mt-2 text-4xl font-extrabold">
                  {formatEuro(unit.prijsExBtw)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  excl. 21% btw · v.o.n. · VVE €{unit.vvePerMaand}/mnd
                </p>
                {unit.prijsZonderWoningExBtw && (
                  <p className="text-xs text-white/60 mt-1">
                    Zonder woning: {formatEuro(unit.prijsZonderWoningExBtw)}
                  </p>
                )}

                {/* Per-type FOMO */}
                {(isReservable || isWachtlijst) && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-sm">
                    <p className="font-semibold text-repp-yellow">
                      Nog {sameTypeAvailable}{" "}
                      {sameTypeAvailable === 1 ? "unit" : "units"} {unit.type}{" "}
                      vrij
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">
                      van {sameType.length} totaal
                      {sameTypeInOptie > 0
                        ? ` · ${sameTypeInOptie} in optie`
                        : ""}
                    </p>
                  </div>
                )}

                {isWachtlijst && (
                  <div className="mt-4 rounded-xl bg-status-optie/15 border border-status-optie/40 p-3 text-xs text-white/85 leading-relaxed">
                    Deze unit is verkocht onder voorbehoud. Als de huidige
                    reservering niet doorgaat, krijgen wachtlijst-staanden als
                    eerste bericht.
                  </div>
                )}

                {isReservable ? (
                  <Link
                    href={`/${project.slug}/reserveren?unit=${unit.slug}`}
                    className="mt-5 block bg-repp-yellow text-repp-navy text-center font-bold text-base px-4 py-4 rounded-full hover:brightness-95 shadow-lg shadow-black/20"
                  >
                    Reserveer Unit {unit.number}
                  </Link>
                ) : isWachtlijst ? (
                  <Link
                    href={`/${project.slug}/reserveren?unit=${unit.slug}&intent=wachtlijst`}
                    className="mt-5 block bg-repp-yellow text-repp-navy text-center font-bold text-base px-4 py-4 rounded-full hover:brightness-95 shadow-lg shadow-black/20"
                  >
                    Op de wachtlijst voor Unit {unit.number}
                  </Link>
                ) : unit.status === "coming_soon" ? (
                  <Link
                    href={`/${project.slug}/xxl`}
                    className="mt-5 block bg-repp-blue text-white text-center font-semibold px-4 py-3 rounded-full hover:brightness-110"
                  >
                    Plaats mij op de wachtlijst
                  </Link>
                ) : (
                  <div className="mt-5 block bg-white/10 text-white/60 text-center font-semibold px-4 py-3 rounded-full">
                    Verkocht
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/${project.slug}/bereken?unit=${unit.slug}`}
                    className="block text-center text-xs text-white/80 hover:text-white py-2 border border-white/10 rounded-full"
                  >
                    Bereken maandlast
                  </Link>
                  <a
                    href={buildWhatsAppLink(project.whatsAppNumber, waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-white/80 hover:text-white py-2 border border-white/10 rounded-full"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Soft conversion: save for later (reservable + verkocht ovb) */}
              {(isReservable || isWachtlijst) && (
                <SaveForLater
                  unitSlug={unit.slug}
                  unitNumber={unit.number}
                  unitType={unit.type}
                  projectSlug={project.slug}
                />
              )}
            </aside>
          </div>
        </section>

        <div className="h-24" />
      </main>
      <Footer project={project} />
      <StickyCTA
        project={project}
        context={`Unit ${unit.number} (${unit.type})`}
      />
    </>
  );
}

function SpecGroup({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-repp-navy tracking-tight">
        {title}
      </h2>
      <dl className="mt-4 divide-y divide-repp-gray border border-repp-gray rounded-2xl bg-white">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="px-5 py-3.5 flex items-center justify-between gap-4"
          >
            <dt className="text-sm text-repp-navy/60">{k}</dt>
            <dd className="text-sm font-semibold text-repp-navy text-right">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
