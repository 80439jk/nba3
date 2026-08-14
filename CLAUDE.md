# CLAUDE.md — National Benefit Alliance (nba3)

## Project Overview

National Benefit Alliance is a lead-generation site that connects U.S. residents with free government benefit programs. It's organized by state and county, with a multi-step application funnel that forwards leads to a CRM (CallTools). Deployed on Vercel at https://nba3.vercel.app (custom domain: nationalbenefitalliance.com).

- **Stack**: static HTML + Vercel serverless functions (Node ≥18, deps: `pg`, `nodemailer`)
- **Backend**: a Supabase Edge Function (`submit-lead`) handles funnel submissions; lives in a separate repo at `/Users/larazielin/Desktop/nba/nba-supabase-backend/`
- **Tracking**: Google Tag Manager (GTM-MTQ5WNFR) on every HTML page. Google Ads is the primary traffic source and the business depends on call-conversion attribution.

> **Design decisions & principles** for the lead pipeline + reporting live in [`DECISIONS.md`](DECISIONS.md). It reflects the live system and supersedes any older prose below where they conflict (e.g. the backend is now **dual-CRM** — CallTools **and** Caliber — with retry, empty-value stripping, a guaranteed `transaction_id`, and MCP-based deploys).

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
│   ├── 2/                      # primary Google funnel (declared A/B winner)
│   ├── 3/                      # RETIRED A/B variant — redirected to /apply/2; archived, not deleted
│   ├── 4/                      # active A/B variant — lean funnel (fewer fields/step); ad-only, noindex
│   └── 0/, oa1/, bg1/          # source-specific clones (organic, OpenAI, Bing) — see clones section
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

`/apply/2/` is the primary Google funnel. `vercel.json` issues permanent (308) redirects from `/apply/1`, `/apply/1/:path*`, `/apply/3`, and `/apply/3/:path*` → `/apply/2`, so legacy bookmarks, retired-variant links, and deep links restart in funnel 2. The `/apply/1/` and `/apply/3/` HTML is preserved as a rollback/archive path; do not modify it or link to it.

**`/apply/4/` is an active lean A/B variant** of apply/2 (fewer fields per step) — ad-only, `noindex`, served statically. It's live but dormant until a slice of Google Ads traffic is pointed at it to test call-conversion rate against apply/2. Source-specific clones (`apply/0` organic, `apply/oa1` OpenAI, `apply/bg1` Bing) are covered in the clones section below.

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

### apply/4 — active lean A/B variant

A conversion-rate variant of apply/2 with **fewer fields per step**. Flow: landing (need type only, **no state**) → `step-1-dob` (DOB only, **no citizenship**) → `step-2-zip` (ZIP only, **no street/city**) → `step-3-phone` (phone only) → `step-4-name-email` (first/last/email + TCPA consent + TrustedForm + honeypot/time-trap, **submits the lead**) → `thank-you` / `thank-you-2`. Purely additive; reuses apply/2's phone numbers (so it fires the **same** call conversions by `tel:` value — no new Ads setup), backend edge function, GTM, and bot detection. Dropped fields (`citizenship`, `street_address`, `city`, `annual_income`, `employment_status`) post as blank strings — the backend accepts this; `state` is backfilled from the ZIP via an embedded `zipToState()` map. DOB is kept, so `age` derives normally. **Before pointing ads here**, confirm the GTM "Completed funnel" trigger matches `/apply/4/thank-you/` and run one test lead. See `apply/4/README.md`.

### apply/3 — retired A/B variant (archived)

"Claim Code" Variant B. **A/B tested against apply/2 and lost**, so it's retired: `vercel.json` 308-redirects `/apply/3` and `/apply/3/:path*` → `/apply/2`, and it's removed from the sitemap. The HTML is **preserved in place as a rollback/archive reference** (see the RETIRED banner in `apply/3/README.md`) — do not modify it or link to it.

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

### Source-specific funnel clones (OpenAI, organic, …)

Traffic-source attribution is handled by **cloning the funnel per source and hardcoding a dedicated line into the clone** — NOT by dynamically swapping numbers inside the Google funnel. This keeps the Google funnel (`apply/2`) and its Google Ads / GFN / GTM tracking completely untouched. Each clone is `noindex, nofollow` (inherited) and ad-only.

| Source funnel | Dedicated line | Notes |
|---|---|---|
| `apply/oa1` | **OpenAI** `1-239-456-9477` / `tel:+12394569477` | Clone of `apply/2`. **All** funnel-visible lines (started + completed thank-you + popup) use this one OpenAI number. Ads point at `/apply/oa1/`. |
| `apply/bg1` | **Bing/Microsoft** — 3 lines: Funnel `1-239-480-9440` / `tel:+12394809440` · ThankYou `1-239-480-9438` / `tel:+12394809438` · Popup `1-645-238-9372` / `tel:+16452389372` | Clone of `apply/2`. **Keeps the 3-way segmentation** (started/completed/popup) rather than collapsing to one number like oa1. UET tracking lives in **GTM**, not inline. Ads point at `/apply/bg1/`. See `BING-SOURCE-README.md`. |
| `apply/0` | Organic `1-239-456-9476` (thank-you only) | Pre-existing organic clone; uses the shared `/apply/popup.js` (813 popup line). |

