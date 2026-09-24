# `/info/02/` — Google Ads government-services policy rewrite

A copy rewrite of the live `/apply/2/` Google funnel, built for the updated Google Ads
**government services / documents** policy. The goal is that no page in the funnel implies
National Benefit Alliance applies for, matches you to, or enrolls you in a government program.

- **Branch:** `info-02-govt-policy-rewrite`
- **Built by:** `_build_info02_variant.py` (repo root, idempotent, re-running is a no-op)
- **Source of the copy:** owner's "Landing Page Rewrites" artifact, **Option A · Straight swap**,
  plus the line-by-line deck approved 2026-09-24. Both are transcribed into the edit tables in
  the build script, with the row numbers as comments.
- **Purely additive.** Only files under `info/02/` were created. `apply/2`, the other funnels,
  `vercel.json`, the backend and the main site were not touched, so this **cannot break the live
  funnel.**

| | |
|---|---|
| Landing | `/info/02/` |
| Steps | `step-1-dob-citizen` → `step-2-address` → `step-3-income-employ` → `step-4-contact` |
| Thank-you | `/info/02/thank-you/` (CRM accepted) · `/info/02/thank-you-2/` (otherwise) |
| `landing_page` | **`info02`** |
| Flow, fields, validation | identical to `apply/2` |

---

## What changed

**Structural (2 things only):**

1. **Government disclosure bar** — `.gov-bar`, a thin navy strip above the sticky header on the
   **landing page only**: *"Independent private company. Not a government website. Not a government
   program."* Owner chose this over the artifact's larger in-body block. It scrolls away with the
   page, like the reference design.
2. **Footer disclosure** — `.footer__disclaimer--gov`, a new paragraph above the existing legal
   text, on **all 7 pages**: the SNAP / LIHEAP / Section 8 sentence plus the `usa.gov/benefits`
   and `211` referral. Deliberately **plain text, not a link** — an outbound `<a>` on a funnel page
   leaks the session before the call converts.

**Copy:** 25 edits on the landing page, 2 on each step page, 8 on each thank-you page. See the
`LANDING_EDITS` / `STEP_EDITS` / `THANKYOU_EDITS` tables in `_build_info02_variant.py` — every
entry carries its deck row number.

The shape of the rewrite: *matched / qualify / eligibility / enrollment / programs* →
*options, resources, talk it through, one call*. "Free to apply" became "the call is free", so the
free claim attaches to the call rather than to a benefit application.

**Owner overrode the artifact in four places** (do not "fix" these back):

| Artifact said | Owner kept |
|---|---|
| Drop the shield mark | Shield mark stays |
| "Community Resource Center" → "A private bill-help line" | **"Community Resource Center" stays**, on the landing page and all steps |
| Disclosure as a body block above the form | Thin header bar, landing only |
| "Confidential" signals officialdom | "Private & Confidential" badge stays; "confidential" stays in the sub-headline |

Also kept by owner decision: "Speak with a Case Manager", "Congratulations!", "100% Free Service",
the final-CTA headline, and the step page `<title>`s.

---

## What was deliberately NOT changed

Touching any of these needs owner approval — see `CLAUDE.md` "Non-negotiables".

- **Phone numbers.** Reused byte-for-byte from `apply/2`: started-funnel `tel:+18135569954` on
  landing + steps, completed-funnel `tel:+18135608063` (`ty-call-btn`) on thank-you. Because Google
  Ads Call Conversions key off the literal `tel:` value, **the existing conversion actions fire on
  this funnel with no Google Ads setup.** Verified: same file counts as `apply/2`.
- **GTM**, `dataLayer`, `ty-call-btn` class, no `onclick` on any `tel:` link.
- **Bot detection:** honeypot `hp_website`, time-trap `form_duration_ms`.
- **TrustedForm** cert capture.
- **TCPA consent checkbox and its text** — legal text tied to 10DLC registration. Left byte-identical
  to `apply/2` by owner instruction.
