# Funnel & Data-Integrity Playbook

**What this is.** The master reference for how a lead-gen funnel + connected database should
behave, distilled from everything we hardened on **National Benefit Alliance (NBA)** after it
was already live. It has two jobs:

1. **Start-of-task guardrail (this project).** Read this before any NBA task so a change stays
   consistent with the locked-down data flow, integrity rules, dedup logic, identifiers, and
   Google-Ads-policy boundaries — and doesn't quietly break them.
2. **Blueprint for the next build (other projects).** A portable spec for standing up a new
   funnel — or conforming an existing site (UtilityBenefits is first) to the same standards from
   day one, instead of re-learning them the hard way.

**How to read it.** Each section states **the rule** (portable, applies anywhere) and, where
useful, **NBA's actual value** in a callout. When you lift this into a new project, keep the
rules and swap the `[bracketed placeholders]` for that project's values.

**Companion docs (NBA).** This stays intentionally readable; deeper detail lives in:
- [`DECISIONS.md`](DECISIONS.md) — the living record of *why* the lead pipeline is built the way it is.
- [`CLAUDE.md`](CLAUDE.md) — the site build rules (static HTML, sitewide-script edits, phone lines).
- `MARKETING-PARTNERS-README.md`, `OFFERS-README.md`, `OPENAI-SOURCE-README.md` — narrow features.
- **Gap:** the backend repo (`nba-supabase-backend`) currently has **no** docs. The offline-conversion
  section below is its first written spec.

---

## 0. The golden rules (read first)

If you remember nothing else, these are the hard-won ones. Each has its own section below.

> **Scope.** These are the standards for our **primary, Google-Ads-driven revenue funnels**, where the
> volume justifies full rigor. A **low-volume funnel for a different source** (e.g. OpenAI / ChatGPT
> PPC) may **intentionally** skip some of these — the cost of the machinery isn't worth it there.
> Decide per funnel; don't assume every rule applies everywhere. When a rule is Google-specific, it's
> noted.

1. **Only accepted leads see the thank-you page/number.** The TY number is a *separate line* shown
   **only** after the CRM confirms it accepted the lead (`crm_accepted: true`). So a call on the TY
   line always has a matching contact in the CRM. Never show it on failure/bot/validation-drop.
