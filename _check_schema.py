#!/usr/bin/env python3
"""Fail if any page's JSON-LD breaks the structured-data spec (5 Oct 2026).

Run after any change that touches JSON-LD:  python3 _check_schema.py
Exit code 1 and a list of problems if anything fails. Checks:
- every block parses as strict JSON (comments and trailing commas fail);
- no kill-list type or property (spec §1) and none of our phase-1 removals;
- NBA is never a government body, NGO, provider or operator;
- every GovernmentService names its provider and points serviceUrl at the agency (§4);
- numberOfItems equals the items listed (§3);
- every page carries the site-wide Organization with the disambiguating description (§2).
"""
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nationalbenefitalliance")
SKIP_DIRS = {"node_modules", ".git", "backend", "api"}
LD_RE = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
NBA = "National Benefit Alliance"
ORG_ID = "https://nationalbenefitalliance.com/#org"
MAIN_PHONE = "+1-800-605-8906"

BANNED_TYPES = {"ApplyAction", "GovernmentOffice", "NonprofitType", "GovernmentBenefitsType",
                "AggregateRating", "Review", "Dataset",
                "FAQPage", "HowTo", "SearchAction"}  # last three: phase-1 decisions
BANNED_KEYS = {"aggregateRating", "review", "sameAs", "foundingDate", "lastReviewed",
               "potentialAction", "measurementTechnique", "speakable"}
NBA_ONLY_NOT = {"GovernmentOrganization", "GovernmentService", "NGO"}
OPERATOR_KEYS = ("provider", "serviceOperator", "brand", "offers", "performer")
BANNED_TEXT = ("Community Resource Center", "/*")


def types(node):
    t = node.get("@type", [])
    return set(t if isinstance(t, list) else [t])


def is_nba(value):
    s = json.dumps(value, ensure_ascii=False)
    return NBA in s or ORG_ID in s


def nodes(value):
    if isinstance(value, dict):
        yield value
        for v in value.values():
            yield from nodes(v)
    elif isinstance(value, list):
        for v in value:
            yield from nodes(v)


def check(doc):
    problems = []
    org = None
    for n in nodes(doc):
        ts = types(n)
        for t in ts & BANNED_TYPES:
            problems.append("banned type " + t)
        for k in set(n) & BANNED_KEYS:
            problems.append("banned property " + k)
        if n.get("@id") == ORG_ID and "Organization" in ts:
            org = n
        if ts & NBA_ONLY_NOT and is_nba({k: v for k, v in n.items() if k not in OPERATOR_KEYS}):
            problems.append("NBA typed as %s" % "/".join(sorted(ts & NBA_ONLY_NOT)))
        if "GovernmentService" in ts:
            if not n.get("provider"):
                problems.append("GovernmentService without provider: %s" % n.get("name"))
            for k in OPERATOR_KEYS:
                if k in n and is_nba(n[k]):
                    problems.append("NBA as %s of %s" % (k, n.get("name")))
            if "nationalbenefitalliance.com" in str(n.get("serviceUrl", "")):
                problems.append("serviceUrl points at NBA: %s" % n.get("name"))
        if "ItemList" in ts and "numberOfItems" in n:
            if n["numberOfItems"] != len(n.get("itemListElement", [])):
                problems.append("numberOfItems %s != %d listed" % (n["numberOfItems"], len(n.get("itemListElement", []))))
    if org is None:
        problems.append("missing site-wide Organization")
    else:
        if not org.get("disambiguatingDescription"):
            problems.append("Organization missing disambiguatingDescription")
        phones = {cp.get("telephone") for cp in org.get("contactPoint", [])}
        if phones != {MAIN_PHONE}:
            problems.append("Organization phone is %s, expected %s" % (sorted(phones), MAIN_PHONE))
    return problems


def main():
    pages = 0
    tally = Counter()
    failures = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, ROOT)
            with open(path, encoding="utf-8") as f:
                blocks = LD_RE.findall(f.read())
            if not blocks:
                continue
            pages += 1
            for block in blocks:
                for s in BANNED_TEXT:
                    if s in block:
                        failures.append((rel, "contains %r" % s))
                try:
                    doc = json.loads(block)
                except ValueError as e:
                    failures.append((rel, "invalid JSON: %s" % e))
                    continue
                for n in nodes(doc):
                    for t in types(n):
                        tally[t] += 1
                failures += [(rel, p) for p in check(doc)]
    print("pages with JSON-LD: %d" % pages)
    print("types: " + ", ".join("%s %d" % kv for kv in tally.most_common()))
    if failures:
        by_problem = Counter(p for _, p in failures)
        print("\nFAILED: %d problems on %d pages" % (len(failures), len({r for r, _ in failures})))
        for p, c in by_problem.most_common(25):
            example = next(r for r, q in failures if q == p)
            print("  %5d  %s   (e.g. %s)" % (c, p, example))
        sys.exit(1)
    print("OK: no problems")


if __name__ == "__main__":
    main()
