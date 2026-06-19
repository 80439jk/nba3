# `/apply/3/` — "Claim Code" A/B Variant (Variant B)

A condensed, mobile-first variant of the live `/apply/2/` funnel, built to A/B test
against it for call-conversion rate. Branch: **`apply3-claim-code-variant`** (never merged
to `main` until the test is decided).

The live `/apply/2/` funnel and the shared backend are **not modified** by the frontend in
this folder — `/apply/3/` is purely additive, so it cannot break the live funnel. (One
possible future change — collecting age instead of DOB — is described under "Future option"
and is **not built**.)

---

## The flow (3 pages, vs. apply/2's 6)

| Page | URL | Collects |
|---|---|---|
| Landing | `/apply/3/` | Needs (Food / Utilities / Housing / Other) → "Continue" |
| Info step | `/apply/3/step-1-info/` | ZIP, First name, Last name, Date of birth, Email, Mobile + TCPA consent → "Get My Approval Code" |
| Thank-you | `/apply/3/thank-you/` | Shows `NBA-XXXX` approval code + "Call Now to Claim" |

apply/2 collects ~20 fields across 5 steps (DOB, citizenship, street address, city, income,
employment, …). Variant B collects **7** fields on **one** data step. Hypothesis: fewer
fields + a "claim your code by calling" mechanic → higher call-conversion.

---

## What's preserved (non-negotiables from CLAUDE.md)

- **GTM** container (`GTM-MTQ5WNFR`) on all three pages.
- **Phone attribution model unchanged:**
  - Landing + info step carry the **started-funnel** pill `tel:+18135569954` (1-813-556-9954) in the header — identical to apply/2.
  - Thank-you carries the **completed-funnel** number `tel:+18135608063` (1-813-560-8063) on the `ty-call-btn` button — identical to apply/2. The visible number is present so Google Forwarding Number swap + the Completed-funnel Call Conversion both fire.
  - One number per page. `popup.js` (the 30s inactivity overlay, line 1-813-556-9953) loads on all three pages, same as apply/2.
- **Thank-you URL contains `thank-you`** (`/apply/3/thank-you/`) so the existing conversion tag keeps firing — **verify the GTM trigger isn't pinned to `/apply/2/` only** (see "Before launch").
- **Bot detection intact:** honeypot (`hp_website`) + time-trap (`nba_form_shown` / `form_duration_ms`).
- **TrustedForm** cert capture (`xxTrustedFormCertUrl`) on the info step, exactly as apply/2 step-4.
- **Client-side phone (NANP + area-code allowlist) and email validation** mirror apply/2 step-4 and the server.
- `tel:` links are never wrapped; `ty-call-btn` class is unchanged.

---

## How leads reach the backend

The info step POSTs to the **same** `submit-lead` Supabase edge function as apply/2 (same URL,
same anon key, same payload shape). Differences:

- **Fields we no longer collect** are sent as empty strings: `citizenship`, `street_address`,
  `city`, `annual_income`, `employment_status`. ✅ **Confirmed accepted** by a real test lead
  (2026-06-19): CallTools returned HTTP 201 CREATE and Caliber returned 201 "accepted" with all five
  blank (income → 0). **No dummy values needed.** The function derives `age` from DOB and `state`
  from the ZIP-map, both of which posted correctly.
- **State** is backfilled from ZIP via an embedded `zipToState()` map (first-3-digits → USPS code).
  We do **not** use `/api/zip` — that endpoint is **Florida-only** (`state: 'florida'`, `FL_ZIP`)
  and 404s on non-FL ZIPs. The embedded map covers all 50 states + DC + PR. It's approximate
  (a handful of 3-digit prefixes straddle state lines) but state is not load-bearing for the CRM.
- **Date of birth** is collected directly with the exact same field, MM/DD/YYYY auto-format, and
  18–110 validation as apply/2 step-1, and stored as ISO `dob` (`YYYY-MM-DD`). The edge function
  derives the CRM `age` from it just as it does for apply/2. **No backend change** is required —
  the `dob` field/column already exists.

---

## Future option — collect age instead of DOB (NOT built)

We deferred this. The plan, when ready, is to **replace** the DOB field with an Age field and add a
real `age` column. That touches the **shared** `submit-lead` function + the `leads` table (both used
by live apply/2) and the function deploys manually, so it's gated on explicit go-ahead. Sketch:

