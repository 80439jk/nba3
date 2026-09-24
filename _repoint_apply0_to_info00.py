#!/usr/bin/env python3
"""
Repoint every sitewide CTA from /apply/0 to /info/00.

apply/0 is the organic funnel: ~3,200 county pages, every state page, the
stories, the homepage and most footers link to it. This walks the site and
rewrites those hrefs.

Scope
  - Walks nationalbenefitalliance/, *.html only.
  - SKIPS apply/0/ itself — that directory stays on disk, unreachable behind the
    vercel.json 308, so the funnel can be rolled back by deleting the redirect.
  - SKIPS info/00/ — already repointed by _build_info00_variant.py.
  - SKIPS node_modules/ and .git/.

Only href values are touched. The literal string "apply/0" is not rewritten
anywhere else, so prose and comments that mention the old funnel keep saying
apply/0 and stay accurate.

Idempotent: a second run reports 0 changed files.

Usage:  python3 _repoint_apply0_to_info00.py [--dry-run]
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "nationalbenefitalliance"

SKIP_DIRS = {"node_modules", ".git"}
SKIP_PREFIXES = [SITE / "apply" / "0", SITE / "info" / "00"]

# Ordered: the trailing-slash form first so it is not left as "/info/00/" by a
# partial match of the bare form.
SWAPS = [
    ('href="/apply/0/"', 'href="/info/00/"'),
    ('href="/apply/0"', 'href="/info/00"'),
    ('href="/apply/0/step-1-age-zip/"', 'href="/info/00/step-1-age-zip/"'),
    ('href="/apply/0/step-2-name-email/"', 'href="/info/00/step-2-name-email/"'),
    ('href="/apply/0/step-3-phone/"', 'href="/info/00/step-3-phone/"'),
    ('href="/apply/0/thank-you/"', 'href="/info/00/thank-you/"'),
    ('href="/apply/0/thank-you-2/"', 'href="/info/00/thank-you-2/"'),
]


def skipped(path):
    if any(part in SKIP_DIRS for part in path.parts):
        return True
    return any(str(path).startswith(str(p) + "/") for p in SKIP_PREFIXES)


def main():
    dry = "--dry-run" in sys.argv
    if not SITE.exists():
        sys.exit(f"ERROR: site root not found: {SITE}")

    changed = 0
    replacements = 0
    scanned = 0

    for path in sorted(SITE.rglob("*.html")):
        if skipped(path):
            continue
        scanned += 1
        text = path.read_text(encoding="utf-8")
        if "/apply/0" not in text:
            continue
        original = text
        n = 0
        for old, new in SWAPS:
            if old in text:
                n += text.count(old)
                text = text.replace(old, new)
        if text != original:
            changed += 1
            replacements += n
            if not dry:
                path.write_text(text, encoding="utf-8")

    verb = "would change" if dry else "changed"
    print(f"  scanned      {scanned} html files")
    print(f"  {verb:<12} {changed} files")
    print(f"  hrefs        {replacements} rewritten")

    # Anything left is a form this script does not handle — report it loudly.
    leftover = []
    for path in sorted(SITE.rglob("*.html")):
        if skipped(path):
            continue
        if "/apply/0" in path.read_text(encoding="utf-8"):
            leftover.append(path.relative_to(SITE))
    if leftover and not dry:
        print(f"\n  !! {len(leftover)} file(s) still mention /apply/0:")
        for p in leftover[:20]:
            print(f"       {p}")
    elif not dry:
        print("\n  no /apply/0 references remain outside apply/0/ itself ✓")


if __name__ == "__main__":
    main()
