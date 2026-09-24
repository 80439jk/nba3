# CLAUDE.md — National Benefit Alliance (nba3)

Lead-generation site. It connects U.S. residents with free government benefit programs, by state and county. A multi-step funnel sends leads to the CRMs. Google Ads call conversions are the main revenue source.

- **Site**: static HTML + Vercel serverless functions (Node ≥18). Live at https://nba3.vercel.app (nationalbenefitalliance.com). Vercel serves only `nationalbenefitalliance/`.
- **Backend**: Supabase Edge Function `submit-lead`, in the sibling repo `../nba-supabase-backend/`. Pipeline, CRM, reporting, and deploy rules are in [`DECISIONS.md`](DECISIONS.md). Read it before you change the backend or funnel fields.
- **Tracking**: GTM `GTM-MTQ5WNFR` is on every page.

## Non-negotiables

1. **Static HTML only.** Each page is self-contained (own `<head>`, `<style>`, `<body>`). No templates, no build step, no SPA. Do not add them.
2. **Ad tracking. Do not do these without owner approval:**
   - Wrap, intercept, or add `onclick`/`preventDefault` to `<a href="tel:...">`. GTM and Google Forwarding Numbers read the exact `tel:` value.
   - Rename `ty-call-btn`. It is a GTM trigger.
   - Change the GTM snippet or dataLayer pushes.
   - Add a `tel:` link before the owner confirms its Call Conversion action.
   - Show crawlers different content than users. Overlays and popups are OK if the HTML is the same for all.
3. **One phone line per page.** To add or move a number, the owner must update GTM and Google Ads. A code change alone does not move conversions.
4. **Bot-detection fields are load-bearing:** honeypot `hp_website` and time-trap `form_duration_ms`. Do not remove, autofill, or bypass them against production.
5. **Do not change or link to the archived funnels** `apply/1/` and `apply/3/`. They redirect to `/apply/2` and stay for rollback.
6. **`info/yt1/` is generated** by `_build_yt1_variant.py`. Do not hand-edit it. Change the script and run it again.

## Sitewide edits (~3,300 HTML pages)

Use a one-off, idempotent Python script in the repo root (`_descriptive_name.py`):
1. Walk `nationalbenefitalliance/`. Skip `node_modules/`, `.git/`, and folders out of scope (usually `apply/` + `info/`, or all main-site folders).
2. Match a unique string and replace it. Skip files that do not contain it, so a second run changes nothing.
3. Print the count of changed files. Spot-check 2–3 files and the homepage in a Vercel preview.
4. Commit the script only if it is reusable.

Gotchas:
- The 6 story pages are flat files (`stories/<name>.html`), not `index.html`. Include them.
- County pages use `<html lang="en" prefix="og: https://ogp.me/ns#">`. Other pages use `<html lang="en">`.
- Funnel pages have inline CSS (no shared funnel stylesheet). A visual funnel change touches every step file.
- Change call-hours captions only with `_set_hours.py` (see `HOURS.md`).
- Main site: use the CSS custom properties in `css/styles.css`, not hardcoded hex values. Primary CTAs are amber, never green.

## Structure

```
nationalbenefitalliance/
├── index.html, vercel.json, css/styles.css, js/main.js
├── api/                   # Vercel functions
├── backend/               # old Express + Postgres server. NOT deployed.
├── info/popup.js          # shared 30s inactivity popup
├── apply/2/               # old Google funnel, still live, to retire
├── apply/{0,1,3,bg1,oa1}/ # archived, 308-redirected to /info/ replacements
├── info/{00,01,02,bg1,oa1,yt1}/  # live funnels (neutral URLs)
├── prototype/             # experiments, not linked
├── about/, privacy/, terms/, stories/, resources/
└── [state]/[county]/index.html   # ~3,200 county pages, one template
```

## Funnels

| Funnel | Role | `landing_page` | TCPA checkbox |
|---|---|---|---|
| `info/02` | Primary Google funnel. Paid Google ads land here. | `info02` | required |
| `info/00` | Organic. **All main-site CTAs point here.** | `info00` | optional |
| `info/01` | Lean A/B variant (fewer fields). Ad-only. Has live traffic; do not edit. | `info01` | optional |
| `info/bg1` | Bing clone of info/02 (generated) | `bg1` | required |
| `info/oa1` | OpenAI clone of info/02 (generated) | `oa1` | required |
| `info/yt1` | YouTube clone of info/02 (generated) | `yt1` | required |
| `apply/2` | Old Google funnel. Superseded by info/02, still live. Retire it. | `apply2` | required |

