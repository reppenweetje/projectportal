import type { Project } from "@/lib/types";
import { FooterIdentity } from "./FooterIdentity";

export function Footer({ project }: { project: Project }) {
  return (
    <footer className="bg-repp-navy text-white/80 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-extrabold text-white text-lg">REPP</p>
          <p className="text-sm mt-2">
            Bedrijfsmakelaar voor nieuwbouw bedrijfsunits in de Metropoolregio
            Amsterdam.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white text-sm uppercase tracking-wider">
            {project.name}
          </p>
          <p className="text-sm mt-2">{project.address}</p>
          <p className="text-sm">{project.city}</p>
        </div>
        <div>
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
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/50 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} REPP Bedrijfsmakelaar</span>
          <FooterIdentity projectSlug={project.slug} />
          <span>Aan deze website kunnen geen rechten worden ontleend.</span>
        </div>
      </div>
    </footer>
  );
}