2. **A conversion counts once.** A *conversion* = a **monetized call Ringba posts back** (not a form
   submit). A conversion reaches the Sheet only when it has **positive revenue AND a `ringba_call_id`**
   — zero-value postbacks are ignored, and every genuine Ringba call carries a call id. Google also
   de-dupes its own import by conversion action + click id + Order ID, so the job here is just to not
   *feed* it a duplicate. **CallXfer carve-out:** the "$0 ignored" rule is *revenue-only* — the separate
   `call_transferred`/**CallXfer** conversion is deliberately $0, count-only (§7e).
3. **Bots never reach the CRM or the numbers.** Honeypot + time-trap + server-side validation divert
   suspected bots and invalid inputs to a quarantine table, returning a *fake success* so they learn
   nothing. They never hit the CRM, never fire an alert, never see the TY line.
4. **Validate on the client as closely as practical to the CRM's rules** — the CRM is still the final
   authority. Phone/email/DOB are validated in the browser to match what the CRM will accept, so most
   users fix it before submit. Expect *occasional drift* (e.g. a brand-new overlay area code the CRM
   hasn't allowed yet); when that happens, re-sync the client + server allowlists — don't treat perfect
   parity as guaranteed.
5. **The submit path has exactly one write target: your own database.** Never bolt a second live
   POST (Sheets, Ads API, etc.) onto submit — it adds a failure point to the revenue path. Report and
   sync *from* the database, asynchronously.
6. **Never break ad tracking.** GTM on every page; never wrap/`onclick`/`preventDefault` a `tel:`
   link; one phone line per funnel stage; consistent number format **`1-XXX-XXX-XXXX`** (dashes, leading
   `1` — never `(XXX) XXX-XXXX`); every call CTA shows the number; identical HTML for crawlers and users.
7. **Every *submitted lead* carries a stable `transaction_id`.** Generated on first page load,
   guaranteed non-empty server-side — the thread tying browser → DB → CRM. Downstream is different:
   direct-dial callers who never submitted won't have one; those are matched by phone / call id instead.
8. **When in doubt about ad-platform policy, ask first.** Any code or feature that could risk a
   **Google Ads or YouTube policy violation** — cloaking, doorway/bounce pages, `tel:` manipulation,
   misleading claims, government-affiliation implications — is **discussed before it's built**, not
   patched after a strike. (See §10.)
9. **Never ship a page that degrades speed.** Page-speed & Core Web Vitals are revenue-relevant (Quality
   Score / Ad Rank, organic ranking, conversion rate). Anything that could slow response time or hurt
   **Google PageSpeed Insights** or **Pingdom** scores — a new third-party script, a heavy image, a
   webfont, a render-blocking asset, layout shift — is **aligned before it's built**, and new page types
   are **speed-tested before launch. A regression is a launch blocker.** (See §13.)

---

## 1. Architecture at a glance

Two repos, deliberately separated so the public site and the secret-holding backend have independent
blast radius:

| Repo | Hosts | Why separate |
|---|---|---|
| **Site** (static HTML on Vercel) | Public pages, funnel, GTM, `tel:` links, serverless helpers | Publicly served; no secrets |
| **Backend** (Supabase edge functions + migrations) | Lead ingest, CRM dispatch, offline-conversion pipeline, secrets | Runs revenue-handling code and holds API keys |

> **NBA:** Site repo `nba3` (`80439jk/nba3`, ~3,259 pages) at `claude-workspace/claude-code/NBA/`.
> Backend `lalazeelady/nba-supabase-backend`. Supabase project `quhxbgsgtfvrasyjvaba` (us-east-2, PG17).

### How it works, in plain language

Follow one lead through the whole system — **this is the story to replicate on a new project:**

1. **A visitor submits the funnel.** The contact-step POST hits `submit-lead`. After the bot/validation
   gates (§8–9), the lead is written to the **`leads`** table (with its `transaction_id`, UTMs, click
   IDs) and, in parallel, pushed to the **CRM** (CallTools today, Caliber next). The funnel reveals the
   thank-you page's dedicated phone number **only if the CRM accepted** the lead (`crm_accepted`, §4) —
   so every `leads` row corresponds to a real CRM contact.
2. **The lead calls in.** The CRM **attaches that inbound call to the matching contact by phone**, tying
   the call back to the original lead.
3. **If they qualify, the agent transfers the call to Ringba** (the call-routing / monetization layer).
4. **On transfer, Ringba fires a "call transferred" pixel** → `ringba-transfer-webhook` → writes a
   **$0, count-only `call_transferred` event** (conversion **CallXfer**) into
   **`offline_conversion_events`**. This counts the *transfer itself*, independent of revenue.
5. **If that transferred call monetizes, Ringba fires a second pixel** → `ringba-conversion-webhook` →
   writes a **revenue `call_converted_revenue` event** (conversion **CallConvertOffline**) into the same
   table. This is the *money* conversion.
6. **`offline_conversion_events` is the outbox.** Each row records whether it's been sent to Google
   (`sheet_synced_at`). Every **15 minutes**, `sync-google-sheet` reads the unsynced rows (via the export
   view) and appends **both** conversion types — transfers **and** monetized calls — to the **Google
   Sheet**, then stamps them synced.
7. **Google Ads is connected to that Sheet** and imports the two offline conversions on its own schedule,
   de-duping by Order ID.

**Two nuances a new build must get right:**
- **Internet (CallTools) transfers skip the pixel.** An internet lead *monetizes at the moment it
  transfers*, so there's no separate transfer pixel — a **database trigger** (`trg_derive_internet_transfer`)
  derives the CallXfer automatically from each non-Ringba (`non-RGB`) monetization, skipping real Ringba
  `RGB…` calls so they're never double-counted (§7e).
- **Transfers are NOT collapsed per caller.** Every distinct transferred call uploads (keyed on its call
  id); only an exact re-fire of the *same* call collapses. Revenue conversions, by contrast, are the one
  monetized event per call. (Full dedup model: §7 + §7e.)

### The end-to-end data path

```
                          ┌─────────────────────────── ONLINE (real-time) ───────────────────────────┐

  Visitor → Funnel (static HTML, GTM on every page, captureUTM + transaction_id on load)
     │
     │  POST contact step
     ▼
  submit-lead  (edge function)
     ├─ Gate 1  honeypot filled?  ─────────────────┐
     ├─ Gate 2  form filled < 3s?  ────────────────┤→  bot_drops   (fake 200, crm_accepted:false, STOP)
     ├─ Gate 3  phone fails NANP + US allowlist? ──┤
     ├─ Gate 4  email fails regex? ────────────────┘
     │
     ├─ INSERT leads (crm_status: pending, guaranteed transaction_id, derived age)
     ├─ parallel dispatch  (Promise.all)
     │     ├─ CallTools  (retry 3×, strip empty values, Overwrite-by-phone)
     │     └─ Caliber    (HMAC-signed, enum-mapped)
     ├─ INSERT api_logs  (one row per provider)
     ├─ UPDATE leads  crm_status + caliber_status
     ├─ on CallTools fail → Resend alert email
     └─ RETURN 200 { crm_accepted }   →  funnel shows TY number ONLY if crm_accepted:true

                          └───────────────────────────────────────────────────────────────────────────┘

                          ┌────────────────────────── OFFLINE (async, later) ─────────────────────────┐

  Qualified call transferred to Ringba
     │  ① "call transferred" pixel
     ▼
  ringba-transfer-webhook    →   $0 count-only   (event_type=call_transferred · CallXfer)
     │
     │  ② later, if that call monetizes: "converted (revenue)" pixel
     ▼
  ringba-conversion-webhook  →   revenue         (event_type=call_converted_revenue · CallConvertOffline)
     │      both webhooks: shared-secret · defensive parse · publisher==NBA · matchLead · dedupe_key
     │
     │  Internet (CallTools) transfers have NO transfer pixel — they monetize AT transfer, so a DB
     │  trigger (derive_internet_transfer) makes a $0 CallXfer from each non-RGB monetization row.
     ▼
  ┌──────────────────  offline_conversion_events  (the outbox)  ──────────────────┐
  │  1 row per conversion (transfer OR revenue) · unique dedupe_key · sheet_synced_at │
  └───────────────────────────────────────┬───────────────────────────────────────────┘
                                           │
      ┌── METHOD A: Google Sheet (default) ─┴─ METHOD B: Data Manager API ──┐
      ▼  every 15 min (pg_cron)                    ▼  push, near-real-time
  sync-google-sheet                          upload-google-offline-conversions
   read export view · never-blank Order ID     push events:ingest · OAuth + MCC login
   append to Sheet · stamp sheet_synced_at      productDestinationId = conversion action
      │  Google Ads PULLS the Sheet                 │  (2xx ≠ counted; check Diagnostics)
      └──────────────────────┬──────────────────────┘
                             ▼
        Google Ads offline conversions:  CallConvertOffline (revenue) + CallXfer (transfers)
        de-dupes within each action by Order ID / transactionId
        ⚠ A + B into the SAME action ⇒ need Order ID == transactionId, else double-count

                          └───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tracking & the Google Ads dependency

The business runs on paid search driving calls, so **ad tracking is load-bearing infrastructure.**
Do-not-touch-without-alignment:

- **GTM container on every tracked page — as high in `<head>` as possible.** Main script high in
  `<head>`; the `<noscript>` iframe right after `<body>` opens. A tracked page missing it under-reports
  silently. *(Deliberate exceptions exist — some pages we intentionally don't track may omit it; that's
  a conscious, noted choice, never stripped from a page meant to convert.)*
- **Never interfere with `tel:` links.** No wrap / `onclick` / `preventDefault` / JS-built href. Google's
  Forwarding Number (GFN) swaps the *displayed* number by reading the exact `tel:` value; a call-click
  GTM trigger fires on the native anchor.
- **Every call link/button displays the actual number** — not a bare "Call Now." The visible number is
  what GFN swaps and what click tracking keys on.
- **Don't rename a class — or change a `dataLayer` push — that GTM is keyed to, without updating GTM.**
  Triggers may match a CSS class (NBA's `ty-call-btn`) or listen for a `dataLayer` event; if the page and
  the trigger drift apart the tag stops firing **silently**. *(Verify against your own GTM; NBA's
  `ty-call-btn` IS wired, and NBA is not using `dataLayer` custom events today.)*
- **No cloaking, ever.** Crawlers and users get identical HTML; popups fire well after crawler-scoring.

### Phone-number segmentation (one line per stage)

Each stage its own line, each mapped to its own Ads Call Conversion action + GTM tag. **Never two on a
page.** Format `1-XXX-XXX-XXXX` (dashes, leading 1) for display; `tel:+1XXXXXXXXXX` for the href.

| Stage | NBA line |
|---|---|
| Main site (non-funnel, footer, schema, PDFs) | `1-800-605-8906` |
| In-funnel (landing + steps) | `1-813-556-9954` |
| **Thank-you (completed only)** | `1-813-560-8063` |
| Popup (inactivity overlay) | `1-813-556-9953` |

> Moving a number isn't just code — the owner updates the matching Ads action + GTM tag, or conversions
> don't move. Attribution survives `sessionStorage` clears (rides the `_gcl_aw` cookie, 90-day).

---

## 3. Attribution & identifiers

Capture on **first page load**, persist through every step so it survives to submit. Store raw; never
synthesize or cross-map.

| Identifier | Rule |
|---|---|
| **UTMs** | Capture `utm_source/medium/campaign/content/term`; persist across steps |
| **Click IDs** | Capture `gclid`, `wbraid`, `gbraid` into **separate** fields — never cross-map one into another's |
| **`transaction_id`** | `crypto.randomUUID()` on first load; guaranteed non-empty server-side; stored as `text` |
| **Consent cert** | Capture the TrustedForm cert URL (see §7 naming caveat) |

> **Real NBA bug:** collapsing click IDs corrupts attribution — gbraid values + UUIDs once landed in the
> `gclid` column and mis-mapped CallTools→Ringba (fixed 2026-04-30). The `gclid → gbraid → wbraid` order
> is only a *match priority* later, never a value overwrite.

### Backtracking a person (lookup keys)
`transaction_id` → `lead_id` → click ID → **phone (last-10 match)** → Order ID. Index phone on last-10
for fast caller-ID lookups. Keep the same keys on `leads` **and** `offline_conversion_events` so online
and offline records join cleanly.

---

## 4. The thank-you gate (accepted-leads-only)

**Rule:** the TY page — specifically its dedicated call number — renders **only** for a lead the CRM
accepted. Every other outcome (bot, invalid phone/email, CRM failure) returns a *fake success* to the
browser but must **not** route to the TY number.

**Why:** the TY line is a clean signal — a call on it should have a matching accepted contact in the CRM.
Showing it to everyone inflates "completed" conversions with junk.

**How:** `submit-lead` always returns HTTP 200, but the body carries a truthful `crm_accepted` boolean
(drops → `false`, CRM accepted → `true`). The funnel gates the TY number on `crm_accepted === true`.

> **NBA:** the reference/case number on the TY page is display-only and regenerates on refresh — not the
> record key (`transaction_id` is). **Transition:** once Caliber is primary, `crm_accepted` follows
> *Caliber's* acceptance.

---

## 5. Database design & management

### Core tables (portable shape)

| Table | One row per | Purpose |
|---|---|---|
| `leads` | Submission | All funnel fields + UTM/click IDs + per-CRM status/id/action/timestamp |
| `api_logs` | CRM/webhook call | Full request + response payloads, http status, success flag — the audit trail |
| `bot_drops` | Quarantined submission | `detection_reason`, ip, ua, `form_duration_ms`, raw payload |
| `offline_conversion_events` | Conversion postback | Staged offline conversions before upload (see §7) |

**Principles**
- **One provider = one `api_logs` row.** A duplicate on the CRM's side is a *success*, not a failure —
  don't let 409s inflate failure counts.
- **A stranded lead is a bug.** If a row inserts as `pending` but the function throws before resolving
  CRM status, flag it `failed` in the catch — never leave it stuck.
- **Unique key per table.** `leads`: `transaction_id`. `offline_conversion_events`: unique `dedupe_key`.
- **RLS on, service-role for functions.** Never expose the service key to the browser.

**Reporting (read side)**
- **Report FROM the database; never add a second write to the submit path.** Read-only views/RPCs.
- **Gate PII behind a secret token** (aggregate = publishable key OK; lead-level = token required).
- **Time zone = the business's operating zone** (NBA = Eastern), not UTC.

**Bot-detection fields are load-bearing** — honeypot (`hp_website`) + time-trap (`form_duration_ms`);
don't remove/autofill/bypass against production (§8).

> **CRM field-mapping reality:** sending a field ≠ the CRM storing it. NBA/CallTools persists everything
> **except `employment_status`** (no mapped field, silently dropped; fix is a CallTools custom field, no
> code change).

### Full Supabase object inventory (NBA)

The complete `public` schema, so a new project sees the whole surface — not just the pipeline tables above.

**Tables**

| Table | Rows | Role |
|---|---|---|
| `leads` | ~104k | **Pipeline.** One row per funnel submission. |
| `offline_conversion_events` | ~45k | **Pipeline.** One row per offline conversion (revenue *or* transfer) — the outbox (§7). |
| `api_logs` | ~288k | **Pipeline.** One row per CRM / webhook / upload call — the audit trail. |
| `bot_drops` | ~100 | **Pipeline.** Quarantined bot / invalid submissions (§8). |
| `newsletter_signups` | — | *Auxiliary.* Email signups from the `/newsletter/` page; written by `/api/newsletter` (service role). **Not** funnel leads — keep separate. |
| `roadmap_items` | ~30 | *Auxiliary.* Internal roadmap content; unrelated to the lead / conversion pipeline. |

**Views (read-side)**

| View | Role |
|---|---|
| `v_google_sheet_export_unsynced` | The offline-conversion export — the exact rows `sync-google-sheet` pushes (revenue + $0 transfers, never-blank Order ID). Full spec §7b–c. |
| `lead_report_daily` · `lead_report_detail` | Reporting views over `leads` (Eastern time). Feed the *separate* reporting Sheet, not the conversion Sheet. |

**Server-side automation (runs without a request)**

| Kind | Object | What it does |
|---|---|---|
| Edge fn | `submit-lead` | Ingest + dual-CRM dispatch + TY gate (§6). |
| Edge fn | `ringba-conversion-webhook` | Revenue postback → `offline_conversion_events` (§7a). |
| Edge fn | `ringba-transfer-webhook` | Ringba "call transferred" pixel → $0 CallXfer (§7e). |
| Edge fn | `sync-google-sheet` | Reads export view → appends to Google Sheet → stamps synced (§7b). |
| Edge fn | `archive-old-sheet-rows` | Keeps the Sheet under the 90-day + cell-cap limits (§7f). |
| Edge fn | `upload-google-offline-conversions` | Data Manager **API** route (§7 + §7d). |
| Edge fn | `export-google-sheet-csv` · `backfill-google-sheet-pii` · `prune-sheet-rows-by-order-id` | Support / ops utilities (§7d). |
| **Cron** | `sync-google-sheet-15min` (`*/15 * * * *`) | Fires the Sheet sync. |
| **Cron** | `archive-old-sheet-rows-daily` (`7 9 * * *`) | Fires the daily archive/purge. |
| **Trigger** | `trg_derive_internet_transfer` → `derive_internet_transfer_event()` | Derives a $0 CallXfer from each internet (non-RGB) monetization row (§7e). |
| **Trigger** | `offline_conversion_events_set_updated_at` | Autotouch `updated_at`. |
| **RPC** | `lead_report_daily_recent(days)` | Aggregate reporting, no PII. |
| **RPC** | `lead_report_leads(report_token,…)` · `lead_report_summary()` | Lead-level reporting — **PII, token-gated.** |
| **RPC** | `rematch_offline_conversion_events()` | Re-runs lead matching on existing events (after a fix). |
| **Helper** | `normalize_email_for_google()` | Email normalization used by the export view. |

---

## 6. Lead-pipeline resilience (edge-function rules)

Distilled from NBA's `submit-lead`. These are the patterns that stopped silent lead loss.

1. **Always return 200 to the browser; carry truth in the body** (`{ success, transaction_id, crm_accepted }`).
2. **Dispatch CRMs in parallel, independently** (`Promise.all`, per-provider try/catch — latency = max, not sum).
3. **Read responses as text first, then parse defensively.** CRMs intermittently return a 5xx **HTML**
   error page; `res.json()` on that throws `Unexpected token '<'` and silently drops a valid lead.
4. **Retry transient failures, not client errors.** 5xx / non-JSON / timeout up to 3× with backoff;
   never 4xx. Safe because the CRM dedupes by phone.
5. **Never send empty values to an Overwrite-by-phone CRM** — a blank field clobbers the existing
   contact's real value. Strip `null`/`undefined`/`""`; keep `false`/`0`/arrays.
6. **Idempotency key to the CRM** — a stable request id keyed off `transaction_id`.
7. **Alert on real failures only** — not on dedupe/duplicate responses (those are successes).
8. **Derive once, store once** (e.g. `age` from DOB — store on the row *and* reuse for the CRM payload).

> See [`DECISIONS.md`](DECISIONS.md) for the full NBA rationale (dual-CRM, retry, empty-strip, guaranteed txn).

### The two CRMs (parity reference)

Leads are dispatched to **both** CRMs in parallel; each has its own status columns and `api_logs` row.
> **Transition:** NBA is **migrating CallTools → Caliber.** When Caliber is primary, the TY gate
> (`crm_accepted`) + failure alerting key off *Caliber's* acceptance, and CallTools drops out.

| Aspect | **CallTools** (current) | **Caliber** (incoming) |
|---|---|---|
| Transport | `POST …/api/contacts/`, Token auth | `POST …/ingest/nba`, HMAC-SHA256 over `${ts}.${body}` |
| Auth headers | `Authorization: Token` | `apikey` + `x-timestamp` + `x-signature` + `x-request-id` |
| Idempotency | Dedupe by phone (Overwrite) | `x-request-id = nba-submit-lead-<txn>` |
| Duplicate handling | Overwrite by phone → blank clobbers ⇒ **strip empties** | 201=created; **200/409=duplicate=success** |
| Body shape | Flat fields | Nested `consent/contact/attribution/extended` |
| Bad values | Unmapped field dropped | Unknown field dropped, but **bad enum value 400s the whole request** ⇒ map or omit |
| Enum mapping | Minimal (income→numeric) | Income / employment / citizenship all remapped |
| Consent field | `jornaya_lead_id` **(value = TrustedForm URL)** | `jornaya_leadid` **(value = TrustedForm URL)** |

> **Naming gotcha (both):** the field is *named* `jornaya_*` for back-compat, but the **value is the
> TrustedForm cert URL** now (Jornaya was replaced). Don't "fix" the name — it breaks their consent validation.

---

## 7. Offline conversions (call revenue → Google Ads)

The chain turns a *monetized call* into a *Google Ads offline conversion*, without ever adding a
synchronous Google call to a hot path.

### Two upload methods — choose per project

There are **two supported ways** to get `offline_conversion_events` into Google Ads. Both deliver the
same conversions; pick per client on **speed-of-setup vs. richness/real-time**.

| | **A · Google Sheet** (in-platform Data Manager *pull*) | **B · Data Manager API** (`events:ingest` *push*) |
|---|---|---|
| How | `sync-google-sheet` writes a Sheet; Google Ads' **in-platform Data Manager** pulls it on a schedule | `upload-google-offline-conversions` pushes each event to `datamanager.googleapis.com/v1/events:ingest` |
| Setup cost | **Low** — a service account + a shared Sheet; no GCP/OAuth project | **High** — GCP project, OAuth (`adwords` + `datamanager` scopes), MCC login id |
| Speed | Batched (Google pulls on its own cadence) | Near-real-time push |
| Best for | **Most clients** — fastest to stand up, doubles as a debugging surface | Higher volume / programmatic control |
| Terminology trap | in-platform **"Data Manager"** (Sheet pull) is **not** the **"Data Manager API"** | — |

> **Both feed the same destination.** For offline click conversions, the API's `productDestinationId` and
> the Sheet's Conversion Name both target the **same Google Ads conversion action**, which must be an
> **UPLOAD_CLICKS ("import from clicks")** action with **Enhanced Conversions for Leads** on. The **gclid
> credits the base conversion**; hashed PII (email/phone) is *supplementary* Enhanced-Conversions uplift —
> so an Ads "no user-provided data matches" diagnostic is a PII-match *quality* note, **not** a reason the
> conversion won't count.

> **Data Manager API — the two things that silently break it** (learned the hard way, 2026-08):
> 1. **MCC accounts REQUIRE `loginAccount`.** If the operating account sits under a manager (MCC),
>    `GOOGLE_LOGIN_CUSTOMER_ID` **must** be the manager's numeric id — otherwise Google returns `2xx` +
>    `requestId` but **credits nothing** (this was NBA's exact zero-count cause). `operatingAccount` = the
>    account holding the conversion action; `loginAccount` = the MCC; `productDestinationId` = the
>    conversion action id (`ctId`).
> 2. **`2xx` ≠ counted.** Data Manager ingests async and returns success on *acceptance*, not crediting.
>    The truth is in **Google Ads → Data Manager → Diagnostics** (received vs matched vs rejected). Always
>    test into an **isolated conversion action** first, so the signal isn't buried under a live action's
>    volume. A `?validate_only=true` toggle on the uploader checks payload/auth/destination with no writes —
>    but validateOnly passing still does **not** prove crediting; only a real event in the isolated action does.
>
> As of **June 15, 2026** Google migrated offline-conversion + ECL uploads to the Data Manager API and
> **blocked them in the classic Google Ads API** — so the API is the mandated go-forward, while the Sheet
> stays supported (gSheets is itself a valid Data Manager source).

> **⚠️ Running A and B in parallel: align the identifiers or you DOUBLE-COUNT.** Google de-dupes across
> sources **by `transactionId`, within a single conversion action.** So to run the Sheet and the API into
> the **same** action at once without double-counting, **the Sheet's Order ID and the API's
> `transactionId` must be identical** — then Google collapses the duplicate. Today they differ (Sheet
> sends `order_id`; API sends `dedupe_key`), so pointed at the same action they'd count **twice** for the
> whole overlap. Safer during overlap: point the API at a **separate/shadow action** and cut it onto the
> live action only once verified. **Never run both, mismatched, into the live action.**

> **NBA status (2026-08-07): migrating Sheet → API, running in parallel.** Sheet (A) stays live; API (B)
> is being brought up alongside it. The **MCC `loginAccount` fix is applied**, and validation ran against
> an isolated `DM_API_TEST` action. Before both hit `CallConvertOffline`, confirm the parallel-run
> identifier alignment (Sheet `order_id` == API `transactionId`) — or keep B on a shadow action.

### 7a. Ingest — `ringba-conversion-webhook`
- **Auth:** shared secret (`x-webhook-secret` header or `?secret=`). Returns 200 once accepted so the
  postback source won't retry events already stored.
- **Parse defensively.** Accept JSON, form-encoded, or query-string; the call platform's field names vary
  per buyer config, so match a **variant list** per logical field + merge one level of nesting.
- **Publisher ingress filter.** Store only postbacks whose `publisher == NBA`; log-and-drop everyone
  else's — uploading another publisher's calls to your Ads account is wrong attribution.
- **Match the call back to a lead**, in priority order:
  `lead_id` → `transaction_id` → `gclid` → `gbraid` → `wbraid` → **phone (last-10)**.
- **Backfill attribution from the matched lead** (postbacks frequently drop UTMs/txn).
- **Dedup on ingest** — a unique `dedupe_key`, upsert with `ignoreDuplicates` (a re-fired postback is a
  no-op, which neutralizes a Ringba retry).
- **Guard bad timestamps.** If the source sends an implausible conversion time (year < 2024), fall back
  to receipt time so you never upload a conversion that pre-dates its click.

> **Publisher caveat.** The "NBA" bucket is **not Google-only** — it also holds other traffic sources
> routed under the NBA publisher, with no clean way to split them today. Not harmful (Google ignores
> clicks it can't match), but `publisher == NBA` ≠ "Google-sourced."

> **Shared webhook — don't trust the `source` column.** The function hardcodes `source = 'ringba'`, so
> **every** row is stamped `ringba`. Two senders hit this one URL: real **Ringba transfers** (`RGB…` id,
> variable payout) and **CallTools internet transfers** (9-digit numeric id, `agent_name`, flat **$6** —
> the majority). Split them by id-format / `agent_name` / value, **not** `source`. (This is why the
> `calltools_call_id` Order-ID fallback exists.) *Cleanup candidate: stamp a real source at ingest.*

### 7b. Sync — `sync-google-sheet` (cron, every 15 min)
Reads `v_google_sheet_export_unsynced`, appends new rows to the Google Sheet, stamps `sheet_synced_at`
so they never re-emit. The Sheet is chosen over the direct API because it doubles as a **debugging
surface** and enables surgical row cleanup by Order ID.

- **View qualifies a row when:** `publisher = 'NBA'` **and** (`conversion_value > 0` **or**
  `event_type = 'call_transferred'` — the $0 CallXfer carve-out, §7e) **and** `sheet_synced_at IS NULL`
  **and at least one identifier present** (gclid/gbraid/wbraid/email/phone). No identifier → dropped
  (Data Manager rejects "all identifier fields empty").
- **Order ID (never blank):** `ringba_call_id` → `calltools_call_id` → `YYYY-MM-DD-XXX-XXX-XXXX` (ET date
  + last-10 phone, `_B`/`_C` on repeat, via `row_number()` over all events) → event UUID. Blank Order IDs
  break Google's upload de-dup **and** the manual `prune-sheet-rows-by-order-id` tool — a locked business
  rule (see [[feedback_nba_order_id_format]]).
- **PII raw, not pre-hashed** — Google Data Manager hashes email/phone/first/last on ingest. Phone is
  written with a leading `'` so Sheets stores it as text (doesn't strip the E.164 `+`).

