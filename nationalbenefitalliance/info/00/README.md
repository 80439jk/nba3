# `/info/00/` — the organic funnel, govt-services-policy rewrite

`/apply/0/` moved to `/info/00/` and had its copy rewritten so nothing implies National Benefit
Alliance applies for, matches you to, or enrolls you in a government program.

- **Branch:** `info-00-govt-policy-rewrite`
- **Built by:** `_build_info00_variant.py` (clone + copy) and `_repoint_apply0_to_info00.py`
  (sitewide CTA repoint). Both idempotent; re-running either is a no-op.
- **This is a clone of `apply/0`, not of `info/02`.** apply/0 descends from the retired `apply/3`:
  3 steps, its own TCPA consent text, its own consent-checkbox logic, its own phone scheme. None of
  that was replaced with info/02's equivalents. Every edit is a literal string swap applying the
  wording the owner approved for apply/2 → info/02, **and nothing more.**

| | |
|---|---|
| Landing | `/info/00/` |
| Steps | `step-1-age-zip` → `step-2-name-email` → `step-3-phone` (submits) |
| Thank-you | `/info/00/thank-you/` · `/info/00/thank-you-2/` |
| `landing_page` | **`info00`** |
| Flow, fields, consent, phones | identical to `apply/0` |

---

## Three changes, not one

1. **New funnel at `/info/00/`** — 6 pages, copy rewritten. 24 landing rows, 4 step rows,
   8 rows on each thank-you page. All fired; nothing was silently skipped.
2. **Sitewide CTA repoint** — **6,527 hrefs across 3,250 files** now point at `/info/00`:
   ~3,190 county pages, every state page, the stories, the homepage and the footers. This is the
   difference from info/02, which had no inbound links because ads sent traffic straight to it.
3. **`vercel.json` 308** — `/apply/0` and `/apply/0/:path*` → `/info/00`. Any link that was missed,
   plus every external bookmark and backlink, still lands in the funnel.

**Two structural additions**, same as info/02: the `.gov-bar` disclosure strip above the header on
the **landing page only**, and the `.footer__disclaimer--gov` paragraph (SNAP / LIHEAP / Section 8
plus the `usa.gov/benefits` and `211` referral) on **all 6 pages**, as plain text rather than a link.

### Copy unique to apply/0 (not part of the info/02 deck)

| Was | Now |
|---|---|
| Need help with rent, utilities, groceries, or other assistance? | Need some help financially? Start with one call. |
| **See what you qualify for** | Talk to a specialist about your situation. Free, fast, confidential, no commitment. |
| Pick the one that most closely matches your needs. | Pick the one that's closest. We use this to see what may fit. |
| ✓ Free | ✓ Free to call |
| …needing information about **food stamps/EBT/SNAP**… | …facing a health challenge… |
| Program availability is based on your age and location | What's available depends on your age and location |
| …only be used to match you with available programs | …only be used to help identify options for your call |
| Last step - and we'll send your reference number to find programs. | Last step — then we'll send your reference number. |
| We only use your number to match you. | We only use your number to reach you about your call. |

The `food stamps/EBT/SNAP` line was the most exposed string in the funnel — naming a government
program in the same sentence as an offer of help is the exact pattern the policy targets.

---

## What was deliberately NOT changed

Verified identical to `apply/0` after the build:

- **The TCPA consent label and `#tcpaConsent` logic** — byte-identical, confirmed by diff. This text
  is owner-supplied and tied to the 10DLC registration. The checkbox is still unchecked by default,
  still not `required`, and still posts `tcpa_consent: false` when clear. **Do not SMS those leads.**
- **The phone scheme** — main-site `+18006058906` on landing and steps (5 files), dedicated organic
  line `+12394569476` on thank-you (1 file). Unchanged, so call tracking behaves exactly as before.
- **GTM**, `ty-call-btn`, honeypot `hp_website`, time-trap `form_duration_ms`, TrustedForm.
- **The 3-step flow and the posted field set.** No field was added, dropped or renamed.
- The submit button already read "Get My Reference Number" — already neutral, left alone.

---

## Before this merges — what to check

1. **Spot-check the repoint.** Open two or three county pages and a story on the preview and click
   the CTA. It should land on `/info/00`, not redirect through `/apply/0`.
2. **`/apply/0` must 308 to `/info/00`** on the preview, and `/apply/0/step-1-age-zip` to the
   matching step.
3. **Send one end-to-end test lead.** Confirm it lands in `leads` with `landing_page = 'info00'`,
   that `tcpa_consent` still reflects the checkbox, and that CallTools + Caliber accept it. This
   creates a **real** lead — use an obvious test name.
4. **GTM:** if any trigger's URL condition is pinned to `/apply/0/`, add `/info/00/` or loosen it.
   The organic thank-you line fires by `tel:` value, but a page-scoped trigger still has to match.

---

## Orphans, leftovers and cleanup for later

1. **`apply/0/` still exists on disk**, unreachable behind the 308. Kept deliberately as the
   rollback path — delete the redirect and it works again. Same pattern as `apply/1` and `apply/3`
   (`CLAUDE.md` non-negotiable #5). Delete the directory once `info/00` is proven.
2. **`apply/0/README.md` is now stale** — it documents `/apply/0/` URLs that redirect away. Its
   consent-behavior section is still the authoritative description of the TCPA logic, which is why
   it wasn't deleted. Fold it into this file when `apply/0/` is removed.
3. **`/apply/popup.js`** is still the popup source on all 6 pages — the URL contains "apply". Not
   moved, because `apply/2`, `info/01` and `info/02` load the same file. Ad policy inspects
   landing and redirect URLs, not subresources, so this is low priority. Same situation as info/02.
4. **The 3,250 repointed pages still have their own non-compliant copy.** Only the CTA *href*
   changed. County pages, state pages and stories still say "apply", "benefits" and "qualify" in
   their body text. That is the next and much larger job — use a one-off script per `CLAUDE.md`
   "Sitewide edits".
5. **`info/02` and `apply/2` still duplicate each other** — unrelated to this branch, tracked in
   `info/02/README.md`.
6. **`_build_info00_variant.py` and `_repoint_apply0_to_info00.py`** are one-offs. Keep them as the
   record of which rows were applied, or delete after review. Note that a from-scratch re-run of the
   build script would copy `apply/0/README.md` over this file — restore it from git if that happens.
7. **`sitemap-main.xml` does not list `apply/0` or `info/00`.** Correct — these are `noindex`
   funnel pages. Keep it that way.
