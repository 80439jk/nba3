#!/usr/bin/env python3
"""
Replace "apply"-flavoured CTA link TEXT with "Find Assistance" wording.

Companion to the /apply/0 -> /info/00 repoint, which changed href values only
and left the visible labels alone.

Anchors on the full element text between > and <, so nothing inside prose is
touched and place names survive: Appling County, Georgia and appling.gov both
contain "appl" and are deliberately unaffected.

Scope: nationalbenefitalliance/, *.html. Skips node_modules/ and .git/.
Funnel directories are not excluded, but contain none of these strings.

Idempotent: a second run reports 0 changed files.

Usage:  python3 _retext_apply_ctas.py [--dry-run]
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "nationalbenefitalliance"
SKIP_DIRS = {"node_modules", ".git"}

# (old label, new label). "Now" is preserved where it carried urgency.
SWAPS = [
    (">Apply for Access Code<", ">Find Assistance<"),   # 50 live state pages
    (">Apply for Assistance<",  ">Find Assistance<"),   # prototype/ only
    (">Apply for Benefits<",    ">Find Assistance<"),   # prototype/ only
    (">Apply Now<",             ">Find Assistance Now<"),  # prototype/ only
]


def main():
    dry = "--dry-run" in sys.argv
    changed = files = 0
    per_label = {old: 0 for old, _ in SWAPS}

    for path in sorted(SITE.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in SWAPS:
            if old in text:
                per_label[old] += text.count(old)
                text = text.replace(old, new)
        if text != original:
            files += 1
            changed += 1
            if not dry:
                path.write_text(text, encoding="utf-8")

    print(f"  {'would change' if dry else 'changed':<13} {files} files")
    for old, n in per_label.items():
        print(f"    {old.strip('<>'):<24} {n}")


if __name__ == "__main__":
    main()