> **Dedup — the one tail case:** two *revenue* postbacks for one call with **no** `ringba_call_id` and
> **no** `calltools_call_id` fall back to the date+phone Order ID, whose `_B` suffix makes them distinct →
> both could upload. **Cannot happen for a genuine Ringba call** (they always carry an id) — only via
> CallTools/internet posts. Monitor; don't assume impossible.

### 7c. Google Sheet field mapping (the "set up a new account" spec)
The tab has **15 columns, in this exact order**. This is what to send when wiring the Sheet for another account.

| # | Sheet column | Source (view field) | Meaning / rule |
|---|---|---|---|
| 1 | Google Click ID | `gclid` | Primary click identifier |
| 2 | gbraid | `gbraid` | iOS/web-to-app click id |
| 3 | wbraid | `wbraid` | iOS web click id |
| 4 | Conversion Name | `conversion_name` | The Ads conversion action name (NBA: `CallConvertOffline`) |
| 5 | Conversion Time | `conversion_time` | **UTC** `YYYY-MM-DD HH:MM:SS+0000` |
| 6 | Conversion Value | `conversion_value` | Call revenue/payout |
| 7 | Conversion Currency | `conversion_currency` | Default `USD` |
| 8 | **Order ID** | `order_id` | **Dedup key — never blank** (precedence above) |
| 9 | ip address | `ip_address` | From event or matched lead |
| 10 | email | `email` | Raw; Google hashes on ingest |
| 11 | phone | `phone` | E.164, stored as text (`'` prefix) |
| 12 | first name | `first_name` | Raw; Google hashes |
| 13 | last name | `last_name` | Raw; Google hashes |
| 14 | session attributes | (null today) | **Reserved for ECL** — improves match rate; never wired |
| 15 | user agent | (null today) | **Reserved for ECL** — improves match rate; never wired |

