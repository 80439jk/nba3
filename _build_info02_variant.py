#!/usr/bin/env python3
"""
Build nationalbenefitalliance/info/02/ — the Google-Ads-govt-services-policy
rewrite of the apply/2 funnel.

Source:  nationalbenefitalliance/apply/2/   (untouched)
Target:  nationalbenefitalliance/info/02/

What it does
  1. Copies apply/2 -> info/02 the first time it runs.
  2. Repoints internal funnel paths /apply/2/ -> /info/02/.
  3. Sets landing_page: 'apply2' -> 'info02'.
  4. Applies the approved copy deck (owner-signed-off 2026-09-24).
  5. Injects the government-disclosure bar on the LANDING PAGE ONLY.
  6. Adds the SNAP/LIHEAP + usa.gov/211 disclosure to the footer of all 7 pages.

Idempotent: every edit is a literal old->new swap that is skipped when `old`
is absent. Re-running changes nothing. Safe to run against a partial build.

Not changed, on purpose (see info/02/README.md):
  - phone numbers, tel: links, ty-call-btn, GTM, dataLayer
  - honeypot hp_website, time-trap form_duration_ms, TrustedForm
  - TCPA consent text and checkbox
  - the form field set (field parity with the other 5 live funnels)
  - the popup's behaviour. It moved to /info/popup.js; apply/2 and info/01 still
    request /apply/popup.js, which vercel.json rewrites to the same file.

Usage:  python3 _build_info02_variant.py
"""

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "nationalbenefitalliance" / "apply" / "2"
DST = ROOT / "nationalbenefitalliance" / "info" / "02"

LANDING = "index.html"
STEPS = [
    "step-1-dob-citizen/index.html",
    "step-2-address/index.html",
    "step-3-income-employ/index.html",
    "step-4-contact/index.html",
]
THANKYOUS = ["thank-you/index.html", "thank-you-2/index.html"]
ALL_PAGES = [LANDING] + STEPS + THANKYOUS


# ---------------------------------------------------------------- edit tables

# Applied to every page in the funnel.
GLOBAL_EDITS = [
    # Internal funnel navigation.
    ("/apply/2/", "/info/02/"),
    # Backend attribution.
    ("landing_page: 'apply2'", "landing_page: 'info02'"),
    # Popup moved to a neutral URL. /apply/popup.js still rewrites to it in
    # vercel.json, so apply/2 and info/01 keep working untouched.
    ("/apply/popup.js", "/info/popup.js"),
]

# Footer government disclosure. Sits immediately above the existing legal
# paragraph, on every page. Plain text, not a link — an outbound <a> on a
# funnel page leaks the session before the call converts.
FOOTER_DISCLOSURE = (
    '      <p class="footer__disclaimer footer__disclaimer--gov">\n'
    "        National Benefit Alliance is a private company. We are not a government agency, "
    "and we do not apply for or enroll you in SNAP, LIHEAP, Section 8 or rental assistance. "
    "Looking for a government program? Apply directly at usa.gov/benefits or call 211.\n"
    "      </p>\n"
)
FOOTER_ANCHOR = '      <p class="footer__disclaimer">\n'

# The disclosure bar. Landing page only, per owner. Placed above the sticky
# header so it scrolls away, matching the reference design.
GOV_BAR_HTML = (
    "  <!-- GOVERNMENT DISCLOSURE BAR — info/02 only. Do not remove: this is the\n"
    "       page's primary Google Ads govt-services-policy disclosure. -->\n"
    '  <div class="gov-bar">Independent private company. '
    "Not a government website. Not a government program.</div>\n\n"
)
GOV_BAR_ANCHOR = '  <header class="header">'

