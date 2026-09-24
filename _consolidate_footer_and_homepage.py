#!/usr/bin/env python3
"""
Two owner-approved changes, 2026-09-24:

1. FOOTER — merge the two disclosure paragraphs into one.
   The government disclosure was added as its own <p> above the copyright
   paragraph, which reads as two separate blocks. The owner supplied a single
   combined paragraph; this removes the standalone <p> and replaces the
   copyright text with the owner's wording, verbatim.

   The Department of Education disclaimer is preserved, folded into the
   affiliation clause as "government agency (including U.S. Department of
   Education)" per the owner's edit.

2. HOMEPAGE — three headings.
   "Find Free Benefits"        -> "Find Free Assistance"
   "How to Access Your Benefits" -> "How It Works"
   "Ready to Find Your Benefits?" -> "Ready to See Your Options?"

SCOPE
-----
The footer change is sitewide: the copyright paragraph is byte-identical on all
3,315 pages, funnels included. info/yt1 is generated from info/02, so
_build_yt1_variant.py is re-run afterwards to prove no drift.

IDEMPOTENT
----------
Literal swaps plus one anchored regex, all skipped when already applied.

Usage:  python3 _consolidate_footer_and_homepage.py [--dry-run]
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "nationalbenefitalliance"
SKIP_DIRS = {"node_modules", ".git"}

# The standalone government-disclosure <p>, in both markup forms it was
# written in (funnels are multi-line, county/state pages single-line).
# Keeps the following paragraph's indentation.
GOV_P = re.compile(
    r'([ \t]*)<p class="footer__disclaimer footer__disclaimer--gov">.*?</p>\n[ \t]*'
    r'(?=<p class="footer__disclaimer">)',
    re.S,
)

OLD_COPYRIGHT = (
    "© 2026 National Benefit Alliance. All rights reserved. National Benefit Alliance "
    "is a privately held for-profit entity and has no affiliation or relationship, "
    "financial or otherwise, with any political party, government agency, or other "
    "outside group or persons. We do not submit any forms or documents on our members' "
    "behalf. All communication with any government, state, or private party will be done "
    "directly with them and all documentation submitted directly to them. Furthermore, "
    "National Benefit Alliance is not affiliated with or endorsed by the U.S. Department "
    "of Education. We urge you not to pay any third party offer for assistance that you "
    "can get for free elsewhere."
)

NEW_COPYRIGHT = (
    "© 2026 National Benefit Alliance. All rights reserved. National Benefit Alliance "
    "is a privately held for-profit entity and is not affiliated with or endorsed by any "
    "political party, government agency (including U.S. Department of Education), or other "
    "outside group or persons. We are not a "
    "government agency and do not apply for or enroll individuals in SNAP, LIHEAP, "
    "Section 8, or rental assistance. We do not submit forms or documents on our members' "
    "behalf; all communications and documentation must be submitted directly to the "
    "applicable agency or entity. If you are looking for a government benefit program, "
    "you can apply directly at USA.gov/benefits or call 211. We urge you not to pay a "
    "third party for assistance that may be free of charge elsewhere."
)

HOMEPAGE_SWAPS = [
    ("Find <span>Free Benefits</span><br/>In Your County",
     "Find <span>Free Assistance</span><br/>In Your County"),
    ('<h2 id="how-heading">How to Access Your Benefits</h2>',
     '<h2 id="how-heading">How It Works</h2>'),
    ('<h2 id="cta-heading">Ready to Find Your Benefits?</h2>',
     '<h2 id="cta-heading">Ready to See Your Options?</h2>'),
]


def main():
    dry = "--dry-run" in sys.argv
    removed = rewritten = changed = 0

    for path in sorted(SITE.rglob("*.html")):
        if set(path.parts) & SKIP_DIRS:
            continue
        text = path.read_text(encoding="utf-8")
        original = text

        new, n = GOV_P.subn(r"\1", text)
        if n:
            text = new
            removed += n

        if OLD_COPYRIGHT in text:
            text = text.replace(OLD_COPYRIGHT, NEW_COPYRIGHT)
            rewritten += 1

        if text != original:
            changed += 1
            if not dry:
                path.write_text(text, encoding="utf-8")

    # Homepage headings
    home = SITE / "index.html"
    text = home.read_text(encoding="utf-8")
    hits = 0
    for old, new in HOMEPAGE_SWAPS:
        if old in text:
            text = text.replace(old, new)
            hits += 1
    if not dry and hits:
        home.write_text(text, encoding="utf-8")

    print(f"  {'would change' if dry else 'changed':<13} {changed} pages")
    print(f"    standalone gov <p> removed   {removed}")
    print(f"    copyright text rewritten     {rewritten}")
    print(f"    homepage headings            {hits}/{len(HOMEPAGE_SWAPS)}")

    leftover = sum(1 for p in SITE.rglob("*.html")
                   if not set(p.parts) & SKIP_DIRS
                   and "footer__disclaimer--gov" in p.read_text(encoding="utf-8"))
    if not dry:
        print(f"    pages still carrying the split block: {leftover}")


if __name__ == "__main__":
    main()
