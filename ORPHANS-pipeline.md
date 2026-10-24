# ORPHANS — funnel side

Found while auditing the lead data flow (Sep 2026). **Nothing here has been
deleted.** Review before removing. The backend repo has its own
`ORPHANS-pipeline.md` covering edge functions and DB objects.

| path | status | notes |
|---|---|---|
| `apply/1/` | unreachable | 308-redirected to `/apply/2`. Kept as a rollback reference. Its `step-5/index.html` still posts the legacy `click_id` and no `landing_page` — **deliberately not migrated** by `_field_parity.py`, since nothing can reach it. If the redirect is ever removed, migrate it first. |
| `apply/3/` | unreachable | Retired A/B variant, 308-redirected. Same situation, same caveat. |
| `apply/1/form/*` | dead | React SPA leftover from an early exploration; already flagged do-not-extend in `CLAUDE.md`. Genuinely unused. |

## Collected but deliberately not stored

Listed so nobody "fixes" these twice:

- `hp_website` — the honeypot. Never stored for accepted leads, by design.
- Consent Mode v2 (`consent_ad_storage` / `consent_ad_user_data` /
  `consent_ad_personalization`) — plumbed all the way to Caliber but never
  populated. They are EU/UK requirements and NBA runs US traffic only. Keep the
  plumbing, expect nulls.
- `click_timestamp` — a `leads` column and a Caliber field now exist, but no
  funnel captures the initial landing time yet. Populating it is a funnel change
  nobody has asked for.

## Redundant

- `leads.lead_source` — derived from `utm_source`. Owner's call (Sep 2026): now
  redundant, since `utm_source` is populated on 21,788 of 22,369 recent leads.
  Nothing downstream reads it; it is sent to neither CRM. Left in place; drop it
  once no report references it.

---

## Added 5 Sep 2026 — from the end-to-end field-parity audit

Full trace: `FIELD-PARITY.md` here, and `nba-supabase-backend/FIELD-PARITY.md` for the
backend half. Nothing deleted; verify before removing.

| item | status | notes |
|---|---|---|
| `https://apply.nationalbenefitalliance.com/` | **undocumented live funnel** | Posts to `submit-lead` — 153 leads in 2 days (6.3% of volume), `utm_source=meta`. Not in this repo, not in `vercel.json`. Sends no `landing_page` and no `needs`; posts blank `street_address` / `city` / `annual_income` / `employment_status`. It is the current source of null-`landing_page` rows, **not** `apply/0`. `_field_parity.py` cannot see it. **Adopt or retire.** |
| `consent_ad_storage` / `consent_ad_user_data` / `consent_ad_personalization` | plumbed, never sent — **correct** | Consent Mode v2 is an EU/UK requirement. NBA is US-only. Keep the plumbing, expect nulls. Do not "fix". |
| `ttclid` / `li_fat_id` / `twclid` / `epik` | captured, stored, 0 fill | All five funnels capture them and `leads` stores them. Zero traffic from TikTok / LinkedIn / X / Pinterest. Correct to keep — they cost nothing and start working the day a campaign runs. |
| `apply/1/`, `apply/3/`, `apply/1/form/*` | unchanged | Still 308-redirected / React leftover. Re-confirmed during this audit. Deliberately excluded from `_field_parity.py`. |
