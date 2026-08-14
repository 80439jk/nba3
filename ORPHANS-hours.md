# Orphaned / inconsistent items related to the hours change

Deliberately left out of the `_set_hours.py` sweep. Review later to keep things
consistent and maintainable. None of these break anything as-is.

## 1. `apply/1` — dead legacy funnel (LEFT UNCHANGED, on purpose)
- 308-redirected to `/apply/2` in `vercel.json`, so it is **never served**.
- CLAUDE.md explicitly says **"do not modify it"** (it's a rollback path), so the
  script skips the whole `apply/1` folder.
- It still shows the old pill format `M–Th 9:30a–8p • F 9:30a–6p ET`. Harmless
  because nobody sees it. If you ever revive it, update its hours by hand.

## 2. PDF-email / backend hours (LEFT UNCHANGED — different surface)
- Files that quote hours in emailed PDFs / server responses:
  - `nationalbenefitalliance/api/send-pdf.js`
  - `nationalbenefitalliance/backend/routes/api.js`
  - `nationalbenefitalliance/backend/routes/pages.js`
- The script only touches on-page HTML captions, not these. They may still show
  older hours text.
- **Action:** if hours change matters in emailed PDFs, update these by hand.

## 3. `apply/3` and `apply/4` — funnels not documented in CLAUDE.md
- Both carry the funnel hours caption and ARE covered by the tool so the claim
  stays consistent everywhere.
- CLAUDE.md only documents `apply/2`, `apply/0`, `apply/oa1`, `apply/bg1`.
- **Action:** confirm `apply/3` and `apply/4` are intended live funnels, and add
  them to CLAUDE.md (or retire them) so the docs match reality.

## 4. `Offer03`, `Offer05` — root-level offer pages
- Both carry the footer hours caption and were updated by the tool.
- They sit at the site root (not under a documented section). Confirm they're
  intended live pages.

## 5. Unrelated stray file moved aside during branch setup
- A local, uncommitted `_build_apply4_variant.py` existed in the repo root on the
  `bing-ppc-funnel-bg1` branch and blocked the checkout to this branch. Your local
  copy was moved to the session scratchpad (not deleted). It differs from the
  version committed on `main`. Not part of this task — restore it if you still
  need that local copy.

---

## Note on what this branch does

This branch does **two** things:
1. Installs the reusable hours tool (`_set_hours.py` + `HOURS.md`).
2. Corrects the **core-site** hours from `9:30am–8pm` to `Mon-Fri 9-6 ET` so they
   match the funnels. (This is a real, visible change once merged.)

It does **NOT** switch anything to 24/7 — that's a separate future step you trigger
with the tool when overnight coverage is ready.
