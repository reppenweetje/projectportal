import Image from "next/image";
import type { Project, TrustPartner } from "@/lib/types";

export function TrustStack({ project }: { project: Project }) {
  const partners = project.trustPartners;
  if (partners.length === 0) return null;

  return (
    <section className="px-5 py-12 border-y border-repp-gray bg-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-repp-navy/50 font-semibold mb-8">
          Met vertrouwde partners
        </p>
        <div className="grid grid-cols-3 gap-6 md:gap-10 items-center">
          {partners.map((p) => (
            <PartnerLogo key={p.name} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: TrustPartner }) {
  const inner = (
    <div className="flex flex-col items-center gap-2 text-center group">
      {partner.logoSrc ? (
        <div className="relative h-10 w-full opacity-70 group-hover:opacity-100 transition">
          <Image
            src={partner.logoSrc}
            alt={partner.name}
            fill
            sizes="200px"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="h-10 grid place-items-center px-4 rounded-md border border-repp-gray bg-white">
          <span className="text-repp-navy font-extrabold tracking-tight text-base md:text-lg">
            {partner.name}
          </span>
        </div>
      )}
      <p className="text-[10px] uppercase tracking-wider text-repp-navy/50 font-semibold">
        {partner.role}
      </p>
    </div>
  );
  if (partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
