#!/usr/bin/env python3
"""
Repoint the last main-site CTAs from /apply/2 to /apply/0 (idempotent).

When `apply/0` was created as the organic clone, the sitewide link pass missed a
set of CTAs. 83 links across 61 main-site pages still send organic visitors into
`/apply/2`, the paid Google funnel. The apply/0 README already flagged these by
their anchor text: "Apply for Access Code", "Find Programs Near Me",
"Find My County" and "Apply Now".

This matters for 10DLC. A carrier agent reviewing the campaign follows the public
site to the form that collects the telephone number. Organic paths must land on
`/apply/0`, the funnel whose consent checkbox is optional and unchecked by default.

Scope: HTML files OUTSIDE `apply/` and `info/`. The funnel trees keep their own
navigation -- `/apply/2/step-1-dob-citizen/` must still go Back to `/apply/2/`.

Replacement (the dominant link form sitewide; 6,444 links already use it):
  href="/apply/2"  ->  href="/apply/0"

Deliberately NOT replaced:
  href="/apply/2/"            -- an internal Back link inside apply/2
  href="/apply/2/step-*/"     -- internal funnel navigation

Paid traffic is unaffected: ad destinations point at `/apply/2` directly and do
not pass through a main-site link.

Usage:
    python3 _repoint_apply2_to_apply0.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", ".vercel", ".next", "out", "dist"}
EXCLUDED_TREES = {"apply", "info"}  # spare the funnels' own navigation

# No trailing slash, so internal /apply/2/ and /apply/2/step-*/ links never match.
LINK_RE = re.compile(r'href="/apply/2"')


def update_file(path: Path) -> int:
    src = path.read_text(encoding="utf-8")
    new_src, n = LINK_RE.subn('href="/apply/0"', src)
    if n:
        path.write_text(new_src, encoding="utf-8")
    return n


def main() -> int:
    site_root = Path(__file__).resolve().parent / "nationalbenefitalliance"
    files_changed = 0
    total_changes = 0

    for path in sorted(site_root.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        rel = path.relative_to(site_root)
        if rel.parts and rel.parts[0] in EXCLUDED_TREES:
            continue
        n = update_file(path)
        if n:
            files_changed += 1
            total_changes += n

    print(f"Files modified: {files_changed}")
    print(f"Total href rewrites: {total_changes}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
