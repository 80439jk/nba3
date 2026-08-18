#!/usr/bin/env python3
"""
_set_hours.py  —  SINGLE SOURCE OF TRUTH for the call-availability caption
                  shown next to phone / call links across the NBA site.

WHY THIS EXISTS
    The site has no template, so the "hours" caption ("Mon-Fri 9-6 ET", etc.)
    is baked into ~40 pages. This script lets you set that caption to ANY value
    (24/7, business hours, or brand-new hours) from ONE place, whenever you want.
    It is a forward text-change, NOT a git "revert" — so every other change made
    to the site in the meantime is preserved.

HOW IT STAYS SAFE
    The script finds each hours caption ONLY by its surrounding HTML markup
    (specific wrapper classes / a specific footer <p>), never by its text. So it
    physically cannot touch ordinary page content — e.g. the "✅ Available 24/7"
    status badges that appear on every county page are left completely alone,
    even if you set SET_TO to "Available 24/7".

HOW TO CHANGE HOURS  (see HOURS.md for the plain-English version)
    1. Change SET_TO below to the exact text you want visitors to see.
    2. Run:   python3 _set_hours.py
    3. Preview locally, then commit & push.

    That's the whole process. Running it twice does nothing the second time.
"""

import os
import re
import sys

# ─────────────────────────────────────────────────────────────────────────────
#  EDIT THIS ONE LINE to change the availability caption everywhere:
SET_TO = "Available 24/7"
# ─────────────────────────────────────────────────────────────────────────────

# The folder Vercel serves, relative to this script.
SITE = "nationalbenefitalliance"

# Hours captions are located ONLY by these markup anchors — never by their text.
# Each is an element whose class marks it as an hours caption.
HOURS_CLASSES = [
    "header__phone-hours",      # funnel header phone pill
    "hero__callnow-btn-hours",  # funnel hero "call now" button
    "hero-phone-card__hours",   # about page hero phone card
    "phone-cta__card-hours",    # about page phone CTA card
    "bottom-cta__hours",        # about page bottom CTA
]

# The homepage / stories / clicktrk footer hours sit in a class-less <p> carrying
# this exact inline style. It is unique to the hours line and absent from county
# pages, so it is a safe anchor too.
FOOTER_P_STYLE = "font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:0.5rem;"

# Dirs we never descend into.
SKIP_DIRS = {".git", "node_modules"}

# Paths (relative to SITE) we deliberately never modify:
#   apply/1 — dead legacy funnel, 308-redirected, kept as a rollback path.
#   CLAUDE.md is explicit: "do not modify it."
SKIP_SUBPATHS = {os.path.join("apply", "1")}


def build_patterns():
    """One regex per anchor. Each captures the caption's opening tag, its inner
    text, and its closing tag as named groups open / inner / close."""
    pats = []
    for cls in HOURS_CLASSES:
        # <span|div|p ... class="... CLS ..." ...>INNER</span|div|p>
        # lookbehind/ahead make sure we match the whole class token, not a prefix.
        pats.append(
            re.compile(
                r'(?P<open><(?P<tag>span|div|p)\b[^>]*\bclass="[^"]*(?<![-\w])'
                + re.escape(cls)
                + r'(?![-\w])[^"]*"[^>]*>)(?P<inner>.*?)(?P<close></(?P=tag)>)',
                re.DOTALL,
            )
        )
    # <p style="EXACT FOOTER STYLE">INNER</p>
    pats.append(
        re.compile(
            r'(?P<open><p\b[^>]*\bstyle="'
            + re.escape(FOOTER_P_STYLE)
            + r'"[^>]*>)(?P<inner>.*?)(?P<close></p>)',
            re.DOTALL,
        )
    )
    return pats


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.join(here, SITE)
    if not os.path.isdir(root):
        sys.exit(f"ERROR: cannot find site folder at {root}")

    patterns = build_patterns()

    changed_files = 0
    total_hits = 0
    touched = []

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        rel = os.path.relpath(dirpath, root)
        if any(rel == p or rel.startswith(p + os.sep) for p in SKIP_SUBPATHS):
            dirnames[:] = []  # don't descend into skipped subtree
            continue
        for name in filenames:
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            hits = [0]

            def repl(m):
                # Only counts as a change if the inner text actually differs.
                if m.group("inner") != SET_TO:
                    hits[0] += 1
                return m.group("open") + SET_TO + m.group("close")

            new = content
            for pat in patterns:
                new = pat.sub(repl, new)

            if new != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
                changed_files += 1
                total_hits += hits[0]
                touched.append((os.path.relpath(path, here), hits[0]))

    print(f'Set availability caption to: "{SET_TO}"')
    print(f"Files changed: {changed_files}   Captions rewritten: {total_hits}")
    if touched:
        print("\nChanged files:")
        for rel, n in sorted(touched):
            print(f"  [{n}] {rel}")
    else:
        print("\nNothing to change — every caption already shows the current SET_TO value.")


if __name__ == "__main__":
    main()