GOV_BAR_CSS = """.gov-bar {
  background-color: var(--navy-800);
  color: var(--navy-50);
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
GOV_BAR_CSS_ANCHOR = ".header {\n"


# Landing page copy. Rows keyed to the approved deck.
LANDING_EDITS = [
    # --- artifact Option A, above the fold -------------------------------
    # A1 shield mark + "Community Resource Center": kept, per owner.
    # A2 headline
    (
        "<h1 class=\"hero__headline\">Get matched to assistance that can help right away</h1>",
        "<h1 class=\"hero__headline\">Need some help financially? Start with one call.</h1>",
    ),
    # A3 sub-headline
    (
        '<p class="hero__oneliner">Talk to a specialist. See what you qualify for.<br>Free, fast, confidential, no commitment.</p>',
        '<p class="hero__oneliner">Talk to a specialist about your situation.<br>Free, fast, confidential, no commitment.</p>',
    ),
    # A5 card 1 title + sub
    (
        '<h2 class="hero__card-title">What brings you here today?</h2>',
        '<h2 class="hero__card-title">What\'s hardest right now?</h2>',
    ),
    (
        "<p class=\"hero__card-sub\">Pick one or more. We'll only show you programs that actually fit.</p>",
        '<p class="hero__card-sub">Pick one or more. We use this to see what may fit.</p>',
    ),
    # A6 card 2 sub
    (
        '<p class="hero__card-sub">Programs vary by state — this is how we find yours.</p>',
        '<p class="hero__card-sub">Options vary by state.</p>',
    ),
    # A7 trust strip
    (
        '<span><span class="hero__card-trust-check">✓</span> 100% free</span>',
        '<span><span class="hero__card-trust-check">✓</span> Free to call</span>',
    ),
    # A8 label under the card (CSS uppercases it)
    (
        ">Real People, Real Benefits</p>",
        ">Real People. Real Conversations.</p>",
    ),
    # --- below the fold ---------------------------------------------------
    # 1 page title
    (
        "<title>Get Matched with Benefit Programs — National Benefit Alliance</title>",
        "<title>Need Some Help Financially? — National Benefit Alliance</title>",
    ),
    # 2 trust badge
    ('<span class="trust2-label">100% Free to Apply</span>',
     '<span class="trust2-label">No Cost To Call</span>'),
    # 3 trust badge
    ('<span class="trust2-label">No SSN Needed to Start</span>',
     '<span class="trust2-label">No SSN Needed</span>'),
    # 4 "Private &amp; Confidential": kept, per owner.
    # 5 programs card intro
    (
        "there are programs available to help. Many people qualify and don't even know it.",
        "there are options available to help that many people didn't even know existed.",
    ),
    # 6 programs card title
    (
        '<h2 class="programs-card__title">Get Matched To Programs In One Quick Call</h2>',
        '<h2 class="programs-card__title">What One Call Can Cover</h2>',
    ),
    # 7 all three CTAs
    (">See Available Programs</a>", ">Start With One Call</a>"),
    # 8 how-it-works subtitle
    (
        '<p class="how-section__subtitle">Three simple steps to get matched with assistance:</p>',
        '<p class="how-section__subtitle">Three steps, start to finish:</p>',
    ),
    # 9 how step 1 body
    (
        '<p class="how-step__desc">Complete a quick eligibility form about your situation and needs</p>',
        '<p class="how-step__desc">Tell us a little about your situation and needs</p>',
    ),
    # 10 "Speak with a Case Manager": kept, per owner.
    # 11 how step 2 body
    (
        '<p class="how-step__desc">Get matched to programs you qualify for during your call</p>',
        '<p class="how-step__desc">Talk through your situation with a real person on the phone</p>',
    ),
    # 12 how step 3 title
    (
        '<h3 class="how-step__title">Receive Personal Enrollment Help</h3>',
        '<h3 class="how-step__title">Receive Personal, Step-by-Step Help</h3>',
    ),
    # 13 how step 3 body
    (
        '<p class="how-step__desc">Your specialist guides you through the enrollment process step by step</p>',
        '<p class="how-step__desc">Your specialist walks you through what\'s available and what to do next</p>',
    ),
    # 14 how free banner
    (
        '<p class="how-free-banner__title">It is free to apply.</p>',
        '<p class="how-free-banner__title">The call is free.</p>',
    ),
    (
        '<p class="how-free-banner__text">There are no upfront costs and no hidden fees.</p>',
        '<p class="how-free-banner__text">No upfront costs and no hidden fees.</p>',
    ),
    # 15 what-to-expect item 2
    (
        '<span class="expect-text">A short, guided prescreening (just a couple minutes)</span>',
        '<span class="expect-text">A few questions about your situation (just a couple minutes)</span>',
    ),
    # 16 what-to-expect item 3
    (
        '<span class="expect-text">Immediate feedback on potential eligibility</span>',
        '<span class="expect-text">A straight answer about what we can and can\'t help with</span>',
    ),
    # 17 what-to-expect item 4
    (
        '<span class="expect-text">Step by step help with enrollment in the programs that fit your situation</span>',
        '<span class="expect-text">Step by step help with the options that fit your situation</span>',
    ),
    # 18 expect free banner
    (
        '<p class="expect-free-banner__title">It\'s completely free to apply.</p>',
        '<p class="expect-free-banner__title">The call is completely free.</p>',
    ),
    # 19 final CTA title/subtitle: kept, per owner.
    # 20 final CTA third line: removed entirely.
    (
        '        <p class="final-cta-section__sub2">Connect to the benefits and assistance you deserve.</p>\n',
        "",
    ),
]

# Step pages 1-4.
STEP_EDITS = [
    # 22
    (
        '<p class="security-note">Your information is secure and will only be used to match you with relevant programs.</p>',
        '<p class="security-note">Your information is secure and will only be used to help identify assistance options for your call.</p>',
    ),
    # 23 submit button (step 4 only, harmless elsewhere)
    (
        '<button type="submit" class="btn btn-next" id="submitBtn">Complete &amp; Get Matched</button>',
        '<button type="submit" class="btn btn-next" id="submitBtn">Finish — Get My Reference Number</button>',
    ),
    # 21 header tagline, 24 page titles: kept, per owner.
]

# Both thank-you pages.
THANKYOU_EDITS = [
    # 25 "Congratulations!": kept, per owner.
    # 26 action box
    (
        "A case manager has been assigned to you. Call the number below to verify your identity and discuss assistance programs you may qualify for. This call is completely free and can connect you to assistance that may help right away.",
        "A case manager has been assigned to you. Call the number below to confirm your details and talk through your situation. This call is completely free and can connect you to assistance options that may help right away.",
    ),
    # 27 expiry note
    (
        "or you may need to resubmit an application.",
        "or you may need to fill out the form again.",
    ),
    # 28 tagline
    (
        "National Benefit Alliance has helped more than 2 million U.S. residents receive benefits and resources",
        "National Benefit Alliance has helped 100s of U.S. residents find assistance resources and options",
    ),
    # 29 benefit title
    (
        '<div class="ty-benefit-title">Over 100 Programs Available</div>',
        '<div class="ty-benefit-title">Over 100 Resources Available</div>',
    ),
    # 30 benefit desc
    (
        '<div class="ty-benefit-desc">Based on your information, you may qualify for multiple assistance programs</div>',
        '<div class="ty-benefit-desc">Based on your information, there may be multiple options for you</div>',
    ),
    # 31 benefit desc
    (
        '<div class="ty-benefit-desc">A specialist will help with enrollment and answer all your questions</div>',
        '<div class="ty-benefit-desc">A specialist will walk you through your options and answer your questions</div>',
    ),
    # 32 "100% Free Service": kept, per owner.
    # 33 name placeholder (JS overwrites it with the lead's first name)
    (
        '<div class="ty-info-box__name" id="tyName">Applicant</div>',
        '<div class="ty-info-box__name" id="tyName">Name</div>',
    ),
    # 34 contact disclaimer
    (
        "We'll use your contact information to connect you with a benefits specialist and provide updates about programs you may qualify for. You can manage your preferences anytime.",
        "We'll use your contact information to connect you with a case manager and provide updates about your call. You can manage your preferences anytime.",
    ),
]


# ---------------------------------------------------------------------- build

def clone():
    """Copy apply/2 -> info/02 once. Never overwrites an existing build."""
    if DST.exists():
        print(f"  info/02/ already exists — editing in place")
        return False
    if not SRC.exists():
        sys.exit(f"ERROR: source funnel not found: {SRC}")
    DST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SRC, DST)
    print(f"  cloned apply/2 -> info/02 ({len(list(DST.rglob('*.html')))} html files)")
    return True


def apply_edits(page, edits, label):
    """Literal swaps. Returns the number that actually fired."""
    path = DST / page
    if not path.exists():
        print(f"  ! missing: {page}")
        return 0
    text = path.read_text(encoding="utf-8")
    original = text
    fired = 0
    for old, new in edits:
        if old in text:
            text = text.replace(old, new)
            fired += 1
    if text != original:
        path.write_text(text, encoding="utf-8")
    print(f"  {page:<34} {fired:>2}/{len(edits)} {label}")
    return fired


def inject_gov_bar():
    """Disclosure bar + its CSS. Landing page only."""
    path = DST / LANDING
    text = path.read_text(encoding="utf-8")
    changed = False

    if "gov-bar" not in text:
        if GOV_BAR_CSS_ANCHOR not in text:
            sys.exit("ERROR: could not find the .header CSS anchor for the gov bar")
        text = text.replace(GOV_BAR_CSS_ANCHOR, GOV_BAR_CSS + GOV_BAR_CSS_ANCHOR, 1)
        if GOV_BAR_ANCHOR not in text:
            sys.exit("ERROR: could not find the <header> anchor for the gov bar")
        text = text.replace(GOV_BAR_ANCHOR, GOV_BAR_HTML + GOV_BAR_ANCHOR, 1)
        changed = True

    if changed:
        path.write_text(text, encoding="utf-8")
        print("  index.html                         gov disclosure bar injected")
    else:
        print("  index.html                         gov disclosure bar already present")


def inject_footer_disclosure():
    """SNAP/LIHEAP + usa.gov/211 sentence above the legal paragraph, every page."""
    n = 0
    for page in ALL_PAGES:
        path = DST / page
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        if "footer__disclaimer--gov" in text:
            continue
        if FOOTER_ANCHOR not in text:
            print(f"  ! footer anchor not found in {page}")
            continue
        text = text.replace(FOOTER_ANCHOR, FOOTER_DISCLOSURE + FOOTER_ANCHOR, 1)
        path.write_text(text, encoding="utf-8")
        n += 1
    print(f"  footer gov disclosure added to {n} page(s)")


def main():
    print("Building /info/02/ …\n")
    clone()

    print("\n  global (paths + landing_page):")
    for page in ALL_PAGES:
        apply_edits(page, GLOBAL_EDITS, "global")

    print("\n  landing copy:")
    apply_edits(LANDING, LANDING_EDITS, "landing")

    print("\n  step copy:")
    for page in STEPS:
        apply_edits(page, STEP_EDITS, "step")

    print("\n  thank-you copy:")
    for page in THANKYOUS:
        apply_edits(page, THANKYOU_EDITS, "thank-you")

    print("\n  disclosures:")
    inject_gov_bar()
    inject_footer_disclosure()

    print("\nDone. Re-running this script is a no-op.")


if __name__ == "__main__":
    main()
