# Meta (Facebook / Instagram) funnel: `info/fb01`

> **Live lines since 2026-10-21** (issued by Caliber). Ready for Meta traffic.

Meta advertising moved in-house (Caliber spec, 2026-10-19). `info/fb01` is the Meta copy of the
Google funnel `info/02`, with its own phone lines so Caliber can credit Meta calls by number.
It is **generated** by `_build_source_funnels.py`. Do not hand-edit it; change the script and re-run.

**Point Meta ads at:** `https://www.nationalbenefitalliance.com/info/fb01/`

## Tracking

| Item | Where |
|---|---|
| Meta pixel `1845920986763887` (dataset owner Intercom Media LLC) | GTM `GTM-MTQ5WNFR`, Custom HTML, All Pages. **PageView only.** No page code. |
| Lead / Purchase events | Sent **server-side by Caliber** with the real payout. Never add them in the browser or GTM: they would double-count. |
| Ad ids `mcpid` `masid` `madid` `mplc` | Captured from the click URL by `captureUTM()` on every funnel (not only fb01), posted only when present. |
| Match keys `fbp` `fbc` | Read from the `_fbp` / `_fbc` cookies at submit. If an ad blocker stopped the pixel, `fbc` is built from the fbclid as `fb.1.<landing time ms>.<fbclid>` (Meta's format). |
| `client_ip`, `user_agent` | Added by `submit-lead` (the post to Caliber comes from our server). |

Not stored in Supabase `leads` (owner decision, 2026-10-19); Caliber only. The full landing URL
still goes to Caliber as `attribution.landing_page`, so every id is recoverable from it.

**Click URL every Meta ad must carry:**

```
?utm_source=meta&utm_medium=paid&utm_campaign=…&utm_content=…&utm_term=…
&mcpid={{campaign.id}}&masid={{adset.id}}&madid={{ad.id}}&mplc={{placement}}
```

(Meta appends `fbclid` itself.)

## Phone lines

| Stage | Pages | Number |
|---|---|---|
| Funnel (started) | landing, steps 1–4, `thank-you-2` | `1-645-228-6234` (`tel:+16452286234`) |
| Thank-you (completed) | `thank-you` | `1-321-248-1468` (`tel:+13212481468`) |
| Popup | `info/fb01/popup.js` | `1-239-496-2944` (`tel:+12394962944`) |

**To change a line:** edit the `fb01` entry in `_build_source_funnels.py` and run
`python3 _build_source_funnels.py fb01`. A code change alone does not move call tracking: Caliber
must route the new number too.
