#!/usr/bin/env python3
"""
Add the government disclosure bar to every main-site page.

    Independent private company. Not a government website. Not a government program.

A thin strip above the sticky nav, so it scrolls away like the reference design
and like the funnels' .gov-bar.

THREE THINGS, AND THE THIRD IS NOT OPTIONAL
-------------------------------------------
1. Adds the .gov-bar rule to css/styles.css, using the existing custom
   properties (CLAUDE.md: main site uses tokens, never hardcoded hex).
2. Inserts the <div class="gov-bar"> before the first <nav class="nav"> on
   every main-site page.
3. Bumps the styles.css cache-buster ?v=9 -> ?v=10 on every page.

Step 3 is load-bearing. vercel.json serves /css/* with
"max-age=31536000, immutable", so a returning visitor keeps last year's
stylesheet and would render the new div as unstyled black text across the top
of the page. The ?v=N query string is how this repo has always busted it.

SCOPE
-----
Main-site pages only. Funnel pages under apply/ and info/ have inline CSS and
do not reference styles.css at all — they carry their own .gov-bar already.

prototype/ gets no bar at all — CLAUDE.md lists it as unlinked experiments, and
prototype/utility-assistance has its own inline CSS and never loads styles.css,
so a bar there would render unstyled. Those pages still get the version bump,
which also clears prototype/cook-enhanced's stale ?v=8.

IDEMPOTENT
----------
The CSS rule, the div and the version bump are each skipped when already
present. A second run reports 0 changed files.

Usage:  python3 _add_gov_bar_main_site.py [--dry-run]
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "nationalbenefitalliance"
CSS = SITE / "css" / "styles.css"

SKIP_DIRS = {"apply", "info", "node_modules", ".git"}

# prototype/ is unlinked experiments (CLAUDE.md), so it gets no disclosure bar.
# One of them, prototype/utility-assistance, has its own inline CSS and never
# loads styles.css, so a bar there would render unstyled. Version bumps still
# apply to prototype/ — that also clears cook-enhanced's stale ?v=8.
BAR_SKIP_DIRS = {"prototype"}

NAV_ANCHOR = '<nav class="nav"'
BAR_MARKER = 'class="gov-bar"'
BAR_HTML = (
    '  <!-- GOVERNMENT DISCLOSURE BAR. Do not remove: this is the site-wide\n'
    '       Google Ads govt-services-policy disclosure. Styled in css/styles.css;\n'
    '       bump the ?v= cache-buster if that rule ever changes. -->\n'
    '  <div class="gov-bar">Independent private company. '
    'Not a government website. Not a government program.</div>\n\n  '
)

CSS_MARKER = ".gov-bar {"
CSS_ANCHOR = ".nav {\n"
CSS_RULE = """/* Government disclosure bar — sits above the sticky nav and scrolls away. */
.gov-bar {
  background: var(--navy-dark);
  color: var(--white);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
  text-align: center;
  padding: 0.5rem 1rem;
}
@media (max-width: 480px) {
  .gov-bar { font-size: 0.75rem; padding: 0.5rem 0.75rem; }
}

"""

# Manual cache-busting, as this repo has always done it.
VERSION_SWAPS = [("styles.css?v=9", "styles.css?v=10"),
                 ("styles.css?v=8", "styles.css?v=10")]


def main():
    dry = "--dry-run" in sys.argv

    # 1. the stylesheet
    css = CSS.read_text(encoding="utf-8")
    if CSS_MARKER in css:
        print("  css/styles.css        .gov-bar rule already present")
    elif CSS_ANCHOR not in css:
        sys.exit("ERROR: could not find the .nav anchor in css/styles.css")
    else:
        if not dry:
            CSS.write_text(css.replace(CSS_ANCHOR, CSS_RULE + CSS_ANCHOR, 1), encoding="utf-8")
        print("  css/styles.css        .gov-bar rule added")

    # 2 + 3. the pages
    bars = bumps = changed = 0
    skipped = []
    for path in sorted(SITE.rglob("*.html")):
        if set(path.parts) & SKIP_DIRS:
            continue
        text = path.read_text(encoding="utf-8")
        original = text

        bar_ok = not (set(path.parts) & BAR_SKIP_DIRS)
        if bar_ok and BAR_MARKER not in text:
            if NAV_ANCHOR in text:
                text = text.replace(NAV_ANCHOR, BAR_HTML + NAV_ANCHOR, 1)
                bars += 1
            else:
                skipped.append(path.relative_to(SITE))

        for old, new in VERSION_SWAPS:
            if old in text:
                bumps += text.count(old)
                text = text.replace(old, new)

        if text != original:
            changed += 1
            if not dry:
                path.write_text(text, encoding="utf-8")

    print(f"\n  {'would change' if dry else 'changed':<13} {changed} pages")
    print(f"    disclosure bars inserted   {bars}")
    print(f"    ?v= cache-busters bumped   {bumps}")
    if skipped:
        print(f"\n  skipped (no <nav class=\"nav\">, all unlinked prototypes): {len(skipped)}")
        for p in skipped:
            print(f"       {p}")


if __name__ == "__main__":
    main()
