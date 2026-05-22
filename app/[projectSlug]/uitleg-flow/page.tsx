import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/projects/de-hofman";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type Params = { projectSlug: string };

export const metadata: Metadata = {
  title: "Uitleg-flow · De Hofman",
  description:
    "Een blik achter de schermen van De Hofman portal: lead-routes, account-systeem, automations en error-handling.",
  robots: { index: false, follow: false },
};

export default async function UitlegFlowPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  return (
    <>
      <Header project={project} />
      <main className="flex-1 bg-surface-muted">
        <div className="mx-auto max-w-4xl px-5 py-12 md:py-20">
          {/* Hero */}
          <header className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
              Achter de schermen
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-repp-navy tracking-tight">
              Hoe alles in elkaar zit
            </h1>
            <p className="mt-4 text-base md:text-lg text-repp-navy/70 max-w-2xl mx-auto leading-relaxed">
              De complete tour: welke routes leads kunnen nemen, hoe accounts
              werken, hoe opvolging loopt en wat er gebeurt als iets mis gaat.
            </p>
          </header>

          {/* Quick TOC */}
          <nav className="mb-16 rounded-2xl bg-white border border-repp-gray p-6">
            <p className="text-xs uppercase tracking-wider text-repp-navy/50 font-semibold mb-3">
              Inhoud
            </p>
            <ol className="grid sm:grid-cols-2 gap-y-2 text-sm text-repp-navy">
              {[
                ["1. Lead-routes", "#routes"],
                ["2. Account-systeem", "#account"],
                ["3. Opvolging per lead-type", "#opvolging"],
                ["4. Brevo lijsten + automations", "#brevo"],
                ["5. Slack notificaties", "#slack"],
                ["6. Error-handling", "#errors"],
                ["7. Manuele recovery", "#recovery"],
                ["8. Tech-stack overzicht", "#tech"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="underline underline-offset-2 hover:no-underline hover:text-repp-blue"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {/* 1. Lead-routes */}
          <Section id="routes" eyebrow="Stap 1" title="Lead-routes — 3 manieren om binnen te komen">
            <p className="mb-8">
              Een lead kan via drie verschillende kanalen bij ons komen.
              Elk kanaal verzamelt andere data en triggert andere opvolging.
            </p>

            <div className="space-y-6">
              <RouteCard
                accent="blue"
                title="A. Via de CLP (chatbot)"
                domain="dehofman.clp.repp.nl"
                source="clp_dehofman"
                description="Komt binnen vanuit een Meta-ad / Insta-ad. Doorloopt de gestructureerde chat-flow waar persona, intent, grootte en termijn wordt uitgevraagd. Score wordt berekend op basis van antwoorden."
                steps={[
                  "Bezoeker klikt op ad → dehofman.clp.repp.nl",
                  "Chat-flow: intent → focus → email → telefoon → score",
                  "Achter de schermen: lead-upsert naar Supabase (geeft portal_token)",
                  "Brevo lijst 286 (CLP leads) krijgt contact + PORTAL_TOKEN attribute",
                  "Bij temperature=hot: Slack #hotleads notif voor sales",
                ]}
                outcome="Volledige profile incl. score, persona, timeline, intent — sales kan direct kwalificeren."
              />

              <RouteCard
                accent="yellow"
                title="B. Walk-in via dehofman.nl"
                domain="dehofman.nl"
                source="dehofman_portal_*"
                description="Komt direct binnen via SEO, social-share, of mail-link zonder eerst chat te doen. Vult een specifiek formulier in (reservering, brochure-aanvraag, XXL-waitlist, insider-signup, save-for-later)."
                steps={[
                  "Bezoeker klikt 'Maak account' of 'Bewaar favoriet' of 'Reserveer'",
                  "Vult formulier: voornaam + email + (optioneel) telefoon",
                  "lead-upsert → Supabase met source dehofman_portal_<type>",
                  "Brevo lijst 289 (walk-in algemeen) OF 290 (reservering)",
                  "Zapier walk-in webhook → CRM-automation",
                ]}
                outcome="Minder gequalificeerde data dan CLP (geen persona/score), maar wel email + intent uit form-context."
              />

              <RouteCard
                accent="navy"
                title="C. Terugkerend via magic-link"
                domain="dehofman.nl/?t=PORTAL_TOKEN"
                source="bestaande lead"
                description="Klikt op een Brevo-mail met inloglink. Middleware verifieert token, zet 3 cookies, redirect naar clean URL. Lead is 'ingelogd' met alle eerder verzamelde data."
                steps={[
                  "Klik op CTA in Brevo-mail: /?t={{contact.PORTAL_TOKEN}}",
                  "Middleware vraagt portal-resolve Edge Function aan",
                  "Cookies geset: dh_session (HttpOnly), dh_profile (signed), repp_lead",
                  "307 redirect → /  (zonder ?t= zodat token niet lekt in browser history)",
                  "UI personaliseert: 'Welkom Flip, er zijn nog 4 units beschikbaar'",
                ]}
                outcome="Geen nieuwe lead-creatie. Bestaande Supabase-row wordt gerefresht (last_portal_visit_at)."
              />
            </div>
          </Section>

          {/* 2. Account-systeem */}
          <Section id="account" eyebrow="Stap 2" title="Hoe accounts werken">
            <p className="mb-6">
              Er is geen wachtwoord-systeem. Elke lead krijgt automatisch een
              <strong> portal_token</strong> (UUID) in Supabase bij eerste
              contact. Die token = hun account. Vanaf dat moment kunnen we ze
              via die unieke link altijd weer &apos;inloggen&apos; op dehofman.nl.
            </p>

            <h3 className="mt-8 mb-3 text-lg font-bold text-repp-navy">
              De drie cookies
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              <CookieCard
                name="dh_session"
                ttl="60 dagen sliding"
                inhoud="Random UUID (session-token)"
                flags="HttpOnly + Secure"
                doel="Server-side auth voor gated content. JS kan 'm niet lezen."
              />
              <CookieCard
                name="dh_profile"
                ttl="60 dagen"
                inhoud="HMAC-signed JSON: first_name + exp + version"
                flags="Secure (niet HttpOnly)"
                doel="UI-personalisatie. Tampering server-side detecteerbaar."
              />
              <CookieCard
                name="repp_lead"
                ttl="90 dagen"
                inhoud="JSON: name, email, phone, modus, verified, etc"
                flags="Secure (niet HttpOnly)"
                doel="Client-side personalisatie banners, form pre-fill, gate-skip."
              />
            </div>

            <h3 className="mt-10 mb-3 text-lg font-bold text-repp-navy">
              Inloggen & uitloggen
            </h3>
            <FlowDiagram
              steps={[
                {
                  label: "Lead klikt link in Brevo-mail",
                  detail: "https://www.dehofman.nl/?t=PORTAL_TOKEN",
                },
                {
                  label: "Middleware redeemt token",
                  detail: "portal-resolve Edge Function verifieert + genereert verse session_token",
                },
                {
                  label: "3 cookies geset",
                  detail: "dh_session + dh_profile + repp_lead op dehofman.nl",
                },
                {
                  label: "Redirect naar / (clean URL)",
                  detail: "Token uit URL gestript, gebruiker is ingelogd",
                },
              ]}
            />

            <p className="mt-6 text-sm text-repp-navy/70 leading-relaxed">
              Uitloggen via &quot;Dit ben ik niet&quot; in de footer roept{" "}
              <code className="text-xs bg-repp-navy/5 px-1 rounded">
                /api/portal-logout
              </code>{" "}
              aan die alle 3 cookies wist (HttpOnly ook).
            </p>
          </Section>

          {/* 3. Opvolging per lead-type */}
          <Section
            id="opvolging"
            eyebrow="Stap 3"
            title="Opvolging — wie krijgt wat"
          >
            <p className="mb-8">
              Per route is de follow-up anders. Belangrijk om te weten welke
              automation voor wie geldt.
            </p>

            <div className="space-y-4">
              <FollowupRow
                source="CLP lead (clp_dehofman)"
                channels={[
                  { type: "Brevo-mails", detail: "Automation via lijst 286, nurture-flow over weken" },
                  { type: "WhatsApp dag-1", detail: "Samenvatting van het chat-gesprek OF afhaak-reden (door REPP team)" },
                  { type: "Slack #hotleads", detail: "Alleen als temperature=hot, voor directe sales-actie" },
                ]}
              />
              <FollowupRow
                source="Walk-in (dehofman_portal_*)"
                channels={[
                  { type: "Brevo-mails", detail: "Automation via lijst 289 of 290, geen chat-context dus generiekere copy" },
                  { type: "Géén WhatsApp dag-1", detail: "Walk-ins zijn niet door CLP-flow gegaan dus geen gespreks-transcript" },
                  { type: "Slack #hotleads", detail: "Bij reservation + xxl (temperature=hot)" },
                  { type: "Zapier", detail: "Walk-in OF reservation webhook → CRM automation" },
                ]}
              />
              <FollowupRow
                source="Terugkerend (via magic-link)"
                channels={[
                  { type: "Geen nieuwe automation", detail: "Bestaande lead — Brevo werkflow loopt al" },
                  { type: "last_portal_visit_at update", detail: "Sales kan zien wanneer lead laatst keek" },
                ]}
              />
            </div>

            <Callout title="Antwoord op je vraag" tone="navy">
              Een walk-in lead die NIET via CLP is gekomen krijgt géén
              WhatsApp-bericht dag-1. WhatsApp-flow is gekoppeld aan CLP
              chat-transcript / afhaak-reden — die data bestaat niet voor
              walk-ins.
            </Callout>
          </Section>

          {/* 4. Brevo */}
          <Section id="brevo" eyebrow="Stap 4" title="Brevo lijsten + automations">
            <p className="mb-6">
              Drie lijsten bedienen drie segmenten. Elke lijst kan een eigen
              Brevo automation hebben.
            </p>

            <div className="grid md:grid-cols-3 gap-3">
              <ListCard
                id="286"
                naam="CLP leads"
                bron="clp_dehofman"
                bevat="Leads die de chatbot-flow doorliepen"
                attributes="Persona, intent, size, timeline, score, temperature, stage"
              />
              <ListCard
                id="289"
                naam="Walk-in portal"
                bron="dehofman_portal_* (behalve reservation)"
                bevat="Email-only signups, brochure-aanvragen, insider, favoriet, XXL-waitlist"
                attributes="Email, first_name, optional phone, source"
              />
              <ListCard
                id="290"
                naam="Reserveringen"
                bron="dehofman_portal_reservation"
                bevat="Leads die op /reserveren een unit op naam lieten zetten"
                attributes="Email, first_name, phone, unit_id, contact_moment"
              />
            </div>

            <p className="mt-6 text-sm text-repp-navy/70 leading-relaxed">
              Elke contact heeft een{" "}
              <code className="text-xs bg-repp-navy/5 px-1 rounded">
                PORTAL_TOKEN
              </code>{" "}
              attribute. In je email-templates gebruik je{" "}
              <code className="text-xs bg-repp-navy/5 px-1 rounded">
                {`{{ contact.PORTAL_TOKEN }}`}
              </code>{" "}
              in de CTA-URL zodat elke lead via zijn eigen link inlogt.
            </p>

            <h3 className="mt-10 mb-3 text-lg font-bold text-repp-navy">
              Magic-link mail (template #1261)
            </h3>
            <p className="mb-3 text-sm text-repp-navy/70">
              Aparte transactional template die fired wanneer een uitgelogde
              lead op &quot;Inloglink aanvragen&quot; klikt. Gebruikt{" "}
              <code className="text-xs bg-repp-navy/5 px-1 rounded">
                {`{{ params.MAGIC_LINK }}`}
              </code>{" "}
              en{" "}
              <code className="text-xs bg-repp-navy/5 px-1 rounded">
                {`{{ params.FIRSTNAME }}`}
              </code>
              .
            </p>
          </Section>

          {/* 5. Slack */}
          <Section id="slack" eyebrow="Stap 5" title="Slack notificaties">
            <p className="mb-6">
              Twee kanalen, twee soorten alerts. Sales-team weet altijd wat er
              gebeurt zonder Supabase/Brevo dashboards open te hoeven hebben.
            </p>

            <SlackChannel
              naam="#hotleads"
              webhook="SLACK_HOTLEADS_WEBHOOK_URL"
              tone="hot"
              wanneer="Lead bereikt temperature=hot (uit CLP-flow scoring)"
              voorbeeld={[
                "🔥 HOT lead — dehofman",
                "Naam: Flip Jacobs",
                "E-mail: flip@bedrijf.nl",
                "Telefoon: +31612345678",
                "Persona: Voor eigen bedrijf",
                "Termijn: Zo snel mogelijk",
                "Score: 78",
              ]}
            />

            <div className="h-4" />

            <SlackChannel
              naam="#errors"
              webhook="SLACK_ERRORS_WEBHOOK_URL"
              tone="error"
              wanneer="Kritieke server-side failure waarbij lead-data dreigt verloren te raken"
              voorbeeld={[
                "⚠️ Server error",
                "Brevo upsert failed (contact niet in lijst)",
                "source: dehofman_portal_reservation",
                "email: jan@bedrijf.nl",
                "portal_token: a1b2c3...",
                "error: 429 Daily quota exceeded",
              ]}
            />
          </Section>

          {/* 6. Errors */}
          <Section id="errors" eyebrow="Stap 6" title="Wat er fout kan gaan">
            <p className="mb-6">
              Vijf failure-modes worden actief gemonitord. Elke detect een
              specifiek scenario en stuurt context naar Slack #errors zodat
              sales handmatig kan opvolgen.
            </p>

            <div className="space-y-3">
              <ErrorRow
                ernst="kritiek"
                titel="Supabase DB write fail"
                wanneer="lead-upsert kan niet schrijven naar de leads tabel (PK conflict, connectivity, etc)"
                gevolg="Lead-data is NIET opgeslagen — geen portal_token, geen Brevo, geen Zapier"
                actie="Bel lead terug, vraag opnieuw gegevens. Slack notif heeft email + naam + phone"
              />
              <ErrorRow
                ernst="hoog"
                titel="Brevo upsert failed"
                wanneer="Brevo API geeft 429 (rate-limit), 500, of duplicate_parameter na 2 retries"
                gevolg="Lead staat in Supabase + heeft portal_token, maar Brevo-automation kan niet starten"
                actie="Handmatig contact in Brevo zetten met PORTAL_TOKEN uit Supabase (zie sectie 7)"
              />
              <ErrorRow
                ernst="middel"
                titel="Zapier webhook failed"
                wanneer="Zapier endpoint timeout, niet bereikbaar, of 5xx"
                gevolg="CRM-automation niet getriggerd. Lead is wel in Supabase + Brevo"
                actie="Manueel de Zap triggeren in Zapier-dashboard, of CRM-status syncen"
              />
              <ErrorRow
                ernst="hoog"
                titel="Magic-link Supabase lookup fail"
                wanneer="Lead vraagt inloglink aan, Supabase query crasht"
                gevolg="Lead krijgt geen mail terwijl 'ie wel een account heeft"
                actie="Bel/mail lead handmatig, stuur de /?t=TOKEN-link via WhatsApp"
              />
              <ErrorRow
                ernst="middel"
                titel="Magic-link Brevo SMTP fail"
                wanneer="Brevo accepteert de send niet (template-mismatch, quota, blacklist)"
                gevolg="Lead krijgt geen inlogmail terwijl ze 'm hebben aangevraagd"
                actie="Check Brevo template variables, check quota, of stuur link manueel"
              />
            </div>

            <Callout title="Wat we NIET monitoren (intentioneel)" tone="muted">
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Onbekend email bij magic-link → silent ok (anti-enumeratie)</li>
                <li>Brevo retry-strip op SMS/WHATSAPP duplicate → wordt automatisch afgehandeld</li>
                <li>Rate-limit hits op portal-magic-link → silent ok (anti-mailbomb)</li>
                <li>Client-side network errors → te ruisachtig, niet sales-actionable</li>
              </ul>
            </Callout>
          </Section>

          {/* 7. Recovery */}
          <Section
            id="recovery"
            eyebrow="Stap 7"
            title="Handmatig herstellen — wanneer iets fout gaat"
          >
            <p className="mb-6">
              Als een Slack-notif zegt &quot;Brevo upsert failed&quot;, kan
              sales de lead in 4 stappen handmatig terugzetten.
            </p>

            <ol className="space-y-4">
              <RecoveryStep
                stap="1"
                titel="Pak details uit Supabase"
                detail="Supabase dashboard → SQL editor. Zoek op lead_id uit Slack-notif. Kopieer: email, first_name, phone, persona, portal_token, source."
              />
              <RecoveryStep
                stap="2"
                titel="Voeg manueel toe in Brevo"
                detail="Brevo → Contacts → Add contact. Vul email + alle attributes in. KRITIEK: PORTAL_TOKEN moet de UUID uit Supabase zijn, anders werkt de magic-link niet."
              />
              <RecoveryStep
                stap="3"
                titel="Voeg toe aan juiste lijst"
                detail="Source bepaalt lijst: clp_dehofman → 286, dehofman_portal_reservation → 290, andere portal sources → 289."
              />
              <RecoveryStep
                stap="4"
                titel="Trigger automation (optioneel)"
                detail="Brevo → Automation → workflow → Contacts tab → Add contacts → email opzoeken → start workflow."
              />
            </ol>
          </Section>

          {/* 8. Tech-stack */}
          <Section id="tech" eyebrow="Stap 8" title="Tech-stack overzicht">
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <TechCard label="CLP chatbot" stack="Vite + React 18 op Vercel · clp.repp.nl" />
              <TechCard label="Portal site" stack="Next.js 16 (App Router) op Vercel · dehofman.nl" />
              <TechCard label="Database + Edge Functions" stack="Supabase (Postgres + Deno runtime)" />
              <TechCard label="Mail + automation" stack="Brevo (Sendinblue) — Contacts + Transactional + Automations" />
              <TechCard label="CRM trigger" stack="Zapier — 2 webhooks (walk-in + reservation)" />
              <TechCard label="Realtime alerts" stack="Slack — #hotleads + #errors" />
              <TechCard label="Analytics" stack="Plausible (privacy-friendly, geen cookies)" />
              <TechCard label="Hosting + DNS" stack="Vercel + Cloudflare-style edge" />
            </div>

            <h3 className="mt-10 mb-3 text-lg font-bold text-repp-navy">
              Endpoints overzicht
            </h3>
            <div className="rounded-2xl bg-white border border-repp-gray overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-repp-navy/5 text-repp-navy">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">
                      Endpoint
                    </th>
                    <th className="text-left px-4 py-2 font-semibold">Waar</th>
                    <th className="text-left px-4 py-2 font-semibold">Wat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-repp-gray">
                  {[
                    [
                      "/functions/v1/lead-upsert",
                      "Supabase",
                      "Schrijft lead naar DB, fired Brevo + Zapier + Slack",
                    ],
                    [
                      "/functions/v1/portal-resolve",
                      "Supabase",
                      "Token-redeem voor magic-link login (slid + refresh)",
                    ],
                    [
                      "/functions/v1/portal-magic-link",
                      "Supabase",
                      "Stuurt Brevo SMTP mail met inloglink aan bekende email",
                    ],
                    [
                      "/api/reservation",
                      "Vercel",
                      "Walk-in reservation submit → lead-upsert",
                    ],
                    [
                      "/api/portal-session",
                      "Vercel",
                      "Same-origin token-exchange voor cookie-set",
                    ],
                    [
                      "/api/portal-logout",
                      "Vercel",
                      "Wist alle 3 cookies server-side",
                    ],
                    [
                      "/api/portal-update",
                      "Vercel",
                      "Lead update via WelcomeControle → Brevo sync",
                    ],
                    [
                      "/api/portal-magic-link",
                      "Vercel",
                      "Proxy naar Supabase magic-link function",
                    ],
                    [
                      "/api/download/[slug]",
                      "Vercel",
                      "PDF download met Content-Disposition (De Hofman X.pdf)",
                    ],
                  ].map(([endpoint, where, what]) => (
                    <tr key={endpoint}>
                      <td className="px-4 py-2 font-mono text-xs text-repp-navy">
                        {endpoint}
                      </td>
                      <td className="px-4 py-2 text-xs text-repp-navy/70">
                        {where}
                      </td>
                      <td className="px-4 py-2 text-xs text-repp-navy/70">
                        {what}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Footer-cta */}
          <div className="mt-20 text-center">
            <p className="text-sm text-repp-navy/60">
              Vragen of iets onduidelijk? Bel{" "}
              <a
                href="tel:+31202610080"
                className="font-semibold text-repp-navy underline hover:text-repp-blue"
              >
                020 261 0080
              </a>{" "}
              of mail{" "}
              <a
                href="mailto:info@repp.nl"
                className="font-semibold text-repp-navy underline hover:text-repp-blue"
              >
                info@repp.nl
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer project={project} />
    </>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-24">
      <p className="text-xs uppercase tracking-[0.2em] text-repp-blue font-bold">
        {eyebrow}
      </p>
      <h2 className="mt-2 mb-6 text-2xl md:text-3xl font-extrabold text-repp-navy tracking-tight">
        {title}
      </h2>
      <div className="text-repp-navy/80 leading-relaxed">{children}</div>
    </section>
  );
}

function RouteCard({
  accent,
  title,
  domain,
  source,
  description,
  steps,
  outcome,
}: {
  accent: "blue" | "yellow" | "navy";
  title: string;
  domain: string;
  source: string;
  description: string;
  steps: string[];
  outcome: string;
}) {
  const accentBar = {
    blue: "bg-repp-blue",
    yellow: "bg-repp-yellow",
    navy: "bg-repp-navy",
  }[accent];
  return (
    <div className="rounded-2xl bg-white border border-repp-gray overflow-hidden">
      <div className={`h-1 ${accentBar}`} />
      <div className="p-6">
        <h3 className="font-bold text-repp-navy text-lg">{title}</h3>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          <span className="bg-repp-navy/5 text-repp-navy px-2 py-0.5 rounded-full font-mono">
            {domain}
          </span>
          <span className="bg-repp-navy/5 text-repp-navy/70 px-2 py-0.5 rounded-full font-mono">
            source: {source}
          </span>
        </div>
        <p className="mt-4 text-sm text-repp-navy/75 leading-relaxed">
          {description}
        </p>
        <ol className="mt-4 space-y-1.5 text-sm text-repp-navy/80">
          {steps.map((step, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="shrink-0 font-bold text-repp-navy">
                {idx + 1}.
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 pt-4 border-t border-repp-gray text-xs text-repp-navy/60 italic">
          → {outcome}
        </p>
      </div>
    </div>
  );
}

function CookieCard({
  name,
  ttl,
  inhoud,
  flags,
  doel,
}: {
  name: string;
  ttl: string;
  inhoud: string;
  flags: string;
  doel: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-repp-gray p-4">
      <p className="font-mono text-sm font-bold text-repp-navy">{name}</p>
      <dl className="mt-3 text-xs text-repp-navy/70 space-y-1.5">
        <div>
          <dt className="font-semibold text-repp-navy/55">TTL</dt>
          <dd>{ttl}</dd>
        </div>
        <div>
          <dt className="font-semibold text-repp-navy/55">Inhoud</dt>
          <dd>{inhoud}</dd>
        </div>
        <div>
          <dt className="font-semibold text-repp-navy/55">Flags</dt>
          <dd>{flags}</dd>
        </div>
        <div>
          <dt className="font-semibold text-repp-navy/55">Doel</dt>
          <dd>{doel}</dd>
        </div>
      </dl>
    </div>
  );
}

function FlowDiagram({
  steps,
}: {
  steps: { label: string; detail: string }[];
}) {
  return (
    <ol className="space-y-2">
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3">
          <div className="shrink-0 w-7 h-7 rounded-full bg-repp-navy text-white text-xs font-bold grid place-items-center">
            {idx + 1}
          </div>
          <div className="flex-1 rounded-xl bg-white border border-repp-gray px-4 py-2.5">
            <p className="text-sm font-semibold text-repp-navy">{step.label}</p>
            <p className="text-xs text-repp-navy/60 mt-0.5">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FollowupRow({
  source,
  channels,
}: {
  source: string;
  channels: { type: string; detail: string }[];
}) {
  return (
    <div className="rounded-2xl bg-white border border-repp-gray p-5">
      <p className="font-bold text-repp-navy">{source}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {channels.map((c, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="shrink-0 font-semibold text-repp-navy w-32">
              {c.type}
            </span>
            <span className="text-repp-navy/70">{c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListCard({
  id,
  naam,
  bron,
  bevat,
  attributes,
}: {
  id: string;
  naam: string;
  bron: string;
  bevat: string;
  attributes: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-repp-gray p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-repp-yellow">{id}</span>
        <p className="font-bold text-repp-navy">{naam}</p>
      </div>
      <dl className="mt-3 text-xs text-repp-navy/70 space-y-1.5">
        <div>
          <dt className="font-semibold text-repp-navy/55">Bron</dt>
          <dd className="font-mono">{bron}</dd>
        </div>
        <div>
          <dt className="font-semibold text-repp-navy/55">Bevat</dt>
          <dd>{bevat}</dd>
        </div>
        <div>
          <dt className="font-semibold text-repp-navy/55">Attributes</dt>
          <dd>{attributes}</dd>
        </div>
      </dl>
    </div>
  );
}

function SlackChannel({
  naam,
  webhook,
  tone,
  wanneer,
  voorbeeld,
}: {
  naam: string;
  webhook: string;
  tone: "hot" | "error";
  wanneer: string;
  voorbeeld: string[];
}) {
  const borderCls = tone === "hot" ? "border-orange-300" : "border-rose-300";
  const bgCls = tone === "hot" ? "bg-orange-50" : "bg-rose-50";
  return (
    <div className={`rounded-2xl border ${borderCls} ${bgCls} p-5`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="font-bold text-repp-navy">{naam}</p>
        <code className="text-[11px] bg-white border border-repp-gray px-2 py-0.5 rounded text-repp-navy/60">
          {webhook}
        </code>
      </div>
      <p className="mt-2 text-sm text-repp-navy/75">
        <strong>Wanneer:</strong> {wanneer}
      </p>
      <pre className="mt-4 bg-white border border-repp-gray rounded p-3 text-xs text-repp-navy whitespace-pre-wrap font-mono leading-relaxed">
        {voorbeeld.join("\n")}
      </pre>
    </div>
  );
}

function ErrorRow({
  ernst,
  titel,
  wanneer,
  gevolg,
  actie,
}: {
  ernst: "kritiek" | "hoog" | "middel";
  titel: string;
  wanneer: string;
  gevolg: string;
  actie: string;
}) {
  const ernstColor = {
    kritiek: "bg-rose-500 text-white",
    hoog: "bg-orange-500 text-white",
    middel: "bg-yellow-400 text-repp-navy",
  }[ernst];
  return (
    <div className="rounded-2xl bg-white border border-repp-gray p-5">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span
          className={`text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${ernstColor}`}
        >
          {ernst}
        </span>
        <p className="font-bold text-repp-navy">{titel}</p>
      </div>
      <dl className="mt-3 text-sm space-y-1.5">
        <div className="flex gap-2">
          <dt className="font-semibold text-repp-navy/55 w-24 shrink-0">
            Wanneer
          </dt>
          <dd className="text-repp-navy/75">{wanneer}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-repp-navy/55 w-24 shrink-0">
            Gevolg
          </dt>
          <dd className="text-repp-navy/75">{gevolg}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-repp-navy/55 w-24 shrink-0">
            Sales-actie
          </dt>
          <dd className="text-repp-navy">{actie}</dd>
        </div>
      </dl>
    </div>
  );
}

function RecoveryStep({
  stap,
  titel,
  detail,
}: {
  stap: string;
  titel: string;
  detail: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-repp-navy text-white font-bold grid place-items-center">
        {stap}
      </div>
      <div className="flex-1 rounded-xl bg-white border border-repp-gray p-4">
        <p className="font-bold text-repp-navy">{titel}</p>
        <p className="mt-1 text-sm text-repp-navy/70 leading-relaxed">
          {detail}
        </p>
      </div>
    </li>
  );
}

function Callout({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "navy" | "muted";
  children: React.ReactNode;
}) {
  const bgCls = tone === "navy" ? "bg-repp-navy text-white" : "bg-repp-navy/5";
  const titleCls = tone === "navy" ? "text-repp-yellow" : "text-repp-navy";
  return (
    <div className={`mt-6 rounded-2xl ${bgCls} p-5`}>
      <p className={`text-xs uppercase tracking-wider font-bold ${titleCls}`}>
        {title}
      </p>
      <div
        className={`mt-2 text-sm leading-relaxed ${
          tone === "navy" ? "text-white/85" : "text-repp-navy/80"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function TechCard({ label, stack }: { label: string; stack: string }) {
  return (
    <div className="rounded-xl bg-white border border-repp-gray p-4">
      <p className="text-xs uppercase tracking-wider text-repp-navy/55 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-sm text-repp-navy">{stack}</p>
    </div>
  );
}