> Cols 1–8 are the click-based offline-conversion fields; 9–15 are the PII enrichment for Enhanced
> Conversions (so no-click, phone-only callers still match). Ads ingests the Sheet on its own schedule
> and **de-dupes by Order ID (col 8)**. **Multiple conversion actions share one Sheet, keyed by column 4
> (Conversion Name):** `CallConvertOffline` (revenue) and `CallXfer` (transfers, §7e) both flow through it.

### 7d. Supporting functions
- **`upload-google-offline-conversions`** — the **Data Manager API route** (see the two-methods table +
  callouts above). Provider `data_manager`, OAuth-only. Pulls `ready_to_upload` events, builds ECL
  identifiers from PII, retries up to 6×, sets `status='uploaded'`.
- **`prune-sheet-rows-by-order-id`** — surgical removal of bad Sheet rows by exact Order ID (why Order ID
  must never be blank).
- **`export-google-sheet-csv`** — CSV export of the export view.
- **`backfill-google-sheet-pii`** — one-off PII backfill onto older events.
- **`rematch_offline_conversion_events`** — re-runs lead matching on existing events (e.g. after a fix).
- **Cron:** `sync-google-sheet-15min` (`*/15 * * * *`, invoke secret from Vault) + `archive-old-sheet-rows-daily`.

