# Orphans and side issues found during the structured-data rewrite (2026-10-06)

Found while doing branch `nba-schema-publisher-only`. Nothing here was changed. Review each one before acting.

| # | What | Where | Why it matters | Suggested action |
|---|---|---|---|---|
| 1 | Old schema generator | `nationalbenefitalliance/backend/routes/seo.js`, `backend/routes/pages.js` | Not deployed, but still builds the old markup (`GovernmentService`, `GovernmentOrganization`). If anyone reuses it, the old claims come back. | Delete with the rest of `backend/`, or add a note pointing to `_schema_publisher_only.py`. |
| 2 | Internal files served publicly | `nationalbenefitalliance/STATE_PROGRAM_DATA_EXTRACTION.json`, `ENHANCED_TEMPLATE_ANALYSIS.json`, `DEPLOYMENT.md`, `DATA_EXTRACTION_INDEX.md`, `GENERATION_SCRIPT_TEMPLATE.md`, `QUICK_REFERENCE.txt` | Vercel serves the whole folder. These return 200 on www.nationalbenefitalliance.com. The JSON names "GovernmentOrganization" patterns. | Move out of `nationalbenefitalliance/` or block in `vercel.json`. |
| 3 | Canonical host mismatch | Every page's `<link rel="canonical">` and JSON-LD use `https://nationalbenefitalliance.com/`, but that host 307-redirects to `https://www.nationalbenefitalliance.com/` | Canonical URLs that redirect send Google mixed signals. The schema follows the canonical tags, so both should move together. | Decide on one host; make canonicals, sitemaps and schema `url`s match it; make the redirect a 308. |
| 4 | Duplicate Texas county | `texas/de-witt/` and `texas/dewitt/` | Two pages for one county (duplicate content). The Texas hub links both, so it shows 255 "counties" (Texas has 254). | Keep one, 308 the other. |
| 5 | "Call for an access code" copy | `index.html` (FAQ), `prototype/cook-enhanced`, `prototype/redesign-*` (3) | Visible copy says some county guides need a code you get by calling. A reviewer may read it as gating content behind a call. Schema copy of this FAQ was removed in this branch; the visible FAQ is unchanged. | Owner decision on the homepage FAQ wording. |
| 6 | Unbacked "verified" claim for AI engines | `nationalbenefitalliance/llms-full.txt` line 240: "All programs verified with government agencies" | Same problem as spec §5, in plain text. Deferred by owner (spec-author Q7). | Two-line copy edit when approved. |
