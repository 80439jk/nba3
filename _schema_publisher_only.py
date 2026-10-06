#!/usr/bin/env python3
"""Rewrite every page's JSON-LD so it describes the publication, never the programs.

Spec: "NBA structured data — specification" (5 Oct 2026), phase 1.
- Site-wide Organization + WebSite (§2) on every page that carries JSON-LD.
- State hubs: CollectionPage + BreadcrumbList + ItemList of the county links on the page (§3).
- County pages: WebPage + BreadcrumbList + ItemList of the categories shown on the page.
  No GovernmentService until phase 2 has verified agency data (§4, §8).
- No FAQPage, HowTo, SearchAction, sameAs, lastReviewed anywhere.

The markup is rebuilt from what the page shows (canonical URL, <h1>, visible links and
category headings), not patched from the old blocks. Idempotent: a second run changes nothing.
Check the result with _check_schema.py.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nationalbenefitalliance")
SITE = "https://nationalbenefitalliance.com/"
ORG_ID = SITE + "#org"
SITE_ID = SITE + "#site"

ORGANIZATION = {
    "@type": "Organization",
    "@id": ORG_ID,
    "name": "National Benefit Alliance",
    "legalName": "National Benefit Alliance",
    "url": SITE,
    "description": (
        "A privately held for-profit company that publishes information about assistance "
        "programs operated by government agencies and nonprofit organizations."
    ),
    "disambiguatingDescription": (
        "National Benefit Alliance is a private for-profit company. It is not a government "
        "agency, is not affiliated with or endorsed by any government agency or program, and "
        "does not provide, apply for, submit forms for, or enroll anyone in government benefits "
        "such as SNAP, LIHEAP, Section 8 or rental assistance."
    ),
    "slogan": "We tell you where to apply. We do not apply for you.",
    "contactPoint": [{
        "@type": "ContactPoint",
        "telephone": "+1-800-605-8906",  # main-site line; never a funnel-tracked line
        "contactType": "customer service",
        "areaServed": "US",
        "availableLanguage": ["en", "es"],
    }],
}

WEBSITE = {
    "@type": "WebSite",
    "@id": SITE_ID,
    "url": SITE,
    "name": "National Benefit Alliance",
    "publisher": {"@id": ORG_ID},
    "inLanguage": "en-US",
}

LD_RE = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)
SKIP_DIRS = {"node_modules", ".git", "backend", "api"}


def text(fragment):
    """Visible text of an HTML fragment, without tags, emoji or the featured star."""
    t = html.unescape(re.sub(r"<[^>]+>", " ", fragment))
    t = re.sub(r"[^\w\s.,'’&()-]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def title_of(page):
    m = re.search(r"<title>(.*?)</title>", page, re.S)
    t = html.unescape(m.group(1)).strip() if m else ""
    return re.split(r"\s+[|–—-]\s+", t)[0].strip()


def canonical_of(page):
    m = re.search(r'<link rel="canonical" href="([^"]+)"', page)
    return m.group(1) if m else None


def state_name(slug):
    return " ".join(w.capitalize() for w in slug.split("-"))


def crumbs(*pairs):
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": url}
            for i, (name, url) in enumerate(pairs, 1)
        ],
    }


def old_breadcrumb(block):
    """(name, url) pairs from the page's existing breadcrumb, for one-off pages."""
    pairs = re.findall(
        r'"position"\s*:\s*\d+\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"item"\s*:\s*"([^"]+)"', block)
    return [(html.unescape(n), u) for n, u in pairs]


def page_node(kind, url, name, **extra):
    node = {
        "@type": kind,
        "@id": url + "#page",
        "url": url,
        "name": name,
        "isPartOf": {"@id": SITE_ID},
        "publisher": {"@id": ORG_ID},
        "isAccessibleForFree": True,
        "inLanguage": "en-US",
    }
    node.update(extra)
    return node


LOCAL_UNIT = {"louisiana": ("parish", "parishes"), "alaska": ("borough", "boroughs and census areas")}


