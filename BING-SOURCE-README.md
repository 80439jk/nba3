# Bing / Microsoft-Ads PPC Funnel — `apply/bg1`

A dedicated, standalone clone of the live Google funnel (`apply/2`) built for **Bing / Microsoft
Advertising** paid traffic. It exists so Bing can be tracked with its **own phone lines** (for clean
call attribution) without touching the Google funnel or any Google/GTM/GFN tracking.

**Branch:** `bing-ppc-funnel-bg1` · **Point Bing/Microsoft ads at:** `https://nba3.vercel.app/apply/bg1/` (or the custom domain `/apply/bg1/`)

---

## What was built

| Item | Detail |
|---|---|
| **Funnel** | `apply/bg1/` — clone of `apply/2` (7 pages: landing, 4 steps, 2 thank-you pages). Internal nav rewritten to stay inside `/apply/bg1/`. Inherits `noindex, nofollow` and the GTM container. |
| **Phone lines** | **3-way segmentation preserved** (see table below) — Bing reuses the same started/completed/popup split the Google funnel uses, so each stage is separately attributable. |
| **Tracking** | **No inline pixel, no conversion script.** Microsoft UET is installed via the **GTM container** (`GTM-MTQ5WNFR`), which is already on every page. |
| **Popup** | Dedicated `apply/bg1/popup.js` (copy of the shared popup, phone number → Bing popup line). |

### Phone number mapping

| Funnel stage | Pages | Bing number | `tel:` href | Was (apply/2) |
|---|---|---|---|---|
| **Funnel** (started) | landing + steps 1–4 + `thank-you-2` fallback | `1-239-480-9440` | `tel:+12394809440` | `1-813-556-9954` |
| **ThankYou** (completed) | `thank-you` (CRM-accepted) | `1-239-480-9438` | `tel:+12394809438` | `1-813-560-8063` |
| **Popup** | `apply/bg1/popup.js` inactivity overlay | `1-645-238-9372` | `tel:+16452389372` | `1-813-556-9953` |

> Note on the two thank-you pages (mirrors apply/2's existing `ty-gate-crm-accepted` logic):
> `/thank-you/` shows when the CRM accepts the lead and uses the **ThankYou** number; `/thank-you-2/`
> is the fallback when the CRM does not accept, and it keeps the **Funnel** number — exactly as
> apply/2 does today.

---

## Tracking — how Bing conversions work (owner action required in GTM / Microsoft Ads)

There is **no tracking code in the pages**. GTM is already present on every `bg1` page, so UET is
managed entirely in the GTM UI. You chose **both** a base tag and a call-click event:

1. **UET base tag (pageview).** In the GTM container, add the *Microsoft Advertising UET Tag*
   template with your **UET Tag ID** and fire it on **All Pages** (or scope to `/apply/bg1/`). This
   powers Microsoft's pageview tracking and lets you build a **Destination-URL** conversion goal on
   `/apply/bg1/thank-you/` if you want to count funnel completions.
2. **Call-click conversion event.** Add a GTM *Click – Just Links* trigger that matches the Bing
   call numbers (Click URL contains `tel:+12394809440` **or** `tel:+12394809438`), and fire a
   *Microsoft Advertising UET event* tag on it. Attach a Microsoft "Event" conversion goal to that
   event. This counts call-click intent — the equivalent of OpenAI's `oa-track.js`, but done in GTM.

**Isolation:** scope every Bing UET conversion trigger to the Bing `tel:` values (or the
`/apply/bg1/` path) so Bing calls never mix with Google-funnel calls. Because the three Bing numbers
are dedicated, scoping by number is the cleanest.

> ⚠️ **Nothing fires until you install the UET Tag ID in GTM.** No `REPLACE_ME` placeholder was left
> in the code (we decided against inline UET), so there is nothing to edit in the repo — the setup is
> 100% in the GTM/Microsoft UIs.

---

## What was deliberately NOT changed

- **`apply/2` (the Google funnel)** — zero changes. Same for the shared `apply/popup.js`, GTM tags,
  `gclid`/`_gcl_aw`, and the Google Forwarding Number. (The Bing numbers are different `tel:` values,
  so Google's GFN — keyed to the Google numbers — never swaps them.)
- **`apply/oa1` (the OpenAI funnel)** — untouched.
- **Backend / Supabase edge function** — untouched; `bg1` submits through the same `submit-lead`
  path as every other funnel.

---

## ⚠️ Owner action items / things to verify

1. **Install the Microsoft UET Tag in GTM** (base tag + call-click event) as described above. Until
   then, Bing pageviews/conversions are not tracked (calls still connect fine via the dedicated
   numbers).
2. **CallTools routing.** Make sure `+12394809440`, `+12394809438`, and `+16452389372` are set up in
   CallTools on their own inbound routes so Bing calls are distinguishable from Google/OpenAI.
3. **Vercel preview is behind the login wall.** To share/open a public preview link you (the account
   owner) may need to toggle Deployment Protection for this deployment.

---

## Maintenance notes (for whoever touches this next)

- **`apply/bg1` is a CLONE.** Any future change to the live funnel (`apply/2`) — copy, steps,
  styling, form fields — must be **mirrored into `apply/bg1`** (and `apply/oa1`), and vice-versa.
  There is no shared template.
- **`apply/bg1/popup.js` is a number-only fork** of the shared `apply/popup.js` (which itself must
  stay in sync with the UtilityBenefits `qualify/popup.js` and the `apply/oa1/popup.js` fork). If
  popup *behavior* changes anywhere, mirror it into this fork too.
- **Bing differs from OpenAI on purpose:** oa1 hardcodes an OpenAI pixel + `oa-track.js` because
  OpenAI's pixel isn't a GTM tag. Bing's UET *is* a GTM tag, so it lives in GTM and `bg1` has **no**
  inline tracking. Don't "fix" the missing pixel — it's intentional.
- **Branch base:** this branch is cut from `origin/main` (which already includes the merged
  `apply/oa1`). It is purely additive (new `apply/bg1/` files + this README + a CLAUDE.md clones-table
  row), so the PR should merge without conflicts.

## 🧹 Cleanup / orphaned-file notes (unrelated to Bing — flagged per request)

These were found in the working tree during this task and are **not** part of the Bing branch. Listed
so you can decide what to do with them later:

- **`_build_apply4_variant.py`** (repo root) — an untracked build script for a separate `apply/4`
  "lean funnel variant" you were working on. It is an orphan floating in the repo root. Left
  untouched; not committed on this branch.
- **Stashed WIP from the `apply4-lean-funnel-variant` branch.** To make a clean branch off main, the
  following uncommitted work was parked in `git stash@{0}` (safe, recoverable):
  the CLAUDE.md docs banner, `FUNNEL-PLAYBOOK.md`, `MARKETING-PARTNERS-README.md`,
  `OFFERS-README.md`, and the entire uncommitted `apply/4/` funnel (7 pages). **Restore with:**
  `git switch apply4-lean-funnel-variant && git stash pop`.

## Files added on this branch

```
nationalbenefitalliance/apply/bg1/                 (new funnel — 7 html pages)
nationalbenefitalliance/apply/bg1/popup.js         (dedicated popup, Bing popup number)
BING-SOURCE-README.md                              (this file)
CLAUDE.md                                          (updated: Bing row in Source-specific funnel clones)
```

No `bg-track.js` and no inline UET snippet were added — tracking is GTM-managed by design.
