import Link from "next/link";
import type { Project } from "@/lib/types";
import { DocIcon } from "./DocIcon";

const HIGHLIGHTED = ["brochure", "prijslijst"] as const;

export function KeyDocuments({ project }: { project: Project }) {
  const docs = HIGHLIGHTED.map((slug) =>
    project.documents.find((d) => d.slug === slug),
  ).filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (docs.length === 0) return null;

  return (
    <section className="px-5 py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            Alvast inkijken
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            De stukken die je echt wilt zien
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {docs.map((d) => (
            <Link
              key={d.slug}
              href={`/${project.slug}/documenten/${d.slug}`}
              className="group block rounded-2xl border border-repp-gray bg-white p-7 hover:border-repp-navy hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4">
                <DocIcon slug={d.slug} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold">
                    {d.group === "essentieel" ? "Essentieel" : "Juridisch"}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-repp-navy">
                    {d.label}
                  </p>
                  <p className="mt-1 text-sm text-repp-navy/70">{d.body}</p>
                  <p className="mt-4 text-sm font-semibold text-repp-blue inline-flex items-center gap-1">
                    Bekijk en download{" "}
                    <span className="group-hover:translate-x-0.5 transition">
                      →
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/${project.slug}/documenten`}
            className="text-sm text-repp-navy/70 hover:text-repp-navy underline-offset-4 hover:underline"
          >
            Alle documenten bekijken →
          </Link>
        </div>
      </div>
    </section>
  );
}
