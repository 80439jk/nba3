# ORPHANS — docs and stray items

Found during the CLAUDE.md trim (Sep 2026). **Nothing here was deleted or changed.**
Review each item before you remove or fix it. See also `ORPHANS-pipeline.md` and
`ORPHANS-hours.md`.

| Item | Status | Action |
|---|---|---|
| `1-844-603-6674` (`tel:+18446036674`) on `nationalbenefitalliance/clicktrk/index.html` | Undocumented | Find out what this line is for. If it is live, add it to the CLAUDE.md phone table and confirm its GTM / Google Ads conversion. If not, remove it. |
| `_build_apply4_variant.py` (repo root) | Probably dead | It builds `apply/4`, which moved to `info/01`. Confirm nothing uses it, then delete it. |
| `HOURS.md` | Out of date | It lists `apply/3` and `apply/4` as live funnels. `apply/3` is retired; `apply/4` is now `info/01`. It does not list `info/01` or `info/yt1`. Check that `_set_hours.py` covers `info/`. |
| `DECISIONS.md`, "Validation parity" | Out of date | It asks for validator parity on `/apply/2` and `/apply/3`. `/apply/3` is retired. The live funnels are `apply/0`, `apply/2`, `apply/bg1`, `apply/oa1`, `info/01`, `info/yt1`. |
| Branch `docs-claudemd-dualcrm-sync` | Not merged | Older CLAUDE.md backend update. This branch replaces that section with a link to `DECISIONS.md`. Delete the branch. |
| Branch `docs-funnel-playbook` (`FUNNEL-PLAYBOOK.md`, 706 lines) | Not merged | Decide: merge (and link it from CLAUDE.md) or delete. |
| PR #39 `field-parity-audit` (`FIELD-PARITY.md`) | Open | Decide: merge or close. |
| `nationalbenefitalliance/backend/` | Not deployed | Old Express + Postgres server. `api/send-pdf.js` and `backend/routes/*` still quote old hours (see `ORPHANS-hours.md`). Decide: keep or delete. |
| `nationalbenefitalliance/apply/` (all of it) | **Deleted 2026-10-02** | Every `/apply` URL now 308s to `/info/`. Resolved. |
| `info/yt1/` vs `_build_yt1_variant.py` | **Fixed 2026-10-02** | PR #53 re-added a duplicate `footer__disclaimer--gov` paragraph to info/02 + info/00 (and bg1/oa1 inherited it), undoing #51. Duplicate removed; yt1 was already correct and now regenerates byte-identical. |
| `/apply/3` in code comments | Cosmetic | `step-4-contact` in info/02, bg1, oa1, yt1 and two info/01 pages mention the retired `/apply/3` in a JS comment. Not a link. Fix in info/02 and regenerate once the yt1 drift is settled. |
| `_field_parity.py` | Stale | Its file list points at the deleted `apply/0`, `apply/2`, `apply/bg1`, `apply/oa1`. It skips missing files, so it does nothing now. Update its list to the `info/` funnels before using it again. |
| `_build_info02_variant.py`, `_build_info00_variant.py`, `_build_apply4_variant.py`, `_repoint_apply0_to_info00.py`, `_repoint_apply2_to_apply0.py`, `_retext_apply_ctas.py` | Dead one-offs | They read from the deleted `apply/` folders. They can't run again. Delete them. |
| `apply.nationalbenefitalliance.com` in `DEPLOYMENT.md` and `backend/` | Third party | That subdomain is another party's social funnel. Left alone on purpose. |
| `info/01/README.md`, `info/02/README.md`, `info/00/README.md` | History | They describe the move from `/apply/` as steps to do. Those steps are done. |

## Removed from CLAUDE.md (still true, kept here for reference)

- Attribution uses the `_gcl_aw` cookie (90 days), so clearing `sessionStorage` between steps does not break it.
- Claude's output filter can block rewriting large HTML files in one reply. This is one more reason to use a Python script for sitewide edits.
- Design details (navy/amber hex values, card radius and shadow, progress bar) are in `css/styles.css` and in the inline CSS of each funnel page.
