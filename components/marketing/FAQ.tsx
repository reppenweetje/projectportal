import type { Project } from "@/lib/types";

export function FAQ({ project }: { project: Project }) {
  const items = project.faqs;

  // JSON-LD FAQPage schema for SEO + AI search
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="divide-y divide-repp-gray border border-repp-gray rounded-2xl bg-white">
        {items.map((item, idx) => (
          <details key={item.q} className="group" open={idx === 0}>
            <summary className="px-5 py-4 cursor-pointer flex items-center justify-between gap-4 list-none">
              <span className="font-semibold text-repp-navy text-sm md:text-base">
                {item.q}
              </span>
              <span className="text-repp-navy/40 text-xl group-open:rotate-45 transition-transform shrink-0">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm text-repp-navy/75 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
