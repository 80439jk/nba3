# `/info/01/` — Lean Funnel A/B Variant

> **URL note:** this variant lives at **`/info/01/`** (neutral base — no "apply"/"qualify" in the
> ad-landing path). It was originally built at `/apply/4/`; `vercel.json` 308-redirects
> `/apply/4` → `/info/01`. Future funnel variants go under `/info/NN/`. The page still loads the
> shared `/apply/popup.js` script (a subresource, not a landing/redirect URL).


A conversion-rate variant of the live `/apply/2/` funnel. **Fewer fields per step**
to reduce friction. Branch: **`apply4-lean-funnel-variant`** (never merge to `main`
until the A/B test is decided).

**Purely additive** — only files under `info/01/` were created. Nothing in `apply/2`,
`apply/3`, `vercel.json`, the backend, or the main site was touched, so this variant
**cannot break the live funnel.** Built by a one-off script committed alongside it:
`_build_apply4_variant.py` (repo root; idempotent; anchored on apply/2 text).

---

## The flow (5 input screens + thank-you)

| Page | URL | Collects |
|---|---|---|
| Landing | `/info/01/` | **Need type only** (tiles). "Continue" requires ≥1 tile, then advances. *State removed.* |
| Step 1 | `/info/01/step-1-dob/` | **Date of birth only.** *Citizenship removed.* |
| Step 2 | `/info/01/step-2-zip/` | **ZIP only** + "Programs vary by location — this is how we find yours." *Street + city removed.* |
| Step 3 | `/info/01/step-3-phone/` | **Phone only** + "We will never call you without your permission." NANP/area-code validation kept. |
| Step 4 | `/info/01/step-4-name-email/` | **First name, last name, email** + TCPA consent + TrustedForm + honeypot + time-trap → **submits the lead.** *Phone moved to Step 3.* |
| Thank-you | `/info/01/thank-you/` · `/info/01/thank-you-2/` | Unchanged (cloned from apply/2). CRM-accepted → `thank-you/`; otherwise → `thank-you-2/`. |

### How it maps to the original request
The owner numbered the *live apply/2* steps 1–5 and gave per-step edits. Final mapping:
Landing (drop state) · keep DOB step but drop citizenship · address→ZIP-only · income/employ
step repurposed to phone-only · contact step keeps name/email, phone moved up one step.

---

## What's preserved (non-negotiables from CLAUDE.md)

- **Phone numbers reused, one per page** — started-funnel pill `tel:+18135569954` on landing +
  steps; completed-funnel `tel:+18135608063` (`ty-call-btn`) on thank-you; popup line via the
  shared `/apply/popup.js`. Identical to apply/2, so the **existing** Call Conversion actions fire
  **by `tel:` value** — no new Google Ads setup needed.
- **`noindex, nofollow`** inherited on every page (ad-only funnel).
- **GTM** container on all pages; `tel:` links never wrapped; `ty-call-btn` unchanged.
- **Bot detection intact on the submit step** (Step 4): honeypot (`hp_website`) + time-trap
  (`nba_form_shown` → `form_duration_ms`).
- **TrustedForm** cert capture on the submit step (loads on all steps, cert field on Step 4) —
  same as apply/2.
- `captureUTM()`, `transaction_id` (UUID), `nba_funnel` / `nba_ty` sessionStorage — unchanged.

## How leads reach the backend (same edge function as apply/2)

Step 4 POSTs the **same payload shape** to the `submit-lead` Supabase edge function.
Fields we no longer collect are sent as empty strings: `citizenship`, `street_address`,
`city`, `annual_income`, `employment_status`. **apply/3 already proved (2026-06-19) that
CallTools + Caliber accept this lean record** with those five blank.

- **DOB is still collected**, so the backend derives `age` from `dob` exactly like apply/2 —
  no CRM behavior change, no lead-flow risk. (This is why we kept the DOB step.)
- **State is backfilled from ZIP** at submit via an embedded `zipToState()` map (reused from
  apply/3), since the state field was removed. Approximate at a few prefix boundaries; state is
  not load-bearing for the CRM.