### 7e. Call-transfer conversions — CallXfer ($0 count) — LIVE 2026-08-04

A second offline conversion, **CallXfer**, counts a *qualified transfer* (agent → buyer), **separate from
revenue**. It shares the same Sheet + upload pipeline, distinguished only by Conversion Name. Its
differences are deliberate **carve-outs**:

- **$0, count-only.** CallXfer rows carry `conversion_value = 0`. Golden rule #2's "zero-value ignored"
  and §7b's `value > 0` filter are **revenue-only** — the export view allows $0 when
  `event_type = 'call_transferred'`. (A volume/qualification signal for Smart Bidding; revenue stays on
  `CallConvertOffline`.)
- **Two sources feed it:** (1) **Ringba calls** → the `ringba-transfer-webhook` edge fn, fired on Ringba's
  **Incoming** event (same parser/gate/match/backfill as the revenue webhook, but
  `event_type='call_transferred'`, value forced $0, reuses `RINGBA_WEBHOOK_SECRET`). (2) **Internet
  (CallTools)** → **no pixel** (transfer = monetize); a DB trigger (`derive_internet_transfer_event`)
  derives a CallXfer from each **non-`RGB`** monetization; RGB rows are skipped (the pixel already handles
  them — deriving would double-count).
- **Dedup = upload EVERY transfer, keyed on call id** (updated 2026-08-04; superseded the earlier
  "one per caller per ET-day" rule). `dedupe_key = ringba:call_transferred:<call_id>` — each distinct
  transferred call is its own row; only an **exact same-call re-fire** collapses (Google de-dupes those by
  Order ID too). Falls back to `<phone|click>:<full-timestamp>` when no call id. Migration `20260804140000`;
  ~158 previously-collapsed transfers were backfilled.
