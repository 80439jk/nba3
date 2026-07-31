# OpenAI PPC Funnel — `apply/oa1`

A dedicated, standalone clone of the live Google funnel (`apply/2`) built for OpenAI paid traffic. It exists so OpenAI can be tracked with its **own phone line + its own pixel** without touching the Google funnel or any Google/GTM/GFN tracking.

**Branch:** `openai-ppc-funnel-oa1` · **Point OpenAI ads at:** `https://nba3.vercel.app/apply/oa1/` (or the custom domain `/apply/oa1/`)

---

## What was built

| Item | Detail |
|---|---|
| **Funnel** | `apply/oa1/` — clone of `apply/2` (7 pages: landing, 4 steps, 2 thank-you pages). Internal nav rewritten to stay inside `/apply/oa1/`. Inherits `noindex, nofollow`. |
| **Phone line** | **`1-239-456-9477`** (`tel:+12394569477`) on **every** funnel call button — header pill, hero/step CTAs, thank-you "Call Now", and the popup. |
| **OpenAI Pixel** | Vendor snippet installed verbatim in `<head>` of all 7 pages. Pixel id `QGuEefUgZBP6rpS45mJE5u`. `debug:true` (see note). |
| **Conversion event** | Fires `registration_completed` (`type: customer_action`) on any click of the OpenAI call button. Lives in `apply/oa1/oa-track.js`. Passive listener — the call dials normally. |
| **Popup** | Dedicated `apply/oa1/popup.js` (copy of the shared popup, phone number → OpenAI line). |

## What was deliberately NOT changed

- **`apply/2` (the Google funnel)** — zero changes. Same for the shared `apply/popup.js`, GTM, `gclid`/`_gcl_aw`, and Google Forwarding Number.
- **Footer main-site line `1-800-605-8906`** — left as-is inside `apply/oa1` (per decision: it's the general brand line and rarely used from the funnel).

---

## ⚠️ Owner action items / things to verify

1. **`debug:true` in the pixel.** Left exactly as OpenAI provided it. It only makes the OpenAI SDK log its activity to the browser console — harmless, and useful for verifying fires on the preview. Flip to `false` later only if you want a quiet console; no rush.
2. **Confirm OpenAI conversion setup.** We're firing the standard `registration_completed` event on call-button clicks (custom events aren't optimizable per your note). Confirm inside OpenAI's ads UI that this event is being received and set as your optimization/conversion goal. **(This is the "revisit tracking/GTM" item we parked — GTM assertions were intentionally left out of this doc.)**
3. **CallTools routing.** Make sure `+12394569477` is set up in CallTools on its own inbound route (routed like the Google lines, but separately identifiable) so OpenAI calls are distinguishable.
4. **Vercel preview is behind the login wall.** To share/open a public preview link you (the account owner) may need to toggle Deployment Protection for this deployment.

---

## Maintenance notes (for whoever touches this next)

- **`apply/oa1` is a CLONE.** Any future change to the live funnel (`apply/2`) — copy, steps, styling, form fields — must be **mirrored into `apply/oa1`**, and vice-versa. There is no shared template.
- **`apply/oa1/popup.js` is a number-only fork** of the shared `apply/popup.js` (which itself must stay in sync with the UtilityBenefits `qualify/popup.js`). If popup *behavior* changes anywhere, mirror it into this fork too.
- **Precedent:** `apply/0` is the pre-existing *organic* clone using line `1-239-456-9476` (the number right before the OpenAI one). Same "clone + dedicated line" pattern — except `apply/0` reuses the shared popup, whereas `apply/oa1` has its own.
- The clone-with-substitution rule for future source funnels is documented in `CLAUDE.md` → *Source-specific funnel clones*.

## Files added on this branch

```
nationalbenefitalliance/apply/oa1/                 (new funnel — 7 html pages)
nationalbenefitalliance/apply/oa1/popup.js         (dedicated popup, OpenAI number)
nationalbenefitalliance/apply/oa1/oa-track.js      (conversion-event listener)
OPENAI-SOURCE-README.md                            (this file)
CLAUDE.md                                           (updated: Source-specific funnel clones)
```
