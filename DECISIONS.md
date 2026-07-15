# Design Decisions & Principles — lead pipeline & reporting

Living record of the significant decisions behind the lead data pipeline and reporting.
Where this conflicts with older prose in `CLAUDE.md` (e.g. a single-CRM / no-retry backend
description), **this file reflects the live system** and wins.

---

## Lead pipeline — `submit-lead` edge function

- **Dual-CRM, in parallel.** Every contact-step submission is dispatched to **CallTools** and
  **Caliber Leads** concurrently (`Promise.all`); their statuses are independent. The function
  **always returns HTTP 200** to the frontend regardless of CRM outcome, and logs each provider
  to its own `api_logs` row.
- **CallTools resilience (retry).** CallTools intermittently returns an HTTP **5xx with an HTML
  error page** instead of JSON. Read the response **as text first**, then parse defensively —
  never call `.json()` on an unread body (that threw `Unexpected token '<'` and silently dropped
  otherwise-valid leads). **Retry transient failures** (5xx / non-JSON / network timeout) up to
  3× with backoff + a per-attempt timeout. 4xx is not retried. CallTools dedupes by phone, so a
  retry after a partial create merges instead of duplicating.
- **Never send empty values to CallTools.** CallTools' duplicate mode is **Overwrite, matched by
  phone** — a blank field on a repeat submission **clobbers** whatever the existing contact
  already has (e.g. wipes a real `gclid`). Strip `null`/`undefined`/`""` from the CallTools body
  before posting (keeps `false`/`0`/arrays). Caliber already omits empties.
- **Guarantee a non-empty `transaction_id`.** It's the key identifier; generate a UUID if the
  front end ever sends a blank one, so nothing reaches `leads`/CallTools/Caliber without it.
- **Validation parity (client == server).** The email + phone validators on `/apply/2` **and**
  `/apply/3` must match the edge function exactly. Email rejects the base-regex failures plus
  consecutive dots (`..`), dot-before-at (`.@`), and at-before-dot (`@.`). Phone is NANP + a
  **US-only area-code allowlist** (excludes Canada/territories). Bad inputs go to `bot_drops`,
  not CallTools.

## CallTools reconciliation & field mapping

- **Reconcile by unique phone, not `transaction_id`.** CallTools = one contact per phone
  (Overwrite), so it keeps only the *latest* submission's txn per phone. `crm_action` `CREATE` =
  net-new contact, `MERGE` = overwrite of an existing one. The Supabase number that matches a
  CallTools contact pull for a date range is **distinct phones among `crm_status='success'`**.
- **What survives in CallTools (verified via the response echo in `api_logs`).** Everything we
  send lands **except `employment_status`** — CallTools has no field mapped to it, so it's
  silently dropped (fix: add a matching custom field in the CallTools account; no code change).
  `transaction_id`, `gclid`, `gbraid`, all UTMs, **TrustedForm** (`jornaya_lead_id`),
  citizenship, address, zip, income, TCPA, name/email/phone/dob/age all persist 100%. `add_tags`
  is stored under CallTools' native `tags`.

## Reporting

- **Report FROM Supabase; do not add a second inline POST** (e.g. to Sheets) on the submit path —
  never add a failure point to the revenue-critical lead flow. All history is already in Supabase.
- **Objects** (all Eastern time): `lead_report_summary(from,to)`, `lead_report_daily`,
  `lead_report_detail`. Sheet-facing RPCs: `lead_report_daily_recent(days)` (aggregate, no PII)
  and `lead_report_leads(report_token, days, limit, offset)` (lead-level **PII**, gated by a
  secret token so the publishable key alone can't pull personal data).
- **Google Sheet auto-pull = Apps Script, time-triggered every 15 minutes** (overwrite, not
  append; a poll, not a per-lead push). PostgREST caps responses at 1000 rows → the script
  paginates. Grant the reporting RPCs to **PUBLIC** (an `anon`-only grant was silently stripped
  once); PostgREST still requires the publishable key, and PII stays behind the token.

## Deploy / process

- **Deploy `submit-lead` via the Supabase MCP** (`deploy_edge_function`) — no local Supabase CLI,
  access token, or Docker is available.
- **Keep the GitHub repo == the live function.** The backend repo drifted from production once
  (missing age handling, US-only NPAs, the `.@` email check) — deploying from it would have
  regressed prod. **Treat the live deployed function as source of truth**: read it, edit that,
  and re-sync the repo (sha-verify) after every deploy.