- **Statuses `transfer_ready` / `transfer_unmatched`** (never `ready_to_upload`), so the Data-Manager-API
  uploader — which selects `ready_to_upload` — can't touch transfers. **CallXfer rides the Sheet ONLY.**
- **Order ID** uses the normal precedence (`ringba_call_id` first), so transfer rows are never blank.

Migrations: `20260802120000` (view emits $0 transfers) · `20260804120000` (internet trigger) ·
`20260804140000` (call-id dedup).

### 7f. Sheet housekeeping — `archive-old-sheet-rows` (daily cron)

Google Ads rejects conversions older than **90 days** (from the click), and Google Sheets has a hard
**cell cap**. `archive-old-sheet-rows-daily` (09:07 UTC) keeps the live Sheet inside both:
- Moves live rows with Conversion Time older than **85 days** (buffer under 90) to a `LiveImport - OLD`
  archive tab, then deletes them from live.
- Purges archive rows older than **~175 days** so the archive stays bounded.
- Uses `deleteDimension` (rows are **removed**, grid shrinks) + trims blank/trailing rows so cleared cells
  don't count toward the cap. **Archive-before-delete**; deletes oldest (top) rows while `sync-google-sheet`
  appends to the bottom, so they never collide. Thresholds are query-param overridable.

### `[placeholder]` for a new project
`[postback source]` → `[webhook secret]`; publisher tag `[your publisher name]`; conversion action
`[name/id]`; `[Sheet id + tab]`; service-account `[SA JSON]`; and the same **never-blank Order ID** precedence.

