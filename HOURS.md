# Call-availability hours — how to change them (no coding needed)

The text next to the phone/call buttons that tells visitors when they can call
(e.g. **"Mon-Fri 9-6 ET"**, or **"Available 24/7"**) is controlled from **one
place**: the script [`_set_hours.py`](_set_hours.py).

This is **not** a git "revert." It's a forward change — so any other work done on
the site in between is fully preserved. You can switch the hours as many times as
you want, to any wording.

---

## To change the hours

1. Open `_set_hours.py`.
2. Find this line near the top and change the text in the quotes:

   ```python
   SET_TO = "Mon-Fri 9-6 ET"
   ```

   For example, to go 24/7:

   ```python
   SET_TO = "Available 24/7"
   ```

3. In a terminal, from the `NBA` folder, run:

   ```bash
   python3 _set_hours.py
   ```

   It prints how many captions it changed.
4. Preview the site, then commit & push (or ask Claude to).

That's the whole process — no list to maintain. Running the script twice does
nothing the second time.

---

## Why it's safe (important)

Every county page already contains the words **"Available 24/7"** in a status
badge (`✅ Available 24/7 — Free, confidential…`). To avoid ever disturbing that
(or any other page text), the script does **not** search for hours by their words.
It finds each caption only by its **surrounding HTML markup** — specific wrapper
classes (`header__phone-hours`, `hero-phone-card__hours`, `phone-cta__card-hours`,
`bottom-cta__hours`, `hero__callnow-btn-hours`) and one specific footer `<p>`.
So no matter what you set `SET_TO` to — even "Available 24/7" — it only ever
rewrites the real phone-hours captions.

## What it changes (and what it doesn't)

**Changes** the availability caption on:
- All live funnels: `apply/0`, `apply/2`, `apply/3`, `apply/4`, `apply/bg1`, `apply/oa1`
- Core site pages: homepage, about, all stories, resources, privacy, terms,
  newsletter, marketing-partners, clicktrk, Offer03, Offer05

**Never touches:**
- The phone numbers or `tel:` links themselves (attribution untouched)
- GTM tags, the `ty-call-btn` class, or any tracking
- The ~3,200 state/county pages (their "Available 24/7" badges stay put)
- The dead `apply/1` funnel (CLAUDE.md says don't modify it — the script skips it)
- The PDF-email/backend hours (a different surface — see `ORPHANS-hours.md`)

---

## Current value

**Live captions are now unified at `Mon-Fri 9-6 ET`** across funnels and core
pages. (Previously the core pages showed a different, more generous window,
`Mon–Thu 9:30am–8pm · Fri 9:30am–6pm ET`; this run corrected them to match the
funnels.)

**To go 24/7 when you're ready:** set `SET_TO = "Available 24/7"` and run the
script (steps above).
