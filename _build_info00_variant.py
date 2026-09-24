#!/usr/bin/env python3
"""
Build nationalbenefitalliance/info/00/ — the Google-Ads-govt-services-policy
rewrite of the apply/0 organic funnel.

Source:  nationalbenefitalliance/apply/0/   (untouched)
Target:  nationalbenefitalliance/info/00/

IMPORTANT — this script clones **apply/0**, not info/02.
apply/0 is a clone of the retired apply/3: a 3-step flow with its own TCPA
consent text, its own consent checkbox logic, and its own phone scheme
(main-site line on landing + steps, dedicated organic line on thank-you).
None of that may be replaced with info/02's equivalents. Every edit below is a
literal old->new swap anchored on a string that exists in apply/0, applying the
wording the owner approved for apply/2 -> info/02 and nothing more.

What it does
  1. Copies apply/0 -> info/00 the first time it runs.
  2. Repoints internal funnel paths /apply/0/ -> /info/00/.
  3. Sets landing_page: 'apply0' -> 'info00'.
  4. Applies the approved copy rows.
  5. Injects the government-disclosure bar on the LANDING PAGE ONLY.
  6. Adds the SNAP/LIHEAP + usa.gov/211 disclosure to the footer of all 7 pages.

Idempotent: every edit is skipped when `old` is absent. Re-running changes nothing.

Not changed, on purpose (see info/00/README.md):
  - the TCPA consent label and the #tcpaConsent checkbox logic  (10DLC)
  - phone numbers and every tel: value
  - GTM, dataLayer, ty-call-btn
  - honeypot hp_website, time-trap form_duration_ms, TrustedForm
  - the form field set and the 3-step flow
  - the popup's behaviour. It moved to /info/popup.js.

The sitewide CTA repoint is a SEPARATE script: _repoint_apply0_to_info00.py

Usage:  python3 _build_info00_variant.py
"""

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "nationalbenefitalliance" / "apply" / "0"
DST = ROOT / "nationalbenefitalliance" / "info" / "00"

LANDING = "index.html"
STEPS = [
    "step-1-age-zip/index.html",
    "step-2-name-email/index.html",
    "step-3-phone/index.html",
]
THANKYOUS = ["thank-you/index.html", "thank-you-2/index.html"]
ALL_PAGES = [LANDING] + STEPS + THANKYOUS


# ---------------------------------------------------------------- edit tables

GLOBAL_EDITS = [
    ("/apply/0/", "/info/00/"),
    ("landing_page: 'apply0'", "landing_page: 'info00'"),
    # Popup moved to a neutral URL. /apply/popup.js still rewrites to it in
    # vercel.json, so apply/2 and info/01 keep working untouched.
    ("/apply/popup.js", "/info/popup.js"),
]

FOOTER_DISCLOSURE = (
    '      <p class="footer__disclaimer footer__disclaimer--gov">\n'
    "        National Benefit Alliance is a private company. We are not a government agency, "
    "and we do not apply for or enroll you in SNAP, LIHEAP, Section 8 or rental assistance. "
    "Looking for a government program? Apply directly at usa.gov/benefits or call 211.\n"
    "      </p>\n"
)
FOOTER_ANCHOR = '      <p class="footer__disclaimer">\n'

