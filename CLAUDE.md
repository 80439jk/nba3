# CLAUDE.md — National Benefit Alliance (nba3)

## Project Overview

National Benefit Alliance is a lead-generation site that connects U.S. residents with free government benefit programs. It's organized by state and county, with a multi-step application funnel that forwards leads to a CRM (CallTools). Deployed on Vercel at https://nba3.vercel.app (custom domain: nationalbenefitalliance.com).

- **Stack**: static HTML + Vercel serverless functions (Node ≥18, deps: `pg`, `nodemailer`)
- **Backend**: a Supabase Edge Function (`submit-lead`) handles funnel submissions; lives in a separate repo at `/Users/larazielin/Desktop/nba/nba-supabase-backend/`
- **Tracking**: Google Tag Manager (GTM-MTQ5WNFR) on every HTML page. Google Ads is the primary traffic source and the business depends on call-conversion attribution.

---

## Build Approach & Non-Negotiables

Read this before proposing any change.

1. **Static HTML, not SPA.** Every page is fully self-contained — its own `<head>`, `<style>`, `<body>`. There is no global layout, no templating engine, no build system for HTML, no shared JS framework on the main site. This is deliberate: it keeps content identical for crawlers and users (no cloaking risk), keeps `tel:` links unwrapped for GTM call-click tracking, and lets Google Forwarding Number (GFN) swaps work natively. A React SPA shell exists under `apply/1/form/*` as a leftover from an earlier exploration — do not extend it or migrate pages to it.

2. **Sitewide changes go through a Python script.** With ~3,259 HTML pages and no template, edits across the site are made by writing a one-off Python script that walks the tree, applies a string-level replacement, and is idempotent (a second run is a no-op). Skip-dirs typically include `node_modules/`, `.git/`, and `apply/` (spare the funnel) or main-site dirs (spare them when only touching the funnel). Claude's output filter often blocks regenerating large HTML in-band, so the script approach is also the workaround. Spot-check a few files after running.

3. **Don't touch ad-tracking infrastructure without alignment.** The site's revenue depends on Google Ads driving calls. Specifically:
   - **Never** wrap, intercept, or add `onclick` / `preventDefault` to `<a href="tel:...">` links — GTM tracks them directly and GFN swaps the displayed number based on the exact `tel:` value.
   - **Never** rename `ty-call-btn` (the thank-you call button class) — it's a GTM trigger.
   - **Never** suppress or modify the GTM container snippet or dataLayer pushes.
   - **Never** add a new `tel:` link without confirming which Call Conversion action it should fire.
   - **Never** show different content to crawlers than to users (cloaking). Overlays, popups, and inactivity prompts are fine as long as the underlying HTML is identical for everyone.

4. **Phone numbers are segmented for attribution** — four lines, one per page type, never more than one on a page. See Phone Numbers below. Adding or moving a number requires the owner to update the matching Google Ads Call Conversion action and GTM tag in the GTM/Ads UI; code changes alone won't move conversions.

5. **Bot-detection fields on the contact step are load-bearing.** The honeypot (`hp_website`) and the time-trap (`form_duration_ms`) feed server-side bot detection in the edge function. Don't remove them, don't autofill them, don't bypass them in tests against production.

---

## Repository Structure

Everything Vercel serves lives under `nationalbenefitalliance/`:

```
nationalbenefitalliance/
├── index.html                  # homepage
├── vercel.json                 # rewrites, redirects, headers, caching
├── css/styles.css              # main-site stylesheet (funnel pages have CSS embedded inline)
├── js/main.js                  # main-site JS (mobile menu, search, etc.)
├── api/                        # Vercel serverless functions: search, sitemap, humans, send-pdf, register
├── backend/                    # separate Express server + PostgreSQL schema (not deployed to Vercel)
├── apply/
│   ├── popup.js                # 30-second inactivity popup, loaded on every funnel page
│   ├── 1/                      # legacy funnel — redirected to /apply/2; kept as fallback
│   └── 2/                      # live funnel (declared A/B winner)
├── about/, privacy/, terms/, stories/, resources/{...10 categories}
├── prototype/                  # design experiments — not linked from production
├── [50 state directories]/     # state landing pages
│   └── [county]/index.html     # ~3,200 county landing pages, identical template
└── sitemap*.xml, llms.txt, llms-full.txt
```

The 6 individual story pages are flat files (`stories/from-crisis-to-calling.html`, etc.) instead of `stories/<name>/index.html`. Walkers that target only `index.html` miss them — make sure sitewide scripts catch both conventions.

