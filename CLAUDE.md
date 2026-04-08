# CLAUDE.md — National Benefit Alliance (nba3)

## Project Overview

National Benefit Alliance (NBA) is a lead-generation website that connects U.S. residents with free government benefit programs. The site is organized by state and county, with a multi-step application funnel. It is deployed on **Vercel** at **https://nba3.vercel.app**.

- **Stack**: Static HTML + serverless API routes (Vercel Functions), no frontend framework for the main site
- **Node**: >=18.x
- **Dependencies**: `pg` (PostgreSQL), `nodemailer` (email)
- **Tracking**: Google Tag Manager (GTM-MTQ5WNFR)
- **Domain**: nationalbenefitalliance.com

---

## Repository Structure

```
nba3/
└── nationalbenefitalliance/           # Vercel project root (all content lives here)
    ├── index.html                     # Homepage
    ├── package.json                   # Node deps (pg, nodemailer)
    ├── vercel.json                    # Rewrites, headers, caching rules
    ├── deploy.sh                      # Deployment script
    ├── sitemap.xml                    # Master sitemap
    ├── sitemap-{state}.xml            # Per-state sitemaps (50 files)
    ├── llms.txt / llms-full.txt       # LLM-related text files
    │
    ├── css/styles.css                 # Global site stylesheet
    ├── js/main.js                     # Global client-side JS
    │
    ├── api/                           # Vercel serverless functions
    │   ├── _data.js                   # Shared data/helpers
    │   ├── humans.js                  # /humans.txt endpoint
    │   ├── register.js                # Lead registration endpoint
    │   ├── search.js                  # Search endpoint
    │   └── send-pdf.js                # PDF generation/sending
    │
    ├── backend/                       # Backend server (separate from Vercel functions)
    │   ├── server.js                  # Express server
    │   ├── package.json
    │   ├── database/schema.sql        # PostgreSQL schema
    │   ├── data/                      # JSON data (california-counties.json, florida-counties.json)
    │   └── routes/
    │       ├── api.js
    │       ├── pages.js
    │       └── seo.js
    │
    ├── about/index.html
    ├── privacy/index.html
    ├── california-privacy/index.html
    ├── terms/
    ├── stories/
    │
    ├── resources/                     # Resource category pages
    │   ├── index.html
    │   ├── childcare/
    │   ├── employment/
    │   ├── food-assistance/
    │   ├── healthcare/
    │   ├── housing/
    │   ├── legal-aid/
    │   ├── senior-services/
    │   ├── transportation/
    │   └── utility-assistance/
    │
    ├── apply/                         # Application funnel
    │   ├── index.html                 # /apply landing
    │   └── 1/                         # Funnel version 1 (see detailed section below)
    │
    ├── prototype/                     # Design prototypes/experiments
    │   ├── cook-enhanced/
    │   ├── funnel/
    │   ├── redesign-earth-warmth/
    │   ├── redesign-minimal/
    │   ├── redesign-soft-trust/
    │   ├── stories-earth-warmth/
    │   ├── stories-minimal-editorial/
    │   ├── stories-soft-trust/
    │   └── utility-assistance/
    │
    ├── [50 state directories]/        # State landing pages
    │   ├── index.html                 # State page (e.g., /alabama/)
    │   └── [county]/index.html        # County pages (e.g., /alabama/jefferson/)
    │
    └── Documentation files:
        ├── DATA_EXTRACTION_INDEX.md
        ├── DEPLOYMENT.md
        ├── ENHANCED_TEMPLATE_ANALYSIS.json
        ├── GENERATION_SCRIPT_TEMPLATE.md
        ├── QUICK_REFERENCE.txt
        └── STATE_PROGRAM_DATA_EXTRACTION.json
```

**Total files**: ~3,361 (bulk is ~3,200 county-level landing pages)

---

## The Apply Funnel (`/apply/1/`)

There are **two parallel funnel implementations** in this directory:

### Active Funnel (Static HTML — USE THIS)
These are the pages currently in production and what the owner wants to iterate on:

| URL Path | File | Purpose |
|---|---|---|
| `/apply/1` | `apply/1/index.html` | Funnel landing page |
| `/apply/1/step-1` | `apply/1/step-1/index.html` | Step 1: Select your state |
| `/apply/1/step-2` | `apply/1/step-2/index.html` | Step 2: Basic info (DOB, citizenship) |
| `/apply/1/step-3` | `apply/1/step-3/index.html` | Step 3: Address (street, city, ZIP) |
| `/apply/1/step-4` | `apply/1/step-4/index.html` | Step 4: Household & income details |
| `/apply/1/step-5` | `apply/1/step-5/index.html` | Step 5: Contact info (name, email, phone + TCPA consent) |
| `/apply/1/thank-you` | `apply/1/thank-you/index.html` | Thank-you / call CTA page |

Each file is **self-contained** — all CSS is in an embedded `<style>` tag in `<head>` (no external CSS). Each file is ~1,300–1,450 lines. The CSS is duplicated across all 7 files.

