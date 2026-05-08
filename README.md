# REPP Projectportal

Koopomgeving voor REPP Bedrijfsmakelaar. Eerste project: **De Hofman Haarlem** (`/de-hofman`).

Multi-project opgezet — datamodel ondersteunt meerdere projecten, deze deploy levert er één.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **sharp** voor server-side beeldverwerking

## Lokaal draaien

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. De root redirect naar `/de-hofman`.

## Productie build

```bash
npm run build
npm run start
```

## Project structuur

```
app/
  [projectSlug]/             # multi-project routes
    page.tsx                  # Home
    units/                    # plattegrond + detail
    bereken/                  # calculators (ondernemer/belegger)
    prijs/                    # vergelijking met buurprojecten
    documenten/               # PDF viewer + lijst
    reserveren/               # vrijblijvende reservering
    favorieten/               # bewaarde units
    welkom/                   # verificatie voor email-leads
  api/
    interest/                 # soft-conversion lead capture (mock)
    reservation/              # reserveringsverzoeken (mock)
    report/                   # mail-rapport calculator (mock)
    notify-status/            # status-notificatie subscribe (mock)

components/
  layout/                     # Header, Footer, StickyCTA, identity
  marketing/                  # Hero, ScarcityStrip, Testimonials, etc.
  unit/                       # UnitGrid, UnitCard, UnitQuickPreview, SaveForLater
  calculator/                 # MaandlastCalculator, RendementCalculator, HeroCalculator
  conversion/                 # WelcomeControle, ReservationForm, EmailCaptureForm, etc.
  info/                       # Locatie, InfoTabs

lib/
  types.ts                    # Project / Unit / Testimonial / etc. types
  projects/de-hofman.ts       # De Hofman data
  favorites.ts                # localStorage-backed favorites hook
  personalization.ts          # CLP lead profile + verified flag

public/
  images/hofman/renders/      # AI-renders
  images/logos/               # REPP, RENO, Credion
  docs/de-hofman/             # 9 PDF's
  video/de-hofman.mp4         # sfeervideo
```

## User flows

**Optie A: bekende lead (CLP, email, lead-form):**
Komt binnen via `/de-hofman/welkom?name=...&email=...&phone=...&modus=...`, bevestigt
gegevens, krijgt `verified: true`. Vanaf dan: 1-klik reservering, mail-rapport,
status-notificaties.

**Optie B: anonieme lead (Google, direct):**
Browse vrij. Op intent-momenten (PDF view, calculator-rapport, exit intent) wordt om
naam + email gevraagd. Wordt soft-verified profile.

## Mock API endpoints

Alle `/api/*` routes loggen naar console. Klaar voor koppeling aan:

- **Lead capture** → Resend / HubSpot / Mailchimp audience
- **Reserveringen** → Slack + database + Mollie iDeal voor 5%
- **PDF rapporten** → Puppeteer/Chromium render + Resend met attachment
- **Status notificaties** → notifications-tabel + cron job

## Vercel deploy

Build-clean en klaar voor Vercel. Geen env-variabelen nodig voor v0.

---

© REPP Bedrijfsmakelaar