County pages use `<html lang="en" prefix="og: https://ogp.me/ns#">` while core/state pages use `<html lang="en">`.

---

## The Apply Funnel

`/apply/2/` is the only funnel receiving traffic. `vercel.json` issues permanent (308) redirects from `/apply/1` and `/apply/1/:path*` → `/apply/2` so any legacy bookmarks, ad variants, or deep links restart in funnel 2. The `/apply/1/` HTML is preserved as a rollback path; do not modify it or link to it.

### apply/2 — live funnel

| URL | Purpose |
|---|---|
| `/apply/2/` | Card-based hero landing page. Two sections inside one white card on a navy gradient: tile checkboxes for "what brings you here today" (Food, Utilities, Housing, Other → `nba_funnel.needs[]`) and a styled `<select>` for state (→ `nba_funnel.state`). Selecting a state auto-advances. Lower-page CTAs scroll to the top of the card, not deeper into the funnel. |
| `/apply/2/step-1-dob-citizen/` | DOB + citizenship status |
| `/apply/2/step-2-address/` | Street, city, ZIP |
| `/apply/2/step-3-income-employ/` | Annual income (4 buckets) + employment status |
| `/apply/2/step-4-contact/` | Name, email, phone, TCPA consent + honeypot + time-trap |
| `/apply/2/thank-you/` | Generates a 5-digit reference number (regenerates on refresh — known minor UX issue), shows the call CTA |

Each step file is self-contained (~1,300–1,450 lines), CSS embedded in `<head>`. Funnel state lives in `sessionStorage.nba_funnel`; thank-you display data in `sessionStorage.nba_ty`. Every page calls `captureUTM()` to persist UTM params (`utm_source/medium/campaign/content/term`) and Google Ads click IDs (`gclid`, `wbraid`, `gbraid`). `transaction_id` is a `crypto.randomUUID()` generated on first page load and forwarded with the submission.

### apply/1 — redirected fallback

Same general step structure as apply/2 but with generic step names (`step-1` … `step-5`) and one extra step at the front (state selection) since apply/2 collects state on the landing page. Reference only.

---

## Design System

Navy/amber palette. Use the CSS custom properties in `css/styles.css` rather than hardcoding hexes.

- **Navy**: `#1a2b47` (900, primary dark) · `#1e3a5f` (800) · `#ccdaf0` (100, borders) · `#e6eff9` (50, light surfaces)
- **Amber**: `#f59e0b` (500, primary CTA) · `#d97706` (600, hover) · `#fef3c7` (100) · `#fffbeb` (50)
- **Type**: body `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`; headings `'Poppins', 'Segoe UI', system-ui, sans-serif`
- **Header**: sticky, dark navy, white wordmark
- **Primary CTA**: amber-500 fill, white bold text, rounded-lg, soft shadow (no green CTAs)
- **Form cards**: white, `border-radius: 1rem`, shadow `0 10px 40px -10px rgba(0,0,0,.1)`
- **Progress bar** (funnel): amber fill on light gray track, "Step X of Y" + percent label
- **Thank-you call button**: large amber button with phone icon and class `ty-call-btn` (do not rename)

Funnel pages duplicate their CSS inline — there is no shared funnel stylesheet. Visual changes to the funnel require touching every step file (use the Python-script approach).

---

## Phone Numbers & Conversion Tracking

Four distinct lines, one per stage, so call-source attribution is unambiguous. **Never show two on the same page.**

| Line | Number | tel: href | Where it appears |
|---|---|---|---|
| Main site | `1-800-605-8906` | `tel:+18006058906` | Every non-funnel page (homepage, state/county, resources, stories, about, privacy, footer, schema.org `telephone`, PDF emails, `humans.txt`). Desktop header: plain navy icon + number next to "Apply Now". Hidden on mobile — duplicated into the hamburger menu. |
| Started funnel | `1-813-556-9954` | `tel:+18135569954` | Amber `.header__phone` pill on all 11 funnel landing + step pages (apply/1 and apply/2). Hours `M–Th 9:30a–8p · F 9:30a–6p ET` baked into the pill. Visible on mobile via the funnel header grid. |
| Completed funnel | `1-813-560-8063` | `tel:+18135608063` | Body call CTA on both thank-you pages only. Class `ty-call-btn`. |
| Popup | `1-813-556-9953` | `tel:+18135569953` | `apply/popup.js` only — the 30-second inactivity overlay. |