**1. DB migration (Supabase project `quhxbgsgtfvrasyjvaba`):**
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS age integer;
```
Nullable → existing apply/2 inserts (which don't set age) are unaffected.

**2. Edge function `submit-lead/index.ts`:** add `age?: number;` to `LeadPayload`, insert
`age: payload.age ?? null`, and for CallTools prefer the explicit age over the DOB-derived one
(`const effectiveAge = payload.age ?? age;`). Redeploy manually via the Supabase dashboard.

**3. Frontend:** swap the DOB input/validation in `step-1-info/index.html` for an Age input and send
`age` in the payload. (An earlier draft of this variant did exactly this with a synthesized DOB as a
backstop; see git history on branch `apply3-claim-code-variant` if you want the reference code.)

---

## Phone validation — US-only NANP policy

The `VALID_NANP_AREA_CODES` allowlist in `step-1-info/index.html` is a **50 US states + DC**
policy (365 area codes):

- **Accepts** all 50-state + DC area codes, including newer US overlays like **983** (Denver),
  771 (DC), 278 (MI), 534 (WI), 629 (TN).
- **Rejects everything else NANP:**
  - **Foreign nations** (international long distance / non-US): 264 (Anguilla), 242 (Bahamas),
    246, 268, 284, 345, 441, 473, 649, 758, 784, 809/829/849 (Dom. Rep.), 868, 876 (Jamaica), etc.
  - **Canada** (55 NPAs: 416, 604, 905, 514, 403, …).
  - **Non-state US territories**: Puerto Rico (787/939), Guam (671), USVI (340), N. Mariana (670),
    American Samoa (684).
- **DC is kept** (202, 771) — it's domestic US and benefit-eligible, so "50 states only" was read
  as "exclude Canada + territories + foreign," not "exclude the capital." Say the word if you want
  DC dropped too.

⚠️ **This is an allowlist of valid US NPAs**, so new US overlays must be added here as they launch
(I found 983/278/534/629 were missing and added them). If a real US lead is ever wrongly rejected,
it's a missing overlay — tell me the code and I'll add it.

✅ **Server-side: DEPLOYED.** The `submit-lead` edge function (Supabase project
`quhxbgsgtfvrasyjvaba`, **version 42**) now uses the same 365-code US-only allowlist + the `.@`
email rule. Verified with live smoke tests: a 416 (Canada) number and a `name.@gmail.com` email
both drop to `bot_drops`; a valid US lead still reaches `leads` with `crm_status: success`. This is
the real fix for the non-US / bad-email leads that were reaching the `leads` table from the live
apply/2 funnel. (apply/2's *client-side* list is now looser than the server — harmless, the server
gates entry — but update it too if you want full client/server parity there.)

## Running the A/B test

No traffic splitter is built (keeps the live funnel untouched). Run the test by pointing a
slice of **Google Ads** traffic at `https://nba3.vercel.app/apply/3/` (or
`nationalbenefitalliance.com/apply/3/`) and compare call-conversions against `/apply/2/`.
`vercel.json` needs no changes — `/apply/3/` serves statically.

---

## Before launch — verify

1. **GTM "Completed funnel" trigger** fires on `/apply/3/thank-you/`. If the trigger's URL match
   is pinned to `/apply/2/thank-you/`, add `/apply/3/thank-you/` (or loosen to "contains
   thank-you") in the GTM UI. Code alone can't move a conversion.
2. ✅ **Done (2026-06-19):** an end-to-end test lead landed in `leads` with correct `phone`,
   `email`, derived `state`, `dob`/`age`; **CallTools (201 CREATE) and Caliber (201) both accepted**
   the leaner record with the 5 demographic fields blank. No further action needed.
3. **GFN number swap** shows the right number on `/apply/3/thank-you/` (it will — `tel:` is
   unwrapped and the visible number is present).
4. Confirm `popup.js` behaves on all three pages.

---

## Orphaned files / cleanup

- This variant introduces **no orphaned files** — it's purely additive (`apply/3/`).
- **If Variant B loses the test:** delete the `apply/3/` directory. If the `age` column was
  shipped, it can stay (nullable, harmless) or be dropped separately.
- **If Variant B wins:** treat `apply/3/` as the new funnel (mirror apply/2's 308-redirect
  pattern in `vercel.json` if you retire apply/2), and migrate the phone-number/conversion notes
  in CLAUDE.md accordingly.

## Test-phase notes (revisit before final launch)
- **DOB is temporarily OPTIONAL** in `step-1-info/index.html` (the `required` attribute and the
  "blank" validation guard) so we can test whether the backend/CRM accept an empty `dob`. If empty
  dob is accepted, swapping DOB → Age later is trivial. If we keep DOB, re-add `required` and restore
  the "Please enter your date of birth" empty-case error.
- **Orphaned CSS:** the `.progress-container` / `.progress-row` / `.progress-bar` / `.progress-fill`
  rules (~lines 744–774 of `step-1-info/index.html`) are now unused — the progress bar markup was
  removed from the page. Harmless; delete if you want to tidy up (or keep to easily re-add the bar).

## Possible polish (cosmetic, not blocking)
- The landing card still shows a "1" step badge next to "What brings you here today?" (leftover
  from apply/2's two-section card). Harmless; remove if it reads oddly without a "2".