**`apply/oa1` specifics** (OpenAI PPC funnel):
- **Number:** every call button (`.header__phone`, thank-you `.ty-call-btn`, popup) dials `+12394569477`. The footer main-site line `+18006058906` is intentionally left as-is.
- **Dedicated popup:** `apply/oa1/popup.js` is a copy of `apply/popup.js` with only the phone number changed. It is a divergent copy — **if you change popup behavior, mirror it here too** (see popup-sync note below).
- **OpenAI Pixel:** the vendor snippet (pixel id `QGuEefUgZBP6rpS45mJE5u`, `debug:true`) is hardcoded near the top of `<head>` on all 7 oa1 pages. Loads for every oa1 visitor (all of whom are OpenAI). Verbatim — do not edit the vendor snippet.
- **Conversion:** `apply/oa1/oa-track.js` fires `oaiq("measure","registration_completed",{type:"customer_action"})` on any click of the OpenAI call button (`tel:+12394569477`). It is a **passive** listener — no `onclick`/`preventDefault`, so the call dials normally.

**`apply/bg1` specifics** (Bing/Microsoft PPC funnel):
- **Numbers — 3-way segmentation (deliberately unlike oa1's single line):**
  - **Funnel** `+12394809440` — header `.header__phone` pill + step CTAs on landing + steps 1–4 + the `thank-you-2` fallback page.
  - **ThankYou** `+12394809438` — the CRM-accepted `thank-you` body call button (`.ty-call-btn`) only.
  - **Popup** `+16452389372` — `apply/bg1/popup.js` only.
  - The footer main-site line is left as-is (apply/2 has no other numbers inside the funnel).
- **Dedicated popup:** `apply/bg1/popup.js` is a number-only copy of `apply/popup.js` — same divergent-copy rule as oa1: mirror any popup *behavior* change here too.
- **No inline pixel, no conversion-fire script.** Microsoft UET is a standard GTM tag, so it lives in the **GTM container** (`GTM-MTQ5WNFR`, already on every page). The owner installs the UET base tag + a UET conversion/event tag in GTM, scoping the conversion trigger to the Bing `tel:` values (`+12394809440` / `+12394809438`) or the `/apply/bg1/` path so Bing calls stay isolated from Google-funnel calls. This is the intentional difference from oa1, whose OpenAI pixel isn't GTM-manageable.

**Rule for any NEW source funnel:** clone `apply/2`, rewrite `/apply/2/` → `/apply/<name>/`, substitute the dedicated line into every call button (and its dedicated popup copy), add the source's pixel to `<head>`, and add the source's conversion-fire script. Do **not** add source-detection or number-swap logic to the Google funnel. *(Exception: when the source's tracking is a standard GTM tag — e.g. Microsoft UET, as in `apply/bg1` — install it in the GTM container instead, and skip the inline pixel + conversion-fire script.)*

**GTM setup**: each of the four numbers has its own Google Ads Call Conversion action and a matching GTM tag mapping that `tel:` value to the correct conversion label. Owner-managed in the GTM/Ads UI. Attribution uses the `_gcl_aw` cookie (90-day), so clearing `sessionStorage` between steps doesn't break it.

**Inactivity popup safety**: only fires after 30s of mouse/touch inactivity, well after Google's crawler has scored the page. Underlying HTML is identical for everyone — not cloaking.

**Popup behavior (KEEP IN SYNC WITH UB `qualify/popup.js`)**: `apply/popup.js` is a sibling of the UtilityBenefits popup; the two must stay behaviorally identical — only brand skin (NBA amber/navy + Poppins vs UB emerald/green + DM Sans) and the phone number differ. When you change one, change the other and update both CLAUDE.md files. **Also mirror any behavior change into the number-only forks `apply/oa1/popup.js` (OpenAI) and `apply/bg1/popup.js` (Bing).** Canonical behavior:
- Fires after **30s** of mouse/touch inactivity (`DELAY = 30000`) — never shorten.
- Shows **once per session** (`nba_popup_shown` / UB `ub_popup_shown`).
- **Re-pops after close:** once shown per session, the popup **re-appears 30s after the visitor closes it** on that page (the inactivity timer re-arms on mouse/touch — intentionally no teardown). This is the long-standing behavior the owner wants; do not add a once-and-done teardown without owner sign-off.
- Runs on landing + every funnel step + thank-you (`apply/2/`).
- **Reference number:** on the thank-you page it reads `#refNumber` and shows it inside the card (UB reads `#ty-case-number`); the number lives inside the popup so a caller always has it.
- Uses its own dedicated `tel:` line for clean attribution; plain `tel:` anchor, no `onclick`.

`sessionStorage` keys in use: `nba_funnel` (step data), `nba_ty` (thank-you display), `nba_popup_shown` (popup-once flag).

---

## Vercel Configuration (`vercel.json`)

- Clean URLs, no trailing slashes
- **Redirects (308)**: `/apply/1`, `/apply/1/:path*`, `/apply/3`, `/apply/3/:path*` → `/apply/2` (apply/1 legacy + apply/3 retired variant)
- **Rewrites**: `/search` → `/api/search`, `/sitemap.xml` → `/api/sitemap`, `/humans.txt` → `/api/humans`
- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`
- Cache: `/css/*` immutable 1y, `/js/*` `must-revalidate`

---

## Backend — Supabase Edge Function `submit-lead`

Repo: `/Users/larazielin/Desktop/nba/nba-supabase-backend/` (under git, branch `main`, GitHub remote `lalazeelady/nba-supabase-backend`). The function source is at `supabase/functions/submit-lead/index.ts`. Supabase project `quhxbgsgtfvrasyjvaba` (us-east-2, Postgres 17). Deployment is manual via the Supabase dashboard — paste the file contents into the Edge Functions editor and click Deploy.

**What it does**: receives the contact-step submission, runs server-side bot detection (honeypot + `form_duration_ms < 3000`), runs server-side phone validation (NANP rules — see below), inserts valid leads into `leads` with `crm_status: pending`, forwards to CallTools, logs the request/response to `api_logs`, updates `crm_status` to success/failed, and on failure sends an alert email via Resend to `larazielin1@gmail.com`. Always returns HTTP 200 to the frontend regardless of CRM outcome — the frontend cannot detect CRM failure.

**Silent drops to `bot_drops`** (fake 200, never enter `leads` or CallTools, no Resend email):
- Honeypot field (`hp_website`) is non-empty → `detection_reason: honeypot_filled`
- `form_duration_ms < 3000` → `detection_reason: too_fast`
- Phone fails NANP validation → `detection_reason: invalid_phone:<sub>` where `<sub>` is `wrong_length`, `nanp_violation`, or `all_same_digit`. Mirrors the client-side validator at `/apply/2/step-4-contact` so direct-POST attempts (curl/scripts that bypass the form) get the same rejection. Catches placeholders like `5551234567` and CallTools-rejected real-world inputs like `9290898075` without spending a CallTools call or firing an alert email.

**CRM — CallTools** (`POST https://app.calltools.io/api/contacts/`, token auth):
- Phone normalized to E.164 (`+1XXXXXXXXXX`); DOB → derived `age`; TCPA boolean → string; income enum → numeric; click ID uses `gclid → wbraid → gbraid` fallback (so iOS 14+ privacy-safe clicks still get a `click_id`)
- Two response shapes handled: fresh-create (`id`) and duplicate-merge (`duplicate_contacts[0]` with `duplicate_action: "MERGE"`); `crm_action` column stores `CREATE` or `MERGE`
- `jornaya_leadid` falls back to the literal string `"STATIC_JORNAYA_ID_PLACEHOLDER"` when empty
- A previous CRM (Trackdrive) was fully removed; no references remain

**Tables**:
- `leads` — one row per submission; all funnel fields + UTM/click IDs + `crm_status` / `crm_lead_id` / `crm_action` / `crm_submitted_at`
- `api_logs` — one row per CRM call; full request/response payloads, http status, success flag
- `bot_drops` — one row per silently-dropped submission. `detection_reason` is one of `honeypot_filled`, `too_fast`, or `invalid_phone:<sub>` (with sub-reasons `wrong_length` / `nanp_violation` / `all_same_digit`). Use `WHERE detection_reason LIKE 'invalid_phone%'` to filter all phone drops. Also stores `ip_address`, `user_agent`, `form_duration_ms`, `raw_payload` (jsonb).

**Env vars** (Edge Function Secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CALLTOOLS_API_TOKEN`, `RESEND_API_KEY`.

**Quirks**:
- Always 200, no retries, CRM called exactly once per submission. The only server-side validation is the NANP phone check (see "Silent drops" above); other fields go through unvalidated.
- CallTools also rejects obviously fake numbers (e.g. `+12222222222`) at its end — caught by the server-side validator first now, but historical `api_logs` rows show this pattern.
- `transaction_id` column is `text` (not `uuid`) for backwards compatibility with older `nba_<ts>_<rand>` rows; new rows use proper UUIDs.

---

## Sitewide Changes — How To

Because there's no template, sitewide edits go through a Python script. The pattern that works:

1. Drop a script in the repo root (filename like `_descriptive_name.py`).
2. Walk `nationalbenefitalliance/`, skipping `node_modules/`, `.git/`, and any directory you don't want touched (commonly `apply/` to spare the funnel, or all main-site dirs to spare them when only touching the funnel).
3. Match a unique string and replace it; if the unique string isn't present in a file, skip silently. This is what makes the script idempotent — a second run finds nothing.
4. Print a count of files changed when the script finishes; spot-check 2–3 files plus the homepage in Vercel preview before committing.
5. Don't commit the script unless it's reusable; one-offs can stay local and you only commit the file changes.

For changes that touch only `index.html` files, remember the 6 flat story files don't follow that convention — extend the walker if those pages are in scope.
