import Link from "next/link";
import type { Project } from "@/lib/types";
import { FooterIdentity } from "./FooterIdentity";
import { InsiderSignup } from "@/components/conversion/InsiderSignup";

export function Footer({ project }: { project: Project }) {
  return (
    <footer className="bg-repp-navy text-white/80 mt-16">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="font-extrabold text-white text-lg">REPP</p>
          <p className="text-sm mt-2">
            Bedrijfsmakelaar voor nieuwbouw projecten.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold text-white text-sm uppercase tracking-wider">
            {project.name}
          </p>
          <p className="text-sm mt-2">{project.address}</p>
          <p className="text-sm">{project.city}</p>
          <ul className="mt-3 text-sm space-y-1">
            <li>
              <Link
                href={`/${project.slug}/units`}
                className="hover:text-repp-yellow"
              >
                Plattegrond
              </Link>
            </li>
            <li>
              <Link
                href={`/${project.slug}/bereken`}
                className="hover:text-repp-yellow"
              >
                Bereken
              </Link>
            </li>
            <li>
              <Link
                href={`/${project.slug}/documenten`}
                className="hover:text-repp-yellow"
              >
                Documenten
              </Link>
            </li>
            <li>
              <Link
                href={`/${project.slug}/insider`}
                className="hover:text-repp-yellow"
              >
                Hofman Insider
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="font-semibold text-white text-sm uppercase tracking-wider">
            Contact
          </p>
          <p className="text-sm mt-2">
            <a
              href={`tel:${project.makelaar.phone}`}
              className="hover:text-repp-yellow"
            >
              {project.makelaar.phone}
            </a>
          </p>
          <p className="text-sm">
            <a href="mailto:info@repp.nl" className="hover:text-repp-yellow">
              info@repp.nl
            </a>
          </p>
        </div>
        <div className="md:col-span-4">
          <p className="font-semibold text-white text-sm uppercase tracking-wider">
            Hofman Insider
          </p>
          <p className="text-sm mt-2 text-white/65 leading-relaxed">
            Als eerste bericht bij statuswijzigingen, prijsindexaties en de
            start van de XXL-verkoop.
          </p>
          <div className="mt-3">
            <InsiderSignup
              project={project}
              variant="compact"
              source="footer"
              tone="dark"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/50 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} REPP Bedrijfsmakelaar</span>
          <FooterIdentity projectSlug={project.slug} />
          <span>Aan deze website kunnen geen rechten worden ontleend.</span>
        </div>
      </div>
    </footer>
  );
}