---

## Orphaned / dead code & things to clean up later

1. **`validatePhone()` + `VALID_NANP_AREA_CODES` in `step-4-name-email/index.html` are now dead
   code** (phone validation moved to Step 3). Left in place to keep the diff minimal and low-risk.
   Safe to delete from Step 4 whenever convenient.
2. **`needs` is collected but never sent to the backend.** The landing saves `nba_funnel.needs[]`,
   but the submit payload has no `needs` field. **This is pre-existing apply/2 behavior**, inherited
   here — not introduced by this variant. Fix in apply/2 first if you want needs in the CRM.
3. **Same step *count* as apply/2 (5), fewer *fields*.** The friction reduction is per-screen, not
   fewer screens (the owner chose to keep the DOB step). If you later want a shorter funnel, the
   DOB step is the obvious one to drop.
4. **Retire `apply/3`.** It's a similar short-funnel variant ("Claim Code" Variant B) that was
   **A/B tested against apply/2 and did not win** — so it should be retired. **info/01 is the active
   variant going forward.** Retiring apply/3 means: delete the `apply/3/` directory **and** remove
   its entries from `sitemap-main.xml`. Best done on its own small branch so it doesn't ride along
   with this variant's A/B test — ask and I'll do it.
5. **`sitemap-main.xml` lists ad-only funnels it shouldn't** — separate cleanup. It contains
   entries for `apply/2` (**listed twice**), `apply/3`, `info/01`, **and `apply/5` (which does not
   exist)** — all added long ago by a "sitemap architecture" commit. These are `noindex` ad-only
   funnels, so none of them belong in a public sitemap. (Correction to an earlier note: `info/01`
   was already in the sitemap before this variant existed — it wasn't added here, and wasn't
   "intentionally left out" either.) Recommended follow-up: drop all `apply/N` funnel entries from
   the sitemap and de-dupe `apply/2`. Retiring apply/3 removes its entry (see #4); the rest is broader.
6. **`_build_apply4_variant.py`** (repo root) is the one-off build script. It can be deleted after
   review, or kept for reference. Re-running it is a safe no-op.

---

## Before launch — verify (owner/GTM tasks code can't do)

1. **GTM "Completed funnel" trigger must fire on `/info/01/thank-you/`.** If the trigger's URL match
   is pinned to `/apply/2/` (or `/apply/3/`), add `/info/01/thank-you/` or loosen it to "URL contains
   `thank-you`". The completed-funnel Call Conversion fires by `tel:` value + `ty-call-btn`, but the
   trigger's page condition still has to match. **Code alone can't move a conversion.**
2. **Run one real end-to-end test lead** and confirm it lands in `leads` with the correct
   `phone`, `email`, `dob`→derived `age`, and ZIP-derived `state`, and that CallTools + Caliber
   accept it (should mirror apply/3's verified result). Note: submitting on the live pages creates a
   **real** lead + CRM call — use an obvious test name.
3. **GFN number swap** shows the right number on `/info/01/thank-you/` (it will — `tel:` unwrapped,
   visible number present).
4. **Popup** behaves on all `info/01` pages (uses the shared `/apply/popup.js`).

## Running the A/B test
No traffic splitter is built (keeps the live funnel untouched). Point a slice of Google Ads traffic
at `https://nba3.vercel.app/info/01/` and compare call-conversions against `/apply/2/`. `vercel.json`
needs no changes — `/info/01/` serves statically.

## If the variant wins / loses
- **Loses:** delete the `info/01/` directory. Nothing else references it.
- **Wins:** treat `info/01/` as the new funnel (mirror apply/2's 308-redirect pattern in
  `vercel.json` if you retire apply/2), reconcile with apply/3, and update CLAUDE.md's funnel section.

---

## Build note — isolated worktree
This was built in a separate git worktree (`NBA-wt-apply4/`) because another Claude session was
concurrently building a Bing funnel (`bing-ppc-funnel-bg1`) in the main working directory. The
worktree keeps the two tasks from clobbering each other's branch checkouts. The branch content is
normal; only the working directory location differs.