- **The form field set**, including `Citizenship Status`. `CLAUDE.md`: all live funnels must post an
  identical field set or attribution drifts silently. `needs[]` is posted, same as `apply/2`.
- **`noindex, nofollow`** on all 7 pages. Confirmed not in `sitemap-main.xml` — keep it that way.

---

## Before ads point here — owner / GTM tasks that code cannot do

1. **GTM "Completed funnel" trigger must match `/info/02/thank-you/`.** If the trigger's URL
   condition is pinned to `/apply/2/`, add `/info/02/thank-you/` or loosen it to "URL contains
   `thank-you`". The Call Conversion fires by `tel:` value, but the trigger's *page* condition still
   has to match. **Code alone cannot move a conversion.**
2. **Send one end-to-end test lead.** Confirm it lands in `leads` with `landing_page = 'info02'` and
   that CallTools + Caliber accept it. Submitting on the live page creates a **real** lead and CRM
   call — use an obvious test name.
3. **Update the Google Ads final URLs** from `/apply/2` to `/info/02` when you're ready to cut over.
4. **Check the disclosure bar on a real phone.** It is sized to sit on one or two lines at 360px.

---

## Orphans, leftovers and cleanup for later

1. **The popup now lives at `/info/popup.js`.** It used to be `/apply/popup.js`; the file moved and
   `vercel.json` rewrites the old path to the new one, so `apply/2` and `info/01` keep working with
   no edit to either. This funnel references the neutral path directly.

2. **Popup copy** ("speak with a Case Manager … explore available assistance and benefits") is
   unchanged. Owner confirmed "case manager" is compliant. If the *"assistance and benefits"* tail
   ever needs to go, remember `CLAUDE.md` requires copying behavior changes to UB and to the
   `oa1` / `bg1` / `yt1` forks — a copy-only change does not trigger that rule, but the forks will
   drift from each other.
3. **`apply/2` is now a duplicate funnel.** It stays live and unchanged so nothing breaks. Once ads
   are moved to `/info/02` and conversions are confirmed, decide whether to retire it the way
   `apply/1` and `apply/3` were retired: delete the directory and add a 308 in `vercel.json`
   (`/apply/2*` → `/info/02`). **Do not do this while any ad still points at `/apply/2`.**
4. **No `vercel.json` change was made.** `/info/02/` serves statically. A redirect is only needed if
   `apply/2` is retired (see #3).
5. **Step page `<title>`s are off by one** — `step-1-dob-citizen` is titled "Step 2: Basic
   Information", and so on through "Step 5: Contact Information". This is inherited from `apply/2`,
   not introduced here. Owner reviewed and chose to leave it (the numbering counts the landing page
   as step 1). Noted in case it ever looks like a bug.
6. **`Applicant` → `Name`** on the thank-you pages is only the pre-JS fallback in `#tyName`; the
   lead's first name overwrites it on load. Visible only if `sessionStorage` is empty.
7. **Thank-you reference number changes on refresh.** Pre-existing across all funnels
   (`CLAUDE.md` known issues). Inherited here.
8. **`_build_info02_variant.py`** is a one-off. Keep it as the record of which copy rows were
   applied, or delete it after review — re-running it is a safe no-op.
9. **The rest of the site still says "apply".** This branch covers the `/info/02/` funnel only.
   `apply/0` (all main-site CTAs point there), `apply/bg1`, `apply/oa1`, `info/01`, `info/yt1` and
   the ~3,200 county pages are untouched. Sitewide "apply" removal is a separate, larger job — use
   a one-off script per `CLAUDE.md` "Sitewide edits".
10. **`/apply/4` → `/info/01` redirect** in `vercel.json` is unrelated but shows the pattern to
    follow for #3.

---

## If this wins / loses

- **Loses:** delete `info/02/`. Nothing references it.
- **Wins:** retire `apply/2` per #3, add the redirect, and update the funnel table in `CLAUDE.md`
  (`landing_page` = `info02`).
