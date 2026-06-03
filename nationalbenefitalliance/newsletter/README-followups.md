# Newsletter page — follow-ups & cleanup notes

Tracks open items for `/newsletter/`. None block the page from working today.
Delete items as they're resolved. Built on branch `newsletter-signup-page`
(not merged to `main`).

## Files added / changed by this task
- `nationalbenefitalliance/newsletter/index.html` — the page (self-contained; standard NBA nav/footer/GTM). Form POSTs to `/api/newsletter`.
- `nationalbenefitalliance/api/newsletter.js` — serverless function; validates and inserts into Supabase `newsletter_signups`.
- `nationalbenefitalliance/images/newsletter-hero.jpg` — hero photo (1800×1200, EXIF/copyright stripped on copy).
- `nationalbenefitalliance/index.html` — added one footer link (`Newsletter`) in the Resources column, beneath Senior Services.
- Supabase (project `quhxbgsgtfvrasyjvaba`): new table `public.newsletter_signups` (RLS on, no public policies — service-role only). Migration: `create_newsletter_signups`.

## ⚠️ REQUIRED before signups actually save (one manual step)
The function needs two env vars set in **Vercel** (Project → Settings → Environment Variables):
- `SUPABASE_URL` = `https://quhxbgsgtfvrasyjvaba.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = the project's service_role key (Supabase → Project Settings → API). Keep it secret; server-side only.

Until these are set, the function runs in **demo mode**: the form works and shows
the thank-you, but returns `{stored:false}` and **no data is saved**. The page
never shows an error to the user either way.

## Open items
1. **Set the Vercel env vars above** — the only thing standing between "form works" and "signups land in the database."
2. **The "free guide" is still a promise, not a deliverable.** No ebook/PDF exists and no email is sent on signup. Either produce a PDF + add an email send (the table + function are the place to trigger it), or keep the copy as newsletter-updates-only.
3. **Hero image is a licensed Shutterstock asset** (pikselstock). Proceeding on owner's statement that we have rights — keep proof of license on record.
4. **Footer link is on the homepage only.** The 7 stories pages share the *identical* footer block (homepage + stories are the only 8 pages with the "Senior Services" Resources column); they were intentionally left out per instruction. Easy to extend with a one-line script if desired. The ~3,200 county pages and the about/state/resource pages use *different* footers with no matching Resources column.
5. **Not in the sitemap, not in the main nav.** Add to `sitemap-main.xml` / nav if you want it indexed/promoted. Left out for now.
6. **No de-duplication.** Re-submitting the same email creates another row (there's a `lower(email)` index but no unique constraint). Add an upsert later if dedup matters.

## Things intentionally NOT done (and why)
- No new `tel:` links (CLAUDE.md ad-tracking rule). Page uses the existing main-site number `1-800-605-8906` in the standard nav/footer only.
- No green CTAs — Submit uses brand amber (`--gold`), per CLAUDE.md.
- No edits to existing pages other than the single homepage footer line; the apply funnel, other APIs, redirects, and `vercel.json` are untouched.
- Newsletter data is stored in its **own** table, separate from funnel `leads`, so it never mixes with CRM/lead reporting.
