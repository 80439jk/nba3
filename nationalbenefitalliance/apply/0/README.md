# `/apply/0/` — SMS / 10DLC Compliance Funnel

A duplicate of the `/apply/3/` funnel, created so we have a **compliant SMS opt-in
flow** to submit for **10DLC registration**. Built on branch
**`apply0-sms-compliance-funnel`**. Organic/on-site "Find Assistance" traffic is
routed here; **paid traffic keeps going to `/apply/2/` and `/apply/3/`** (unchanged).

## Flow (identical structure to apply/3)

| Page | URL |
|---|---|
| Landing | `/apply/0/` |
| Step 1 — age + ZIP | `/apply/0/step-1-age-zip/` |
| Step 2 — name + email | `/apply/0/step-2-name-email/` |
| Step 3 — phone + consent (submits the lead) | `/apply/0/step-3-phone/` |
| Thank-you | `/apply/0/thank-you/` |

Same backend (`submit-lead` Supabase edge function), same payload shape, same
GTM container (`GTM-MTQ5WNFR`), same TrustedForm + honeypot + time-trap as apply/3.
**Phone scheme is different — funnel 0 is organic:** landing + steps use the main-site
number **1-800-605-8906** (hours Mon-Fri 9-6 ET); the thank-you page uses a
**dedicated organic line 1-239-456-9476**; the `thank-you-2` fallback uses the main-site
number. Paid funnels apply/2 & apply/3 keep the started/completed funnel lines; the
shared inactivity popup keeps its own number regardless of funnel.

## The 3 differences from apply/3 (all in `step-3-phone/index.html`)

1. **Added an opt-in checkbox** (`#tcpaConsent`) next to the submit button. It is
   **unchecked by default** and **not `required`** — the user can submit without it.
2. **New TCPA / consent text** (owner-supplied) as the checkbox label. It no longer
   says the user's info "may be shared with… marketing partners"; consent is to be
   contacted **by National Benefit Alliance** (calls + texts).
3. **Consent now reflects the checkbox.** apply/3 hardcoded `tcpaConsent: true`;
   apply/0 sends `tcpaConsent: <box checked?>` → the lead records
   `tcpa_consent: true` **only if the box was checked**, otherwise `false`.
   The checkbox state is also restored on back/forward navigation.

### Consent behavior (by design)
- Box **checked** → `tcpa_consent: true` → OK to text (per owner: texts only go to
  checked-box leads).
- Box **unchecked** → `tcpa_consent: false` → lead is **still submitted** (owner does
  not outbound-call; leads call inbound). We simply do **not** text these leads.

## Consent copy note
The checkbox label is owner-supplied and opens **"By checking this box, you confirm…"**.
Latest wording: consent is to be contacted **by National Benefit Alliance** for calls +
texts (no third-party data-sharing clause; the email sentence still references affiliated
brands and marketing partners). "Terms of Use"/"Privacy Policy" linkified to `/terms/`,
`/privacy/`. **One fix:** source read "…may used by…" → rendered "…may be used by…"
(dropped word); tell me if you want it literally.

## Thank-you pages (conformed to apply/2 + CRM-gated)
The thank-you experience is **not** a tested variant — only the lander/steps are. So
apply/0's thank-you pages were conformed to apply/2's canonical design:

- `apply/0/thank-you/` and `apply/0/thank-you-2/` use apply/2's "Congratulations! /
  Reference Number" design (random 5-digit ref generated on the page); they differ from
  apply/2 only in path **and phone number** (funnel-0 organic scheme, above).
- **CRM-gate (matches apply/2):** step-3 reads `crm_accepted` from the `submit-lead`
  response (15s abort, **fail-closed**) and stores it in `nba_ty`.
  - accepted → `/thank-you/` — **dedicated organic line `1-239-456-9476`**, `ty-call-btn`.
  - not accepted / dropped / timed-out → `/thank-you-2/` — **main-site `1-800-605-8906`**,
    `alt-call-btn`. Keeps the new organic line exclusive to genuine completed leads.
  - `/thank-you/` also has a `<head>` guard: no accepted submission this session →
    redirect to `/thank-you-2/` (closes direct-nav / bookmark / refresh holes).

**GTM (confirmed by owner):** button-click tags fire on the `tel:` **value** (not a class),
and call-connect conversions reach Google Ads via the forwarding-number + call-duration
criteria. So the `ty-call-btn` class is **not** a mis-fire risk and needs no change — the
new organic line `1-239-456-9476` is tracked by its forwarding-number setup.

### Copy alignment (resolved)
step-3 headline and button now read **"…send your reference number…"** and **"Get My
Reference Number"** on **both apply/0 and apply/3**, matching the "Reference Number"
thank-you. (`genApprovalCode()` stays defined but unused — remove on a cleanup pass.)

### Dead code
`genApprovalCode()` is still defined in step-3 but no longer called (the thank-you
generates its own reference number). Harmless; remove on a cleanup pass.

## GTM action (owner, not code)
Make sure the **"Completed funnel" call-conversion trigger also fires on
`/apply/0/thank-you/`**. If it's pinned to `/apply/2|3/thank-you/`, add `/apply/0/`
or loosen it to "contains thank-you". Code alone can't move a conversion.

## Sitewide change shipped alongside this funnel
The **"Find Assistance"** CTA (nav button + footer link) was repointed
`/apply/2` → `/apply/0` across all main-site pages via an idempotent script.
**Only the two "Find Assistance" link strings were changed.** These CTAs were
deliberately left on `/apply/2` (repoint later, with testing, if desired):
- `Apply for Access Code` (×50)
- `Find Programs Near Me` (×20)
- `Find My County` (×10)
- `Apply Now` (×3)

## Cleanup / orphaned files to review later (unrelated to this task)
Two untracked files sit in the repo root and were **left untouched**:
- `MARKETING-PARTNERS-README.md`
- `OFFERS-README.md`

## Also changed on this branch (not just apply/0)
- **apply/3 (LIVE variant):** its `thank-you/` was conformed to apply/2's design, a new
  `apply/3/thank-you-2/` fallback was added, and step-3 was CRM-gated — same as apply/0.
  This changes apply/3's live behavior (review in preview before going live).
- **Sitewide "Find Assistance"** repoint (see above).
- **apply/2 was NOT modified** (its thank-you is the canonical source).

## Rollback
apply/0 is additive (its own folder incl. `thank-you-2/`, no `vercel.json` entry). To
revert apply/0: delete `apply/0/` and re-point the two "Find Assistance" strings back to
`/apply/2`. To revert the apply/3 changes: `git checkout main -- nationalbenefitalliance/apply/3`.