### Inactive Funnel (React SPA — DO NOT USE for production changes)
These exist but are **not** the active production pages:

| URL Path | File |
|---|---|
| `/apply/1/start` | `apply/1/start/index.html` |
| `/apply/1/form/1-state` | `apply/1/form/1-state/index.html` |
| `/apply/1/form/2-basic-info` | `apply/1/form/2-basic-info/index.html` |
| `/apply/1/form/3-address` | `apply/1/form/3-address/index.html` |
| `/apply/1/form/4-household-income` | `apply/1/form/4-household-income/index.html` |
| `/apply/1/form/5-contact` | `apply/1/form/5-contact/index.html` |
| `/apply/1/thankyou` | `apply/1/thankyou/index.html` |

These are all React SPA shells (`<div id="root"></div>`) that load the **same Vite bundle**:
- `apply/1/assets/index-DOVXZXY4.js` — minified React 18.3.1 + app code (~115k tokens)
- `apply/1/assets/index-QQQfERWU.css` — compiled Tailwind CSS

**Important**: The SPA pages represent the **target design** that the static pages should match visually. The SPA uses the navy/amber color scheme described below.

---

## Design System

### Target Design (Navy/Amber — what we're moving toward)
The SPA funnel uses this scheme. The static pages are being updated to match.

**Colors:**
- Navy-900: `#1a2b47` (header bg, hero bg, dark sections)
- Navy-800: `#1e3a5f` (header border, gradients)
- Navy-50: `#e6eff9` (light card backgrounds)
- Navy-100: `#ccdaf0` (borders)
- Amber-500: `#f59e0b` (primary CTA buttons, progress bars, accents)
- Amber-600: `#d97706` (button hover states)
- Amber-50: `#fffbeb` (light amber backgrounds)
- Amber-100: `#fef3c7` (amber borders, pulse animation)
- Gray scale: standard Tailwind grays (#f9fafb through #111827)

**Typography:**
- Body: System sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`)
- Headings: `'Poppins', 'Segoe UI', system-ui, sans-serif`

**Key Components:**
- Header: Sticky, dark navy background, white "National Benefit Alliance" text
- Progress bar: Amber fill on gray track, "Step X of Y" + "XX% complete"
- Continue button: Amber-500, bold white text, rounded-lg, shadow
- Back button: Gray-100 bg with gray-300 border, "< Back" text
- Form cards: White, rounded-xl (1rem), soft shadow (`0 10px 40px -10px rgba(0,0,0,.1)`)
- Hero sections: Navy gradient background with white text
- CTA buttons: All amber (not green)
- Call button (thank-you page): Amber-500, large with phone icon

### Legacy Design (Blue/Green — being replaced)
The static pages originally used:
- Blue-600: `#2563eb` (buttons, progress, accents)
- Green-600: `#16a34a` (CTA buttons)
- White header with gray border
- Blue progress bar fill
- Blue "Continue" buttons, green hero/CTA buttons

---

## Phone Numbers

- **Current number**: `1-888-408-5650` / `tel:18884085650`
- **Previous number**: `1-855-767-9422` / `tel:18557679422` (replaced)
- Phone number appears on the thank-you pages (both static and SPA) in three places:
  1. Display text: `1-888-408-5650`
  2. `tel:` link on call button
  3. DataLayer push for analytics tracking

---

## Vercel Configuration

From `vercel.json`:
- Clean URLs enabled (no `.html` extensions)
- Trailing slashes disabled
- Rewrites: `/search` → `/api/search`, `/sitemap.xml` → `/api/sitemap`, `/humans.txt` → `/api/humans`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- Cache: CSS/JS immutable (1yr), SPA assets immutable (1yr)

---

## Key Preferences & Decisions

1. **Static HTML over SPA for production** — The owner prefers the static HTML funnel (`/step-1` through `/step-5`) over the React SPA (`/form/1-state` through `/form/5-contact`) for the production funnel, even though the SPA has the desired design
2. **Self-contained pages** — Each HTML page contains its own CSS in `<style>` tags; no shared external stylesheet for the funnel
3. **Design direction** — Moving from blue/green scheme to navy/amber to match the SPA's look
4. **Phone number changes** should be updated in BOTH the static pages AND the React bundle
5. **GTM tracking** is on every page (GTM-MTQ5WNFR)
6. **The funnel collects**: state, DOB, citizenship status, address, household income, employment status, name, email, phone (with TCPA consent)
7. **Thank-you page** generates a random 5-digit reference number and pulls user info from sessionStorage (`nba_ty`)

---

## In-Progress Work

- **Restyling the static funnel pages** (`/apply/1/index.html`, `step-1` through `step-5`, `thank-you`) from blue/green to navy/amber to match the SPA design. Key changes:
  - Header: white → dark navy
  - Progress bar: blue → amber
  - Continue buttons: blue → amber
  - Hero/CTA sections: blue/green gradients → navy/amber
  - Form cards: rounder corners, softer shadows
  - Call button on thank-you: green → amber
