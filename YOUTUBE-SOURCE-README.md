# YouTube Source Funnel — `info/yt1`

A standalone clone of the live Google funnel (`apply/2`) for **YouTube** paid traffic. It exists so
YouTube calls can be counted on their **own phone line**, without a change to the Google funnel or to
any Google / GTM / GFN tracking.

**Branch:** `youtube-source-funnel-yt1` · **Point YouTube ads at:** `https://nba3.vercel.app/info/yt1/`
(or the custom domain `/info/yt1/`)

---

## What was built

| Item | Detail |
|---|---|
| **Funnel** | `info/yt1/` — 7 pages (landing, steps 1–4, `thank-you`, `thank-you-2`). Internal navigation stays inside `/info/yt1/`. |
| **Phone line** | **One number for every stage** — `1-888-312-1358` / `tel:+18883121358`. This is the `apply/oa1` pattern, not the 3-way `apply/bg1` split. |
| **Tracking** | **No inline pixel, no conversion script.** YouTube runs through Google Ads, and GTM (`GTM-MTQ5WNFR`) is already on all 7 pages. Owner action is needed — see below. |
| **Popup** | Dedicated `info/yt1/popup.js` — a copy of `apply/popup.js` with only the phone number changed. |
| **Backend** | Step 4 posts `landing_page: 'yt1'`. All other fields are unchanged, so field parity with the other funnels holds. |
| **Build** | `_build_yt1_variant.py` at the repo root. Idempotent. |

### Phone number mapping

| Funnel stage | Pages | YouTube number | `tel:` href | Was (apply/2) |
|---|---|---|---|---|
| **Funnel** (started) | landing + steps 1–4 | `1-888-312-1358` | `tel:+18883121358` | `1-813-556-9954` |
| **ThankYou** (completed) | `thank-you` (CRM accepted) | `1-888-312-1358` | `tel:+18883121358` | `1-813-560-8063` |
| **Fallback** | `thank-you-2` (CRM not accepted) | `1-888-312-1358` | `tel:+18883121358` | `1-813-556-9954` |
| **Popup** | `info/yt1/popup.js` inactivity overlay | `1-888-312-1358` | `tel:+18883121358` | `1-813-556-9953` |

> **Why one number, and why the fallback too.** Every visitor on this URL came from YouTube. If any
> page kept an `apply/2` number, that call would fire a **Google** call conversion, and Google Ads
> would credit a YouTube call to a search campaign. One line on all four surfaces prevents this.
>
> **Trade-off:** you will know a call came from YouTube, but not how far the caller got in the funnel.
> `apply/bg1` keeps that stage detail. To add it here later, supply two more numbers and edit
> `_build_yt1_variant.py`.

### Why `/info/` and not `/apply/`

Ad-landing URLs must avoid the words "apply" and "qualify". This is the same rule that moved the lean
variant from `/apply/4/` to `/info/01/`. The older source clones (`apply/bg1`, `apply/oa1`) predate
the rule and stay where they are.

No `vercel.json` change was needed. Vercel serves the static folder directly, the same way
`/info/01/` is served.

---

## Owner action required — GTM and Google Ads

There is **no tracking code in the pages**. Do all three steps, or YouTube calls will not be counted.

1. **Create a Google Ads Call Conversion action** for the new line `+1 888-312-1358`.
2. **Add a GTM tag** in `GTM-MTQ5WNFR` that maps a click on `tel:+18883121358` to that conversion
   label. Scope the trigger to the `tel:` value or to the `/info/yt1/` path, so YouTube calls stay
   separate from Google-funnel calls.
3. **Check the existing "Completed funnel" trigger.** If it matches the path `/apply/2/thank-you/`,
   it will **not** fire on `/info/yt1/thank-you/`. Add the new path. This is the same trap noted for
   `/info/01/`.

Then run **one test lead** end to end and confirm it appears in Supabase with `landing_page = 'yt1'`.

**Google Forwarding Number (GFN).** If the YouTube campaign has call reporting on, Google may swap
the displayed number. The hardcoded `1-888-312-1358` is the fallback. This is normal and matches how
`apply/2` behaves today.

---

## What was inherited, byte for byte

Nothing structural was changed, so the clone keeps all of this from `apply/2`:

- `noindex, nofollow` on all 7 pages, and no entry in any sitemap
- The GTM container snippet and every `dataLayer` push
- The TCPA consent checkbox (`#tcpaConsent`, `required`) — a real checkbox, never a hardcoded `true`
- Bot detection: the honeypot `hp_website` and the time-trap `form_duration_ms`
- TrustedForm
- `captureUTM()`, all click IDs (`gclid`, `wbraid`, `gbraid`, `msclkid`, and the rest) and the
  `transaction_id`
- Plain `tel:` anchors with no `onclick` and no `preventDefault`
- The `ty-call-btn` class on the thank-you button

---

## Maintenance notes — read before you change anything

### `info/yt1/` is GENERATED. Do not hand-edit it.

`_build_yt1_variant.py` deletes and rebuilds the whole directory from `apply/2` on each run. A manual
edit will be lost. To change the clone, edit the script, then run:

```bash
python3 _build_yt1_variant.py
```

The script fails loudly if `apply/2` changes shape (an anchor stops matching), or if any `apply/2`
string survives into the output.

### The popup now has FOUR divergent copies

`apply/popup.js` (shared), `apply/oa1/popup.js`, `apply/bg1/popup.js`, and now `info/yt1/popup.js`.
Only the phone number differs. A change to popup **behavior** must be mirrored into all four, and
into the UtilityBenefits sibling `qualify/popup.js`. Canonical behavior: 30-second inactivity delay,
once per session, re-pops 30 seconds after close, reads `#refNumber` on the thank-you page.

### Clean-up candidates

| Item | Why it is worth a look |
|---|---|
| Four popup forks | The only difference is two string constants. One shared `popup.js` that reads the number from a `data-` attribute on its own `<script>` tag would remove three files. This is a behavior change to a tracked asset, so it needs owner sign-off. |
| `info/yt1/thank-you-2/` | Reachable only when the CRM rejects the lead. Low traffic, easy to forget in a future edit. |
| Divergent clone conventions | `apply/oa1` uses one number, `apply/bg1` uses three, `info/yt1` uses one. There is no single rule. Pick one before the next clone. |
| Clone location split | Source clones sit in two places now: `apply/0`, `apply/bg1`, `apply/oa1` under `/apply/`, and `info/yt1` under `/info/`. Consider moving the old ones behind 308 redirects. |
| `landing_page` values | `apply0`, `apply2`, `bg1`, `oa1`, `info01`, `yt1`. Free text with no shared list. A typo would fail silently and lose attribution. |
