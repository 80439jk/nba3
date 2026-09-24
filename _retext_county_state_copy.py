#!/usr/bin/env python3
"""
County + state pages: replace NBA's own "Free Benefits & Resources" framing
with "Community Resources", and add the government disclosure to the footer.

WHY ONLY THESE STRINGS
----------------------
County pages are a factual directory of real government programs. "How to
Apply" means apply with SNAP; "Application Period", "Who Qualifies", the FPL
thresholds and 1-800-SNAP all describe the agency's program and send the reader
to the agency. That is the referral posture the policy rewards, so it stays.

What does NOT stay is the handful of strings written in National Benefit
Alliance's own voice, where "Free Benefits" reads as something we provide.
Those are the six county strings and one state string below. Owner approved
this split 2026-09-24.

Meta descriptions are deliberately untouched: they describe the directory's
contents ("LIHEAP utility help ... Eligibility details, documents needed, how
to apply"), not an offer from us.

SCOPE
-----
The 50 state hubs and their 3,171 county children — derived from the filesystem,
not hardcoded, so new counties are picked up automatically. Every other page on
the site is left alone, including /resources/, which has topic children and
otherwise looks like a state hub.

Note: there is no District of Columbia directory, although the funnel's state
dropdown offers it. Pre-existing gap, not introduced here.

IDEMPOTENT
----------
Literal swaps, skipped when absent; the footer insert is skipped when the page
already carries it. A second run reports 0 changed files.

Usage:  python3 _retext_county_state_copy.py [--dry-run]
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "nationalbenefitalliance"


# Ordered. No `old` is a substring of another `old`, and no `new` reintroduces
# an earlier `old`, so one pass is enough.
COUNTY_SWAPS = [
    # C5 schema.org itemList name. Longer anchor first.
    ("Free Benefits &amp; Resource Categories", "Community Resource Categories"),
    # C1 the <h1>
    ("Free Benefits &amp; Resources", "Community Resources"),
    # C2 <title> and C3 og:title
    ("Benefits &amp; Resources | Community Assistance",
     "Community Resources | Local Programs"),
    # C4 twitter:title
    ("Benefits &amp; Resources | National Benefit Alliance",
     "Community Resources | National Benefit Alliance"),
    # C6 the FAQ heading: "...About <County> Benefits</h2>"
    (" Benefits</h2>", " Resources</h2>"),
]

# S1. Covers every state-title variant: "by County", "by Counties",
# "by Parishes" (LA), "by Borough" (AK).
STATE_SWAPS = [
    ("Free Benefits by ", "Local Programs by "),
]

# Footer government disclosure. Goes immediately above the existing © line.
# Plain text, not a link — consistent with the funnels.
FOOTER_ANCHOR = '<p class="footer__disclaimer">© 2026'
FOOTER_DISCLOSURE = (
    '<p class="footer__disclaimer footer__disclaimer--gov">'
    "National Benefit Alliance is a private company. We are not a government agency, "
    "and we do not apply for or enroll you in SNAP, LIHEAP, Section 8 or rental assistance. "
    "Looking for a government program? Apply directly at usa.gov/benefits or call 211."
    "</p>\n        "
)
FOOTER_MARKER = "footer__disclaimer--gov"


# /resources/ has topic children (childcare, food-assistance, ...) and matches a
# naive "has an index and subdirs with indexes" test. It is not a state.
NOT_A_STATE = {"resources", "stories", "about", "prototype", "apply", "info"}

# A state hub carries this in its <title>, before or after this script runs.
# Matching on both keeps the scope identical on a second run.
STATE_MARKERS = ("Free Benefits by ", "Local Programs by ")


def find_pages():
    """(state_pages, county_pages) derived from the tree, not hardcoded."""
    states, counties = [], []
    for d in sorted(SITE.iterdir()):
        if not d.is_dir() or d.name in NOT_A_STATE:
            continue
        hub = d / "index.html"
        if not hub.exists():
            continue
        kids = [s / "index.html" for s in sorted(d.iterdir())
                if s.is_dir() and (s / "index.html").exists()]
        if not kids:
            continue
        title = hub.read_text(encoding="utf-8", errors="ignore")
        if not any(m in title for m in STATE_MARKERS):
            continue
        states.append(hub)
        counties.extend(kids)
    return states, counties


def main():
    dry = "--dry-run" in sys.argv
    states, counties = find_pages()
    print(f"  {len(states)} state pages, {len(counties)} county pages\n")

    tally = {old: 0 for old, _ in COUNTY_SWAPS + STATE_SWAPS}
    tally["footer disclosure"] = 0
    changed = 0

    for path, swaps in [(p, STATE_SWAPS) for p in states] + \
                       [(p, COUNTY_SWAPS) for p in counties]:
        text = path.read_text(encoding="utf-8")
        original = text

        for old, new in swaps:
            if old in text:
                tally[old] += text.count(old)
                text = text.replace(old, new)

        if FOOTER_MARKER not in text and FOOTER_ANCHOR in text:
            text = text.replace(FOOTER_ANCHOR, FOOTER_DISCLOSURE + FOOTER_ANCHOR, 1)
            tally["footer disclosure"] += 1

        if text != original:
            changed += 1
            if not dry:
                path.write_text(text, encoding="utf-8")

    print(f"  {'would change' if dry else 'changed':<13} {changed} files\n")
    for k, n in tally.items():
        label = k if len(k) < 46 else k[:43] + "..."
        print(f"    {label:<46} {n}")

    # Pages that should have gained the disclosure but did not.
    missing = [p for p in states + counties
               if FOOTER_MARKER not in p.read_text(encoding="utf-8")]
    if missing and not dry:
        print(f"\n  !! {len(missing)} page(s) did not get the footer disclosure:")
        for p in missing[:10]:
            print(f"       {p.relative_to(SITE)}")


if __name__ == "__main__":
    main()
