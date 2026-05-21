/**
 * LeadGate — Server Component wrapper voor gated content.
 *
 * Gebruik in een page.tsx (Server Component):
 *
 *   import { LeadGate } from "@/components/conversion/LeadGate";
 *   ...
 *   <LeadGate
 *     gateContext="documenten"
 *     title="Toegang tot de documenten"
 *     description="Laat je gegevens achter om de brochure en plattegronden te bekijken."
 *   >
 *     <DocumentsList />
 *   </LeadGate>
 *
 * Hoe het werkt:
 *  1. Server-side: leest `dh_session` cookie via getPortalSession().
 *  2. Als geldige sessie → rendert {children} direct (geen interactie nodig).
 *  3. Anders → rendert <LeadGateOverlay> (client component) die de content
 *     blurt en een modal-form toont. Na succesvolle submit roept de overlay
 *     router.refresh() aan; de server re-rendert en ziet nu wél een cookie,
 *     dus de gate is weg.
 *
 * BELANGRIJK: dit is een ECHTE security-gate. dh_session is HttpOnly +
 * server-side gevalideerd via portal-resolve. Een bezoeker kan dh_profile
 * vervalsen, maar dat helpt ze hier niet — getPortalSession kijkt naar
 * dh_session (het bearer-token), niet naar dh_profile.
 */

import { getPortalSession } from "@/lib/portal-session";
import { LeadGateOverlay } from "./LeadGateOverlay";

export type GateContext = "documenten" | "bereken" | "prijs" | string;

export async function LeadGate({
  gateContext,
  title,
  description,
  children,
}: {
  gateContext: GateContext;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const session = await getPortalSession();

  if (session.isReturning) {
    return <>{children}</>;
  }

  return (
    <LeadGateOverlay
      gateContext={gateContext}
      title={title ?? "Even je gegevens"}
      description={
        description ??
        "Vul je naam en e-mailadres in om deze informatie te bekijken. " +
        "We sturen je geen ongewenste mail."
      }
    >
      {children}
    </LeadGateOverlay>
  );
}
