"use client";

import type { ReactNode } from "react";
import { trackWhatsAppClick } from "@/lib/track";

/**
 * WhatsAppLink: anchor naar wa.me met het dataLayer-event
 * `lead_unit14_whatsapp` (parameter page) bij klik. Gebruik dit voor elke
 * WhatsApp-link op de site, dan is de tracking overal gelijk.
 */
export function WhatsAppLink({
  href,
  children,
  className,
  page,
  cta,
  ariaLabel,
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Overschrijft de pagina-naam in het event (standaard: pathname). */
  page?: string;
  /** Bloknaam voor data-cta. */
  cta?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      aria-label={ariaLabel}
      data-cta={cta}
      onClick={() => trackWhatsAppClick(page)}
    >
      {children}
    </a>
  );
}