---

## 8. Bot & spam minimization (keeping data usable)

Layered so junk never reaches the CRM, numbers, or reports — while returning a *fake success* so bots
learn nothing:
1. **Honeypot** — hidden field a human never fills; non-empty ⇒ drop (`honeypot_filled`).
2. **Time-trap** — faster than a human could complete ⇒ drop (NBA: `< 3000ms` → `too_fast`).
3. **Server-side format validation mirroring the CRM** (§9) — invalid phone/email ⇒ drop, no wasted CRM
   call or alert.

All drops → `bot_drops` (queryable `detection_reason`), return **200 + `crm_accepted:false`**, never enter
`leads`/CRM/alerts/TY-number. Keep honeypot + time-trap intact and un-autofilled — load-bearing.

---

## 9. Field validation (client ≈ server ≈ CRM)

Reject *as closely as practical* to what the CRM will, so most users fix it before submit. **The CRM is
the final authority; perfect parity isn't guaranteed** — a brand-new overlay area code may pass the client
and still be rejected downstream; re-sync both allowlists when it surfaces (expected drift, not a bug).

| Field | Rule (both sides) | Catches |
|---|---|---|
| **Phone** | 10 digits (or 11 w/ leading 1); NANP (area & exchange start 2–9); reject all-same-digit; **US-50-states+DC area-code allowlist** | Placeholders, CRM-rejected NPAs, foreign/territory codes |
| **Email** | Standard regex **plus** reject `..`, `.@`, `@.` | Real CRM rejects like `x@gmal..com` |
| **DOB** | Valid date; derive age server-side and store it | Null-age rows |

---

## 10. Google Ads policy landmines (don't get the account banned)

