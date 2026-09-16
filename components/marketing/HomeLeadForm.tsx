import { Suspense } from "react";
import type { Project } from "@/lib/types";
import {
  LeadFormUnit14,
  LeadFormUnit14Heading,
} from "@/components/conversion/LeadFormUnit14";

/** Aanmeldblok onderaan de homepage: hetzelfde formulier als op /xxl. */
export function HomeLeadForm({ project }: { project: Project }) {
  return (
    <section id="aanmelden" className="px-5 py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <LeadFormUnit14Heading overline="Aanmelden voor de laatste unit" />
        </div>
        <Suspense fallback={null}>
          <LeadFormUnit14 project={project} context="home-form" />
        </Suspense>
      </div>
    </section>
  );
}
