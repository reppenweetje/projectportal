# FLIP_HANDOFF.md — overdracht aan Flip

> Welkom Flip 👋
>
> Dit is de **live codebase van dehofman.nl**. Hieronder: wat live staat,
> hoe de repo's en Vercel-projecten in elkaar zitten, waar je werkt, en
> wat er nog open staat.
>
> Laatst bijgewerkt: 2026-05-21, einde opzet-sessie.

## TL;DR

- **Jij werkt in deze repo** (`reppenweetje/projectportal`).
- Elke `git push` naar `main` → deployt automatisch naar **dehofman.nl**.
- Werk via branches + pull requests; Vercel maakt automatisch preview-URLs.

## Repo- en Vercel-kaart

```
dehofman.nl ──serveert──> Vercel-project "dehofman" ──git──> reppenweetje/projectportal
                                                              ↑ DEZE REPO — hier werken
```

| GitHub-repo | Rol |
|---|---|
| **`reppenweetje/projectportal`** | ✅ LIVE codebase voor dehofman.nl — hier werk je |
| `reppenweetje/projectomgeving` | Standby — een andere (chapter-based) variant. Niet live. Mogelijk later voor `projecten.repp.nl`. |
| `reppenweetje/dehofman.nl-website` | Oude statische site, nu alleen een 301-redirect-stub voor oude links |

| Vercel-project (team REPP Pro) | Git-koppeling | Domein |
|---|---|---|
| **`dehofman`** | `reppenweetje/projectportal` | dehofman.nl + www.dehofman.nl |
| `projectportal` | `reppenweetje/projectportal` | alleen `.vercel.app` |
| `projectomgeving` | `reppenweetje/projectomgeving` | alleen `.vercel.app` |

### ⚠️ Let op — dubbele Vercel-koppeling

`reppenweetje/projectportal` hangt aan **twee** Vercel-projecten (`dehofman`
én `projectportal`). Elke push triggert dus 2 deploys. Niet schadelijk voor
de live site, maar verspilt build-minuten. Advies: ontkoppel/verwijder het
losse `projectportal` Vercel-project — alleen `dehofman` hoeft te bestaan.

## Tech-stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- `sharp` voor server-side beeldverwerking
- Self-hosted Montserrat via `next/font`
- Vercel deploy
- Plausible analytics (privacy-vriendelijk, geen cookies)

## Project-structuur

```
app/
  [projectSlug]/          # multi-project routes (live: /de-hofman, via middleware schoon = /)
    page.tsx              # home — marketing landing
    units/                # plattegrond + unit-detail
    bereken/              # calculators (ondernemer + belegger)
    prijs/                # prijsvergelijking met buurprojecten
    documenten/           # PDF-lijst + viewer
    reserveren/           # reservering-flow (mock backend)
    favorieten/           # bewaarde units
    info/                 # projectinformatie
    insider/              # insider-list aanmelding
    welkom/               # verificatie voor email-leads
    xxl/                  # XXL-units interesse-flow
  admin/                  # admin-dashboard (password-gated)
  api/                    # mock endpoints (insider, interest, reservation, etc.)
  sitemap.ts              # /sitemap.xml — auto-gegenereerd
  robots.ts               # /robots.txt
  layout.tsx              # root layout — Montserrat, metadata, Plausible
components/
  marketing/              # MinimalHero, TrustStack, Testimonials, Gallery, etc.
  calculator/             # HeroCalculator, Maandlast, Rendement
  conversion/             # ReservationForm, InsiderSignup, InterestCapture, etc.
  unit/                   # UnitGrid, UnitCard, FavoriteButton, plattegrond
  layout/                 # Header, Footer, StickyCTA, MobileMenu
  info/                   # info-pagina blokken
  admin/                  # admin-dashboard widgets
lib/
  projects/de-hofman.ts   # ALLE projectdata: units, prijzen, specs, partners
  types.ts                # TypeScript types (Project, Unit, etc.)
  track.ts                # Plausible custom-event helper
  favorites.ts            # localStorage favorieten
  personalization.ts      # lead-profiel (CLP / WhatsApp herkenning)
  utils.ts                # helpers (formatEuro, WhatsApp-link, etc.)
  admin/                  # admin mock-data
middleware.ts             # clean-URL routing (zie onder)
```

## Hoe clean URLs werken

`middleware.ts` zorgt dat de site op dehofman.nl schone URLs heeft:
- Bezoeker op `/` → intern gerendered als `/de-hofman` (URL blijft `/`)
- Bezoeker op `/units` → intern `/de-hofman/units` (URL blijft `/units`)
- `/de-hofman/...` → 301 redirect naar `/...`

Gestuurd door env-var `NEXT_PUBLIC_DEFAULT_PROJECT=de-hofman` op Vercel.
Zonder die env-var draait de site in multi-project modus (`/de-hofman/...`).

## Wat er in de opzet-sessie is toegevoegd

- `middleware.ts` — clean URLs
- `app/sitemap.ts` + `app/robots.ts` — SEO basis
- `app/layout.tsx` — metadataBase, OpenGraph, Twitter-card, **Plausible script**
- `lib/track.ts` — typed Plausible custom-event helper
- Unit-statussen gesynct met REPP's situatieplattegrond (20-5-2026)
- 6 Plausible custom-events (zie Analytics hieronder)