GOV_BAR_HTML = (
    "  <!-- GOVERNMENT DISCLOSURE BAR — info/00 only. Do not remove: this is the\n"
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


LANDING_EDITS = [
    # ---- unique to apply/0 -------------------------------------------------
    # U5 programs-card intro. MUST run before the generic tail swap below,
    # otherwise the tail is replaced first and this full-line anchor misses.
    # Drops the "food stamps/EBT/SNAP" program names.
    (
        '<p class="programs-card__intro">Whether you\'re struggling with bills, needing information about food stamps/EBT/SNAP, or just trying to make ends meet, there are programs available to help. Many people qualify and don\'t even know it.</p>',
        '<p class="programs-card__intro">Whether you\'re struggling with bills, facing a health challenge, or just trying to make ends meet, there are options available to help that many people didn\'t even know existed.</p>',
    ),
    # U1 headline — mirrors info/02, owner's choice
    (
        '<h1 class="hero__headline">Need help with rent, utilities, groceries, or other assistance?</h1>',
        '<h1 class="hero__headline">Need some help financially? Start with one call.</h1>',
    ),
    # U2 sub-headline (was "See what you qualify for")
    (
        '<p class="hero__oneliner"><strong>See what you qualify for</strong></p>',
        '<p class="hero__oneliner">Talk to a specialist about your situation.<br>Free, fast, confidential, no commitment.</p>',
    ),
    # U3 tile helper
    (
        '<p class="hero__card-sub">Pick the one that most closely matches your needs.</p>',
        '<p class="hero__card-sub">Pick the one that\'s closest. We use this to see what may fit.</p>',
    ),
    # U4 trust strip — apply/0 has 4 chips, only the first changes
    (
        '<span><span class="hero__card-trust-check">✓</span> Free</span>',
        '<span><span class="hero__card-trust-check">✓</span> Free to call</span>',
    ),
    # ---- rows already approved for apply/2, present verbatim in apply/0 ----
    # A5 card 1 title
    (
        '<h2 class="hero__card-title">What brings you here today?</h2>',
        '<h2 class="hero__card-title">What\'s hardest right now?</h2>',
    ),
    # A8 label under the card (CSS uppercases it)
    (">Real People, Real Benefits</p>", ">Real People. Real Conversations.</p>"),
    # 1 page title
    (
        "<title>Get Matched with Benefit Programs — National Benefit Alliance</title>",
        "<title>Need Some Help Financially? — National Benefit Alliance</title>",
    ),
    # 2 / 3 trust badges  (4 "Private & Confidential" kept, per owner)
    ('<span class="trust2-label">100% Free to Apply</span>',
     '<span class="trust2-label">No Cost To Call</span>'),
    ('<span class="trust2-label">No SSN Needed to Start</span>',
     '<span class="trust2-label">No SSN Needed</span>'),
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
    # 9 / 11 / 12 / 13 how steps  (10 "Speak with a Case Manager" kept, per owner)
    (
        '<p class="how-step__desc">Complete a quick eligibility form about your situation and needs</p>',
        '<p class="how-step__desc">Tell us a little about your situation and needs</p>',
    ),
    (
        '<p class="how-step__desc">Get matched to programs you qualify for during your call</p>',
        '<p class="how-step__desc">Talk through your situation with a real person on the phone</p>',
    ),
    (
        '<h3 class="how-step__title">Receive Personal Enrollment Help</h3>',
        '<h3 class="how-step__title">Receive Personal, Step-by-Step Help</h3>',
    ),
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
    # 15 / 16 / 17 what-to-expect
    (
        '<span class="expect-text">A short, guided prescreening (just a couple minutes)</span>',
        '<span class="expect-text">A few questions about your situation (just a couple minutes)</span>',
    ),
    (
        '<span class="expect-text">Immediate feedback on potential eligibility</span>',
        '<span class="expect-text">A straight answer about what we can and can\'t help with</span>',
    ),
    (
        '<span class="expect-text">Step by step help with enrollment in the programs that fit your situation</span>',
        '<span class="expect-text">Step by step help with the options that fit your situation</span>',
    ),
    # 18 expect free banner
    (
        '<p class="expect-free-banner__title">It\'s completely free to apply.</p>',
        '<p class="expect-free-banner__title">The call is completely free.</p>',
    ),
    # 19 final CTA title/subtitle kept, per owner.
    # 20 final CTA third line removed entirely.
    (
        '        <p class="final-cta-section__sub2">Connect to the benefits and assistance you deserve.</p>\n',
        "",
    ),
]


# apply/0's step pages are its own (3-step flow). These four strings are unique
# to it — apply/2's step strings do not exist here and are not introduced.
STEP_EDITS = [
    # U6
    (
        '<h1 class="form-title">Program availability is based on your age and location</h1>',
        '<h1 class="form-title">What\'s available depends on your age and location</h1>',
    ),
    # U7
    (
        '<h1 class="form-title">Just a few more pieces of information. It will only be used to match you with available programs</h1>',
        '<h1 class="form-title">Just a few more pieces of information. It will only be used to help identify options for your call</h1>',
    ),
    # U8
    (
        '<h1 class="form-title">Last step - and we\'ll send your reference number to find programs.</h1>',
        '<h1 class="form-title">Last step — then we\'ll send your reference number.</h1>',
    ),
    # U9
    (
        '<p class="form-subtitle">We only use your number to match you.</p>',
        '<p class="form-subtitle">We only use your number to reach you about your call.</p>',
    ),
    # The TCPA consent label and the submit button ("Get My Reference Number",
    # already neutral) are deliberately untouched.
]


# apply/0's thank-you pages carry the same strings as apply/2's, so the rows the
# owner approved there apply verbatim.
THANKYOU_EDITS = [
    (
        "A case manager has been assigned to you. Call the number below to verify your identity and discuss assistance programs you may qualify for. This call is completely free and can connect you to assistance that may help right away.",
        "A case manager has been assigned to you. Call the number below to confirm your details and talk through your situation. This call is completely free and can connect you to assistance options that may help right away.",
    ),
    (
        "or you may need to resubmit an application.",
        "or you may need to fill out the form again.",
    ),
    (
        "National Benefit Alliance has helped more than 2 million U.S. residents receive benefits and resources",
        "National Benefit Alliance has helped 100s of U.S. residents find assistance resources and options",
    ),
    (
        '<div class="ty-benefit-title">Over 100 Programs Available</div>',
        '<div class="ty-benefit-title">Over 100 Resources Available</div>',
    ),
    (
        '<div class="ty-benefit-desc">Based on your information, you may qualify for multiple assistance programs</div>',
        '<div class="ty-benefit-desc">Based on your information, there may be multiple options for you</div>',
    ),
    (
        '<div class="ty-benefit-desc">A specialist will help with enrollment and answer all your questions</div>',
        '<div class="ty-benefit-desc">A specialist will walk you through your options and answer your questions</div>',
    ),
    (
        '<div class="ty-info-box__name" id="tyName">Applicant</div>',
        '<div class="ty-info-box__name" id="tyName">Name</div>',
    ),
    (
        "We'll use your contact information to connect you with a benefits specialist and provide updates about programs you may qualify for. You can manage your preferences anytime.",
        "We'll use your contact information to connect you with a case manager and provide updates about your call. You can manage your preferences anytime.",
    ),
]


# ---------------------------------------------------------------------- build

def clone():
    if DST.exists():
        print("  info/00/ already exists — editing in place")
        return
    if not SRC.exists():
        sys.exit(f"ERROR: source funnel not found: {SRC}")
    DST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SRC, DST)
    print(f"  cloned apply/0 -> info/00 ({len(list(DST.rglob('*.html')))} html files)")


