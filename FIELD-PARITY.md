# Field Parity — funnel side (5 Sep 2026)

The full end-to-end audit lives in the backend repo at `nba-supabase-backend/FIELD-PARITY.md`.
This is the half that lives here, so a site-repo change starts from the right facts.

**No code has been changed on this branch.**

---

## Verified clean

All five in-repo funnels post an **identical 34-key payload**. `_field_parity.py` is
idempotent and has been applied; there is no drift between funnels.

```
transaction_id state dob citizenship street_address city zip annual_income
employment_status first_name last_name email phone tcpa_consent
trusted_form_cert_url gclid msclkid oppref fbclid ttclid li_fat_id twclid epik
landing_page wbraid gbraid utm_source utm_medium utm_campaign utm_content
utm_term needs hp_website form_duration_ms
```

`apply/0/step-3-phone` additionally sends `age` (harmless — the edge function prefers an
explicit `age` and otherwise derives it from `dob`).

Every one of those 34 keys has a column in `leads` and reaches at least one CRM.

---

## `needs` — deployed, two of five funnels proven

Live since 2026-09-05 00:17 UTC. Of the 37 leads submitted since:

| Funnel | leads | with `needs` |
|---|---:|---:|
| `apply2` | 26 | 23 (3 visitors chose no tile) |
| `oa1` | 6 | 3 |
| `bg1`, `info01`, `apply0` | 0 | — |

Nothing is broken — those three just haven't converted a lead yet. **Re-check in a few
days** before calling it done.

Caveat worth knowing: **CallTools has no `needs` custom field**, proven from 1,419 API
response echoes. So `needs` currently reaches `leads` and Caliber only, and cannot reach
Ringba (the Ringba enrich URL reads off the CallTools contact).

---

## Gaps that need a change *in this repo*

### 1. `publisher` — 0 of 41,829 leads

The column exists, `submit-lead` reads `payload.publisher`, CallTools receives it as
`pubid`, Caliber receives it as `attribution.publisher`. **No funnel sends it.** It is also
the value that gates webhook ingest (`pub=NBA`) and that `pipeline-health-check` alerts on.

Smallest fix: a constant in each submit payload, same shape as the existing
`landing_page: 'apply2'` line.

### 2. `click_timestamp` — 0 of 41,829 leads

Column + Caliber field both exist. Needs `captureUTM()` to stamp the first-touch time into
`sessionStorage.nba_funnel` on first page load and the submit step to post it.

### 3. Google ValueTrack — no path at all

`campaign_id`, `adgroup_id`, `creative_id`, `target_id`, `network` were added to
`offline_conversion_events` on 4 Sep and are **0-filled across all 51,386 events**.

Four links are required and **all four are missing**:

1. Google Ads final URLs must append `{campaignid}` / `{adgroupid}` / `{creative}` /
   `{targetid}` / `{network}` — Ads UI, owner-managed.
2. `captureUTM()` must add those five to its capture array (it currently holds 5 UTMs +
   9 click ids).
3. `leads` needs five new columns — **it has none today**.
4. CallTools needs five custom fields, or the Ringba enrich URL has nothing to read.

⚠️ CallTools' *dialer* campaign id is also called `campaignid` in the enrich URL. The two
must sit on distinct Ringba tag names or the column fills with dialer ids.

### 4. Consent Mode v2 — deliberately absent

`consent_ad_storage` / `_ad_user_data` / `_ad_personalization` are plumbed to Caliber and
never sent. **Correct as-is** — EU/UK requirement, NBA runs US traffic only.

---

## A sixth funnel that is not in this repo

`https://apply.nationalbenefitalliance.com/` posts to `submit-lead`: **153 leads in 2 days,
6.3% of volume**, `utm_source=meta`.

- Not in this repo, not in `vercel.json`
- Sends no `landing_page` → it is the current source of null-`landing_page` rows
  (**not** `apply/0`, which `#38` fixed)
- Sends no `needs`
- Posts blank `street_address`, `city`, `annual_income`, `employment_status`
- Does send `citizenship`, `dob`, `state`, `zip`

`_field_parity.py` cannot reach it, so every future funnel parity migration will skip it
silently — the exact failure mode that cost `apply/0` its attribution before Sep 2026.

**Decide: adopt it (give it `landing_page: 'meta1'` and bring it to parity) or retire it.**

---

## Not a funnel problem

For completeness — these are the audit's biggest findings, and none of them are fixed here:

- The **Caliber conversion pixel** sends `transaction_id` and `conversion_time` as empty on
  100% of 9,336 fires, and never sends `event`, `offer`, or `zip`. 36% of Caliber events
  match no lead. That is a Caliber-POC postback-URL change.
- **CallTools drops** `landing_page`, `needs`, `referrer`, `ip_address`, `user_agent` — no
  custom fields exist. That is a CallTools account change.

Both are prerequisites for anything added here to reach Ringba or Google.