def build_state(page, url, slug):
    st = state_name(slug)
    unit, units = LOCAL_UNIT.get(slug, ("county", "counties"))
    body = page[page.find("</head>"):]
    names = {}
    for m in re.finditer(r'<a[^>]*href="/%s/([a-z0-9-]+)/"[^>]*>(.*?)</a>' % re.escape(slug), body, re.S):
        county, inner = m.group(1), m.group(2)
        nm = re.search(r'class="sp-cc-name">(.*?)</div>', inner, re.S)
        name = text(nm.group(1) if nm else inner) or state_name(county)
        if county not in names or len(name) < len(names[county]):
            names[county] = name
    items = sorted(names.items(), key=lambda kv: kv[1].lower())
    return [
        page_node("CollectionPage", url, "Assistance programs by %s in %s" % (unit, st),
                  about={"@type": "AdministrativeArea", "name": st}),
        crumbs(("Home", SITE), (st, url)),
        {
            "@type": "ItemList",
            "name": "%s %s" % (st, units),
            "itemListOrder": "https://schema.org/ItemListOrderAscending",
            "numberOfItems": len(items),
            "itemListElement": [
                {"@type": "ListItem", "position": i, "name": name, "url": url + county + "/"}
                for i, (county, name) in enumerate(items, 1)
            ],
        },
    ]


def build_county(page, url, state_slug):
    st = state_name(state_slug)
    h1 = re.search(r"<h1[^>]*>(.*?)<br/>", page, re.S)
    county = text(h1.group(1))
    place = "%s, %s" % (county, st)
    cats = []
    for m in re.finditer(r'<div class="resource-category[^"]*" id="([a-z0-9-]+)">(.*?)</h3>', page, re.S):
        h3 = re.search(r"<h3[^>]*>(.*)", m.group(2), re.S)
        if h3:
            cats.append((m.group(1), text(h3.group(1))))
    graph = [
        page_node("WebPage", url, "Community resources in " + place,
                  about={"@type": "AdministrativeArea", "name": place}),
        crumbs(("Home", SITE), (st, SITE + state_slug + "/"), (county, url)),
    ]
    if cats:
        graph.append({
            "@type": "ItemList",
            "name": "Resource categories in " + place,
            "numberOfItems": len(cats),
            "itemListElement": [
                {"@type": "ListItem", "position": i, "name": name, "url": url + "#" + anchor}
                for i, (anchor, name) in enumerate(cats, 1)
            ],
        })
    return graph


def build(rel, page, block, states):
    url = canonical_of(page)
    parts = rel.split("/")
    if rel == "index.html":
        return [page_node("WebPage", SITE, "National Benefit Alliance", about={"@id": ORG_ID})]
    if rel == "about/index.html":
        return [page_node("AboutPage", url, "About National Benefit Alliance", about={"@id": ORG_ID}),
                crumbs(("Home", SITE), ("About", url))]
    if len(parts) == 2 and parts[0] in states:
        return build_state(page, url, parts[0])
    if len(parts) == 3 and parts[0] in states and '<div class="resource-category' in page:
        return build_county(page, url, parts[0])
    # One-off pages (resources topics, marketing partners, prototypes): page + breadcrumb only.
    kind = "CollectionPage" if '"CollectionPage"' in block else "WebPage"
    graph = [page_node(kind, url, title_of(page))]
    bc = old_breadcrumb(block)
    if len(bc) > 1:
        graph.append(crumbs(*bc))
    return graph


def render(graph):
    doc = {"@context": "https://schema.org", "@graph": [ORGANIZATION, WEBSITE] + graph}
    out = json.dumps(doc, indent=2, ensure_ascii=False).replace("</", "<\\/")
    return "\n" + out + "\n"


def main():
    states = {d for d in os.listdir(ROOT)
              if d != "resources" and os.path.isfile(os.path.join(ROOT, d, "index.html"))
              and any(os.path.isdir(os.path.join(ROOT, d, x)) for x in os.listdir(os.path.join(ROOT, d)))}
    changed = seen = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, ROOT)
            with open(path, encoding="utf-8") as f:
                page = f.read()
            blocks = LD_RE.findall(page)
            if not blocks:
                continue
            if len(blocks) > 1:
                sys.exit("More than one JSON-LD block, handle by hand: " + rel)
            seen += 1
            if not canonical_of(page):
                sys.exit("No canonical URL: " + rel)
            new = LD_RE.sub(lambda m: m.group(1) + render(build(rel, page, m.group(2), states)) + "  " + m.group(3),
                            page, count=1)
            if new != page:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
                changed += 1
    print("pages with JSON-LD: %d, changed: %d" % (seen, changed))


if __name__ == "__main__":
    main()