def apply_edits(page, edits, label):
    path = DST / page
    if not path.exists():
        print(f"  ! missing: {page}")
        return
    text = path.read_text(encoding="utf-8")
    original = text
    fired = []
    missed = []
    for old, new in edits:
        if old and old in text:
            text = text.replace(old, new)
            fired.append(old)
        else:
            missed.append(old)
    if text != original:
        path.write_text(text, encoding="utf-8")
    print(f"  {page:<30} {len(fired):>2}/{len(edits)} {label}")
    for old in missed:
        snippet = (old or "")[:78].replace("\n", " ")
        print(f"       not present: {snippet}")


def inject_gov_bar():
    path = DST / LANDING
    text = path.read_text(encoding="utf-8")
    if "gov-bar" in text:
        print("  index.html                     gov disclosure bar already present")
        return
    if GOV_BAR_CSS_ANCHOR not in text:
        sys.exit("ERROR: .header CSS anchor not found")
    text = text.replace(GOV_BAR_CSS_ANCHOR, GOV_BAR_CSS + GOV_BAR_CSS_ANCHOR, 1)
    if GOV_BAR_ANCHOR not in text:
        sys.exit("ERROR: <header> anchor not found")
    text = text.replace(GOV_BAR_ANCHOR, GOV_BAR_HTML + GOV_BAR_ANCHOR, 1)
    path.write_text(text, encoding="utf-8")
    print("  index.html                     gov disclosure bar injected")


def inject_footer_disclosure():
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
        path.write_text(text.replace(FOOTER_ANCHOR, FOOTER_DISCLOSURE + FOOTER_ANCHOR, 1),
                        encoding="utf-8")
        n += 1
    print(f"  footer gov disclosure added to {n} page(s)")


def main():
    print("Building /info/00/ …\n")
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