- **info/02 flow:** landing (needs tiles + state) → `step-1-dob-citizen` → `step-2-address` → `step-3-income-employ` → `step-4-contact` (submits) → `thank-you`.
- **info/01 flow:** landing (needs only) → `step-1-dob` → `step-2-zip` → `step-3-phone` → `step-4-name-email` (submits). Dropped fields post as blank strings. `state` comes from the ZIP (`zipToState()`). Before ads go here, confirm the GTM "Completed funnel" trigger matches `/info/01/thank-you/` and send one test lead. See `info/01/README.md`.
- **Put new funnel variants under `/info/NN/`**, not `/apply/`. Ad URLs must not contain "apply" or "qualify".
- **The govt-services-policy rewrite (Sep 2026).** No page may imply NBA applies for, matches you to, or enrolls you in a government program. `info/02` is the rewritten Google funnel, `info/00` the rewritten organic one; `apply/0` and the old source funnels 308-redirect to their replacements. Every page carries the `.gov-bar` disclosure strip or the combined footer disclosure. **`info/01` was deliberately left out** — it has live traffic and those ads are being paused instead.
- **Generated funnels.** `info/yt1` comes from `_build_yt1_variant.py`; `info/bg1` and `info/oa1` from `_build_source_funnels.py`. All three clone **`info/02`**, so a copy change there must be followed by re-running both scripts. Do not hand-edit the generated directories. `_build_source_funnels.py` asserts **per page** that the source's own line is present and that no other `tel:` appears, so a number that drifts on a single page fails the build instead of shipping silently. Both scripts also refuse to write a page still containing a Google-funnel string.
- **`apply/2` is still live and duplicates `info/02`.** Retire it once conversions are confirmed on the new URL: delete the directory and add the 308 in `vercel.json`, the same way `apply/0` was retired.
- **Field parity:** all 7 live funnels post the same field set, plus `landing_page` and `needs[]`. Keep them identical. Drift loses attribution silently. Use `_field_parity.py` for this type of change.
- **TCPA consent** must be a real checkbox. Never hardcode `true` or use a hidden field. An unchecked box posts `tcpa_consent: false`. Do not SMS those leads. `.tcpa-group` is spacing only: no background, no border (owner decision; UB `.tcpa-box` matches).
- **Client state:** `sessionStorage` keys `nba_funnel` (step data), `nba_ty` (thank-you data), `nba_popup_shown`. Each page calls `captureUTM()` (UTMs + `gclid`, `wbraid`, `gbraid`, `msclkid`, `fbclid`, `oppref`, `ttclid`, `li_fat_id`, `twclid`, `epik`). `transaction_id` = `crypto.randomUUID()` on first load.
- Known minor issue: the thank-you reference number changes on refresh.

## Phone numbers

Main site + Google funnel. Each line has its own Google Ads Call Conversion and GTM tag.

| Line | Number | `tel:` | Where |
|---|---|---|---|
| Main site | 1-800-605-8906 | `+18006058906` | All non-funnel pages, funnel footers, schema.org, PDF emails, humans.txt |
| Started funnel | 1-813-556-9954 | `+18135569954` | `.header__phone` pill on info/02, info/01, apply/2 |
| Completed funnel | 1-813-560-8063 | `+18135608063` | `.ty-call-btn` on thank-you pages |
| Popup | 1-813-556-9953 | `+18135569953` | `info/popup.js` only (`/apply/popup.js` rewrites to it) |

Source clones. Lines are hardcoded. Details are in each README.

| Funnel | Lines | Tracking | README |
|---|---|---|---|
| `info/oa1` | OpenAI `+12394569477` on all call buttons + popup | Inline OpenAI pixel (vendor code, do not edit) + `oa-track.js` passive click listener | `OPENAI-SOURCE-README.md` |
| `info/bg1` | Funnel `+12394809440`, thank-you `+12394809438`, popup `+16452389372` | Microsoft UET in GTM (no inline pixel) | `BING-SOURCE-README.md` |
| `info/yt1` | YouTube `+18883121358` on all call buttons + popup | GTM + Google Ads (no page code) | `YOUTUBE-SOURCE-README.md` |
| `info/00` | Organic `+12394569476` on thank-you only. Shared popup. | — | — |

Retired. Never use again: 1-888-408-5650, 1-855-767-9422.

**New source funnel:** add it to `_build_source_funnels.py` — a name, its phone lines and whether it needs page-level pixel code — then run the script. It clones `info/02`, repoints the paths, puts the dedicated line in every call button and in a dedicated popup fork, and refuses to write a page that still contains a Google-funnel string. Never add source detection or runtime number swaps to a shared funnel.

## Popup (`info/popup.js`)

Lives at `info/popup.js`; `vercel.json` rewrites `/apply/popup.js` to it so `apply/2` and `info/01` keep working untouched. Behavior must stay identical to UB `qualify/popup.js`. Only brand skin and phone number differ. The number-only forks `info/bg1/popup.js`, `info/oa1/popup.js` and `info/yt1/popup.js` are generated from it — change this file, then re-run `_build_source_funnels.py` and `_build_yt1_variant.py`. Copy every behavior change to UB. Update both CLAUDE.md files.
- Shows after 30s of mouse/touch inactivity (`DELAY = 30000`). Never make it shorter.
- After it shows, other pages in the session do not show it (`nba_popup_shown`). On the same page, it shows again 30s after close. The owner wants this. Do not remove it without owner approval.
- Runs on landing, every step, and thank-you. On thank-you, it shows `#refNumber`.
- Plain `tel:` link, no `onclick`.

## Vercel (`vercel.json`)

308 redirects: `/apply/1*` and `/apply/3*` → `/apply/2`; `/apply/4*` → `/info/01`. Rewrites: `/search`, `/sitemap.xml`, `/sitemap-counties.xml`, `/humans.txt`, `/api/zip/:zip`. Read the file for headers and cache rules.