**Rule of thumb (golden rule #8):** anything that could plausibly risk a **Google Ads or YouTube policy
violation is discussed with the owner *before* it's built** — not patched after a strike. Uncertainty
itself is the trigger to ask.

- **Cloaking** — identical HTML for crawlers and users; popups fire after crawler-scoring delay (NBA: 30s
  inactivity — never shorten).
- **Unwrapped `tel:` links** — wrapping reads as manipulation + breaks GFN.
- **`noindex` bounce/redirect pages** — `noindex,nofollow,noarchive` **and** out of the sitemap; keep GTM
  on them. (NBA: `Offer03/05`, `clicktrk` — see `OFFERS-README.md`.)
- **TCPA / consent** — consent copy + its links are compliance surface; don't orphan them.
- **No fake urgency / government-affiliation implications** — keep CTAs on-brand, not mimicking official
  notices.

---

## 11. Deploy & process discipline

- **Deploy edge functions + migrations via the Supabase MCP** (no local CLI/Docker assumed).
- **The live deployed function is source of truth** — read/edit it, re-sync the repo (sha-verify) after
  deploy; don't blind-deploy from the repo (it has drifted from prod before).
- **Migrations** named `YYYYMMDDHHMMSS_description.sql`, forward-only; view/logic-only changes need no
  redeploy (next cron picks them up).
- **Site-wide static edits go through an idempotent Python script** (no template engine) — see `CLAUDE.md`.
- **Docs (like this file) live in git.** Keep the playbook committed so an untracked-file cleanup or
  branch switch can't lose it.

---

## 12. New-funnel launch checklist

**Tracking** — `[GTM]` on every tracked page (script high in `<head>`, `<noscript>` after `<body>`); one
`[tel: line]` per stage, each mapped to its own Call Conversion action + GTM tag; every call CTA displays
the number; TY-class + any `dataLayer` events kept in sync with GTM triggers; `captureUTM()` +
`transaction_id` on first load; click IDs in separate fields.

**Submit / DB** — honeypot + time-trap; client validation ≈ CRM rules; endpoint always 200 + returns
`crm_accepted`; `leads` inserted `pending`; parallel CRM dispatch, read-as-text-first, retry 5xx-only,
strip empties; `bot_drops` + per-provider `api_logs` + stranded-lead catch; confirm what each CRM persists.

**Thank-you** — TY number renders **only** on `crm_accepted === true`.

**Offline conversions** — `offline_conversion_events` with unique `dedupe_key`; publisher ingress filter;
lead-match incl. phone last-10; view = `value>0` (+ `$0 call_transferred` carve-out) + ≥1 identifier +
unsynced; **never-blank Order ID**; 15-column Sheet (phone as text, raw PII); 15-min cron +
`sheet_synced_at`; Ads import de-dupes by Order ID; if using the API method, MCC `loginAccount` set +
tested into an isolated action.

**Performance** — critical CSS inline, minimal JS; **no new third-party script without alignment**; images
compressed + right-sized + lazy-loaded (WebP/AVIF, explicit dimensions); fonts `swap`/system; no CLS;
**PSI-mobile + Pingdom tested against baseline before launch (regression = blocker).** See §13.

**Policy** — no cloaking; popups after crawler delay; bounce pages `noindex` + out of sitemap; consent
copy present + not orphaned.

**Process** — two-repo split; service-role key server-only; deploy via MCP; live function = source of
truth; **the playbook committed to git.**

---

## 13. Performance & page speed (keep the scores high)

Page speed is a non-negotiable, not a nice-to-have: it feeds Google **Quality Score / Ad Rank** (so it
moves CPC and impression share), **organic ranking**, and **conversion rate** (slow pages bleed leads).
The bar: **don't regress PageSpeed Insights** (mobile especially — Core Web Vitals: **LCP, INP, CLS**) or
**Pingdom** (load time, page size, request count). Anything that could is **aligned first** (golden rule
#9), and every new page type is speed-tested before it goes live.

**What keeps the scores high (best practices)**
- **Stay static and lean.** Self-contained HTML with critical CSS inlined in `<head>`, minimal JS — the
  existing architecture is fast *because* of this. Don't add a framework/SPA or a client-side router.
- **Third-party scripts are the #1 risk** — GTM + tags, chat widgets, A/B tools, extra analytics each cost
  LCP/INP. **No new third-party script without alignment.** Load what's essential (GTM) as required for
  tracking; `async`/`defer` anything non-essential; never add a synchronous blocking script.
- **Images:** compress and right-size (no oversized heroes), serve modern formats (WebP/AVIF), set explicit
  `width`/`height` (prevents CLS), and `loading="lazy"` below the fold. The hero image is usually the LCP
  element — optimize it hardest.
- **Fonts:** prefer system fonts; if a webfont is required, self-host + `font-display: swap` and limit
  weights — avoid FOIT and font-driven layout shift.
- **No layout shift (CLS):** reserve space for anything that loads late (images, embeds, injected content,
  popups). Never push existing content down after load.
- **Keep JS light (INP):** avoid long tasks and heavy per-step handlers; the funnel's step JS should be
  minimal. Don't block the main thread on load.
- **Delivery:** serve from the CDN/edge; immutable long-cache for `/css` and `/js`; correct cache headers
  (already in `vercel.json`). Minify; drop unused CSS/JS.
- **Popups/overlays must not regress render** — the inactivity popup and tracking must not block first
  paint or add heavy JS (and must fire after crawler-scoring — §10).

**Test before launch (the gate)**
- Run **PageSpeed Insights on mobile** and **Pingdom** on any new page type; compare to the current
  baseline. **A regression is a launch blocker** — fix or align before shipping.
- Watch Core Web Vitals **field** data over time, not just lab scores.

### `[placeholder]` for a new project
Set the target scores/thresholds up front (`[PSI mobile ≥ N]`, `[Pingdom load ≤ N s / ≤ N requests]`) and
treat them as launch gates the same way NBA does.

---

## Appendix — NBA quick-reference card

| Thing | Value |
|---|---|
| GTM container | `GTM-MTQ5WNFR` |
| Supabase project | `quhxbgsgtfvrasyjvaba` (us-east-2, PG17) |
| Repos | `80439jk/nba3` · `lalazeelady/nba-supabase-backend` |
| Phone — main / funnel / TY / popup | `1-800-605-8906` · `1-813-556-9954` · `1-813-560-8063` · `1-813-556-9953` |
| CRMs | CallTools (Overwrite-by-phone) + Caliber (HMAC) |
| Edge functions | `submit-lead`, `ringba-conversion-webhook`, `ringba-transfer-webhook`, `sync-google-sheet`, `upload-google-offline-conversions`, `export-google-sheet-csv`, `backfill-google-sheet-pii`, `prune-sheet-rows-by-order-id`, `archive-old-sheet-rows` |
| Tables | `leads`, `api_logs`, `bot_drops`, `offline_conversion_events` (+ `newsletter_signups`, `roadmap_items`) |
| Export view | `v_google_sheet_export_unsynced` (15 cols) |
| Conversion actions | `CallConvertOffline` (revenue, live) · `CallXfer` (transferred calls, $0 count-only — LIVE 2026-08-04) |
| Live upload path | Sheet → in-platform Data Manager pull → `CallConvertOffline`. Data Manager **API** (`upload-google-offline-conversions`) migrating in parallel (§7). |
| Sync crons | `sync-google-sheet-15min` (`*/15 * * * *`) · `archive-old-sheet-rows-daily` (`7 9 * * *`) |
| TY gate flag | `crm_accepted` |
| Order-ID precedence | ringba_call_id → calltools_call_id → ET-date+phone (_B/_C) → event UUID |

*Companion docs — DECISIONS.md · CLAUDE.md · MARKETING-PARTNERS-README.md · OFFERS-README.md. Verify exact
behavior against the live deployed edge functions.*