## Analytics — Plausible

Script staat in `app/layout.tsx` (`pa-eFSYAFqqhvm0T_2-rG-QC.js`). Page views
worden automatisch getrackt. Custom-events via `track()` uit `lib/track.ts`:

| Event | Wanneer | Properties |
|---|---|---|
| `reservation_submitted` | reserveer-formulier verzonden | unit, unitType, unitStatus, contactMoment, verified, source |
| `interest_captured` | soft-conversion e-mail-capture | source, context |
| `insider_signed_up` | Insider-list aanmelding | source, modus, topic |
| `xxl_interest` | XXL-interesse formulier | woningKeuze, unitKeuze, contactMoment, hasGebruik |
| `report_requested` | calculator-rapport per mail | reportType |
| `unit_favorited` | unit toegevoegd aan favorieten | unit |

Nieuw event toevoegen: voeg de naam toe aan de `EventName`-union in
`lib/track.ts`, dan `track("naam", { props })` aanroepen.

In het Plausible-dashboard kun je deze events als **Goals** markeren voor
funnel-rapportage.

## Unit-data — `lib/projects/de-hofman.ts`

Alle 14 units worden gegenereerd door `buildUnit(n)`. Status komt uit de
`status(n)`-functie. **Actuele verdeling (20-5-2026):**

| Status | Units |
|---|---|
| `sold` (verkocht) | 1, 2, 3, 8, 9, 10 |
| `verkocht_ovb` (onder voorbehoud) | 11 |
| `in_optie` (onder optie) | 6, 12, 13 |
| `available` (beschikbaar) | 4, 5 |
| `coming_soon` (XXL, nog niet vrij) | 7, 14 |

**Statuswijziging:** pas de `status(n)`-functie aan + de comment-block erboven.
Houd ze synchroon.

## Wat nog open staat / aandachtspunten

1. **Dubbele Vercel-koppeling** opruimen (zie ⚠️ hierboven)
2. **Echte content verifiëren** — Jann moet bevestigen: oplevering-datum,
   architect/aannemer/notaris, exacte specs. Niet-bevestigde claims niet
   als feit op een live site zetten.
3. **Echte renders/foto's** — controleer `/public/images/hofman/` op
   actuele beelden
4. **Lighthouse-baseline** — draai een audit op de nieuwe live:
   ```bash
   npx lighthouse https://www.dehofman.nl/ --quiet --output=json \
     --output-path=/tmp/lh.json --chrome-flags="--headless=new" \
     --form-factor=mobile --throttling-method=simulate
   ```
5. **`ExitIntentModal`** — projectportal heeft een exit-intent popup.
   Check of dat gewenst blijft; popups kunnen conversie schaden.
6. **Admin-dashboard** (`/admin`) draait op mock-data — echte data-koppeling
   is fase 2.

## Mogelijke verbeteringen (door Jann benoemd)

**Carrousel** — een betere visuele media-rij. Let op: auto-roterende
carrousels zijn slecht voor UX/accessibility. Beter: een handmatige
gallery-strip (horizontaal scrollen met snap-points) of een lightbox-grid.
Wacht hiermee tot er echte renders zijn.

**SEO** — al aanwezig: sitemap, robots, FAQ JSON-LD, OpenGraph meta.
Nog te doen: per-unit `Product/Offer` JSON-LD, `BreadcrumbList` JSON-LD,
image alt-tekst audit, Google Search Console verifiëren met dehofman.nl,
Vercel Web Analytics aanzetten.

## Hoe werk je in deze repo

### Lokaal
```bash
git clone https://github.com/reppenweetje/projectportal.git
cd projectportal
npm install
npm run dev          # http://localhost:3000

# Voor single-project modus (zoals live):
NEXT_PUBLIC_DEFAULT_PROJECT=de-hofman npm run dev
```

### Content-wijziging via GitHub (geen lokale setup nodig)
1. Open het bestand op github.com/reppenweetje/projectportal
2. Pen-icoon → bewerk → "Commit changes" → "Create a new branch"
3. "Create pull request"
4. Vercel-bot post automatisch een preview-URL binnen ~2 min
5. Check de preview, merge daarna

### Belangrijkste bestanden voor content
| Wat | Bestand |
|---|---|
| Units, prijzen, specs, partners, makelaar | `lib/projects/de-hofman.ts` |
| Marketing-secties op de home | `components/marketing/` |
| Calculators | `components/calculator/` |
| Reserveer/contact-formulieren | `components/conversion/` |

## Open vragen voor Jann

1. Echte oplevering- en bouw-datums?
2. Architect / aannemer / notaris — officiële namen?
3. Sales-aanspreekpunt: wie, met foto + telefoon?
4. Renders/foto's — staan de actuele versies in `/public/images/hofman/`?
5. ExitIntentModal — behouden of weghalen?
6. Tweede project op `projecten.repp.nl` — wanneer, en `projectportal` of
   `projectomgeving` als basis?

Veel succes! Vragen over het project → Jann. Vragen over de code → deze
repo + de inline comments.