Previously rotated numbers `1-888-408-5650` and `1-855-767-9422` are retired; do not reintroduce.

**GTM setup**: each of the four numbers has its own Google Ads Call Conversion action and a matching GTM tag mapping that `tel:` value to the correct conversion label. Owner-managed in the GTM/Ads UI. Attribution uses the `_gcl_aw` cookie (90-day), so clearing `sessionStorage` between steps doesn't break it.

**Inactivity popup safety**: only fires after 30s of mouse/touch inactivity, well after Google's crawler has scored the page. Underlying HTML is identical for everyone — not cloaking.

`sessionStorage` keys in use: `nba_funnel` (step data), `nba_ty` (thank-you display), `nba_popup_shown` (popup-once flag).

---

## Vercel Configuration (`vercel.json`)

- Clean URLs, no trailing slashes
- **Redirects (308)**: `/apply/1` and `/apply/1/:path*` → `/apply/2`
- **Rewrites**: `/search` → `/api/search`, `/sitemap.xml` → `/api/sitemap`, `/humans.txt` → `/api/humans`
- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`
- Cache: `/css/*` immutable 1y, `/js/*` `must-revalidate`

---

## Backend — Supabase Edge Function `submit-lead`

Repo: `/Users/larazielin/Desktop/nba/nba-supabase-backend/supabase/functions/submit-lead/index.ts`. Supabase project `quhxbgsgtfvrasyjvaba` (us-east-2, Postgres 17).

**What it does**: receives the contact-step submission, runs server-side bot detection (honeypot + `form_duration_ms < 3000`), inserts into `leads` with `crm_status: pending`, forwards to CallTools, logs the request/response to `api_logs`, updates `crm_status` to success/failed, and on failure sends an alert email via Resend to `larazielin1@gmail.com`. Always returns HTTP 200 to the frontend regardless of CRM outcome — the frontend cannot detect CRM failure.

**Bot drops** (honeypot filled or duration too short): fake 200 OK, log to `bot_drops`, never enter `leads` or CallTools.

**CRM — CallTools** (`POST https://app.calltools.io/api/contacts/`, token auth):
- Phone normalized to E.164 (`+1XXXXXXXXXX`); DOB → derived `age`; TCPA boolean → string; income enum → numeric; click ID uses `gclid → wbraid → gbraid` fallback (so iOS 14+ privacy-safe clicks still get a `click_id`)
- Two response shapes handled: fresh-create (`id`) and duplicate-merge (`duplicate_contacts[0]` with `duplicate_action: "MERGE"`); `crm_action` column stores `CREATE` or `MERGE`
- `jornaya_leadid` falls back to the literal string `"STATIC_JORNAYA_ID_PLACEHOLDER"` when empty
- A previous CRM (Trackdrive) was fully removed; no references remain

**Tables**:
- `leads` — one row per submission; all funnel fields + UTM/click IDs + `crm_status` / `crm_lead_id` / `crm_action` / `crm_submitted_at`
- `api_logs` — one row per CRM call; full request/response payloads, http status, success flag
- `bot_drops` — one row per silently-dropped suspected bot; `detection_reason` (`honeypot_filled` / `too_fast`), `raw_payload`

**Env vars** (Edge Function Secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CALLTOOLS_API_TOKEN`, `RESEND_API_KEY`.

**Quirks**:
- Always 200, no input validation, no retries, CRM called exactly once per submission
- CallTools rejects obviously fake numbers (e.g. `+12222222222`) at its end — not a code bug
- `transaction_id` column is `text` (not `uuid`) for backwards compatibility with older `nba_<ts>_<rand>` rows; new rows use proper UUIDs

---

## Sitewide Changes — How To

Because there's no template, sitewide edits go through a Python script. The pattern that works:

1. Drop a script in the repo root (filename like `_descriptive_name.py`).
2. Walk `nationalbenefitalliance/`, skipping `node_modules/`, `.git/`, and any directory you don't want touched (commonly `apply/` to spare the funnel, or all main-site dirs to spare them when only touching the funnel).
3. Match a unique string and replace it; if the unique string isn't present in a file, skip silently. This is what makes the script idempotent — a second run finds nothing.
4. Print a count of files changed when the script finishes; spot-check 2–3 files plus the homepage in Vercel preview before committing.
5. Don't commit the script unless it's reusable; one-offs can stay local and you only commit the file changes.

For changes that touch only `index.html` files, remember the 6 flat story files don't follow that convention — extend the walker if those pages are in scope.
