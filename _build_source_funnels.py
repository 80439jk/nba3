#!/usr/bin/env python3
"""
Build the Bing and OpenAI source funnels at /info/bg1/ and /info/oa1/ from
/info/02/ — the government-services-policy rewrite of the Google funnel.

WHY THIS EXISTS
---------------
Call attribution on this site is done by URL + a hardcoded phone number, never
by swapping numbers at runtime. So each traffic source gets its own copy of the
funnel with its own line. This is the same pattern as _build_yt1_variant.py,
generalised to the two remaining sources.

MOVED 2026-09-24: these funnels used to live at /apply/bg1/ and /apply/oa1/ and
were clones of /apply/2/. They now live under /info/ (ad URLs must not contain
"apply") and are generated from /info/02/, so they carry the compliant copy, the
.gov-bar disclosure strip and the combined footer disclosure.

The old directories stay on disk behind 308 redirects in vercel.json, as the
rollback path — the same treatment apply/1, apply/3 and apply/0 got.

WHAT IT DOES
------------
Copies the 7 pages of info/02 into each target, then applies string-level
substitutions only. No structural change. Each clone therefore inherits, byte
for byte: the GTM container, `noindex, nofollow`, the TCPA consent checkbox,
the honeypot (hp_website), the time-trap (form_duration_ms), TrustedForm,
captureUTM() and the transaction_id.

Also writes each funnel's popup.js: a copy of /info/popup.js with only the
phone number changed. Behaviour stays identical (30s delay, once per session,
re-pops 30s after close).

bg1 is a pure phone/path swap — Microsoft UET lives in GTM, so there is no page
code. oa1 additionally re-injects the OpenAI pixel and its oa-track.js click
listener, both carried over verbatim from the old funnel; the pixel is vendor
code and is never retyped or edited.

IDEMPOTENT
----------
Each target is regenerated from info/02 on every run, so a second run produces
identical bytes. These are GENERATED directories: change this script, then
re-run. Do not hand-edit them.

RUN
---
    python3 _build_source_funnels.py            # both
    python3 _build_source_funnels.py bg1        # just one
"""

import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, 'nationalbenefitalliance')
SRC = os.path.join(SITE, 'info', '02')
SRC_POPUP = os.path.join(SITE, 'info', 'popup.js')

# Where the OpenAI extras are carried over from. Read, never edited.
OA_LEGACY = os.path.join(SITE, 'apply', 'oa1')

PAGES = [
    'index.html',
    'step-1-dob-citizen/index.html',
    'step-2-address/index.html',
    'step-3-income-employ/index.html',
    'step-4-contact/index.html',
    'thank-you/index.html',
    'thank-you-2/index.html',
]

# Strings that identify the Google funnel. None may survive in a clone.
FORBIDDEN = [
    '/info/02/', '/apply/2/',
    'tel:+18135569954', '1-813-556-9954',      # started-funnel line
    'tel:+18135608063', '1-813-560-8063',      # completed-funnel line
    'tel:+18135569953', '1-813-556-9953',      # shared popup line
    "landing_page: 'info02'", "landing_page: 'apply2'",
]

# The main-site line in every funnel footer. Allowed on every page.
MAIN_SITE_TEL = 'tel:+18006058906'

# Anchors for the OpenAI injections. Both exist in info/02.
PIXEL_ANCHOR = "    <!-- End Google Tag Manager -->"

SOURCES = {
    'bg1': {
        'label': 'Bing',
        # Bing keeps two distinct lines, mapped 1:1 onto the Google pair.
        'funnel_tel': 'tel:+12394809440', 'funnel_num': '1-239-480-9440',
        'thanks_tel': 'tel:+12394809438', 'thanks_num': '1-239-480-9438',
        'popup_tel': 'tel:+16452389372',  'popup_num': '1-645-238-9372',
        'landing_page': 'bg1',
        'openai': False,
    },
    'oa1': {
        'label': 'OpenAI',
        # OpenAI uses one line on every call button and in the popup.
        'funnel_tel': 'tel:+12394569477', 'funnel_num': '1-239-456-9477',
        'thanks_tel': 'tel:+12394569477', 'thanks_num': '1-239-456-9477',
        'popup_tel': 'tel:+12394569477',  'popup_num': '1-239-456-9477',
        'landing_page': 'oa1',
        'openai': True,
    },
}


def rules(name, cfg):
    """(label, old, new, required) — order is safe: no old is a substring of another."""
    return [
        ('nav path',          '/info/02/',            '/info/%s/' % name,          True),
        ('funnel tel',        'tel:+18135569954',     cfg['funnel_tel'],           True),
        ('funnel display',    '1-813-556-9954',       cfg['funnel_num'],           True),
        ('thank-you tel',     'tel:+18135608063',     cfg['thanks_tel'],           True),
        ('thank-you display', '1-813-560-8063',       cfg['thanks_num'],           True),
        ('popup src',         '/info/popup.js',       '/info/%s/popup.js' % name,  True),
        ('landing_page',      "landing_page: 'info02'",
                              "landing_page: '%s'" % cfg['landing_page'],          True),
    ]


def openai_extras():
    """The pixel block and the oa-track.js body, read verbatim from the old funnel."""
    src = open(os.path.join(OA_LEGACY, 'index.html'), encoding='utf-8').read()
    m = re.search(r'<!-- OpenAI Pixel -->\n<script>.*?</script>\n', src, re.S)
    if not m:
        sys.exit('MISSING: OpenAI pixel block in %s/index.html' % OA_LEGACY)
    tracker = open(os.path.join(OA_LEGACY, 'oa-track.js'), encoding='utf-8').read()
    return m.group(0), tracker


def build(name, cfg):
    dst = os.path.join(SITE, 'info', name)
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    os.makedirs(dst)

    rs = rules(name, cfg)
    counts = {label: 0 for label, _, _, _ in rs}

    pixel = tracker = None
    if cfg['openai']:
        pixel, tracker = openai_extras()

    for rel in PAGES:
        src = os.path.join(SRC, rel)
        if not os.path.exists(src):
            sys.exit('MISSING SOURCE: %s' % src)
        with open(src, encoding='utf-8') as f:
            s = f.read()

        for label, old, new, _req in rs:
            n = s.count(old)
            if n:
                s = s.replace(old, new)
                counts[label] += n

        if cfg['openai']:
            if PIXEL_ANCHOR not in s:
                sys.exit('NO PIXEL ANCHOR in %s. info/02 changed shape.' % rel)
            s = s.replace(PIXEL_ANCHOR, pixel + PIXEL_ANCHOR, 1)
            popup_tag = '  <script src="/info/%s/popup.js"></script>\n' % name
            if popup_tag not in s:
                sys.exit('NO POPUP TAG in %s to anchor oa-track.js.' % rel)
            s = s.replace(
                popup_tag,
                popup_tag + '  <script src="/info/%s/oa-track.js" defer></script>\n' % name,
                1)

        for bad in FORBIDDEN:
            if bad in s:
                sys.exit('LEFTOVER source string %r in %s/%s' % (bad, name, rel))

        # Per-page phone assertion. The rule counts above only prove a rule
        # matched SOMEWHERE across the 7 pages, so a single page whose number
        # drifted would slip through. Every page must carry this source's line,
        # and no tel: other than this source's and the main-site footer number.
        # Only thank-you/ carries the completed-funnel line. thank-you-2 is the
        # CRM-reject fallback and keeps the funnel line, same as apply/2.
        expected = (cfg['thanks_tel'] if rel == 'thank-you/index.html'
                    else cfg['funnel_tel'])
        if expected not in s:
            sys.exit('MISSING LINE: %s not on %s/%s. info/02 changed shape.'
                     % (expected, name, rel))
        for tel in set(re.findall(r'tel:\+\d+', s)):
            if tel not in (cfg['funnel_tel'], cfg['thanks_tel'], MAIN_SITE_TEL):
                sys.exit('UNEXPECTED LINE %s on %s/%s' % (tel, name, rel))

        out = os.path.join(dst, rel)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, 'w', encoding='utf-8') as f:
            f.write(s)

    for label, _o, _n, req in rs:
        if req and counts[label] == 0:
            sys.exit('NO MATCH: rule %r never matched for %s. info/02 changed shape.'
                     % (label, name))

    # popup fork: number only, behaviour identical
    with open(SRC_POPUP, encoding='utf-8') as f:
        p = f.read()
    swaps = [("var PHONE_DISPLAY = '1-813-556-9953';",
              "var PHONE_DISPLAY = '%s';" % cfg['popup_num']),
             ("var PHONE_TEL = 'tel:+18135569953';",
              "var PHONE_TEL = '%s';" % cfg['popup_tel'])]
    for old, new in swaps:
        if old not in p:
            sys.exit('POPUP: anchor %r missing in info/popup.js' % old[:40])
        p = p.replace(old, new)
    with open(os.path.join(dst, 'popup.js'), 'w', encoding='utf-8') as f:
        f.write(p)

    if cfg['openai']:
        with open(os.path.join(dst, 'oa-track.js'), 'w', encoding='utf-8') as f:
            f.write(tracker)

    extra = ' + oa-track.js' if cfg['openai'] else ''
    print('  info/%s  (%s): %d pages + popup.js%s' % (name, cfg['label'], len(PAGES), extra))
    print('    substitutions: %s'
          % ', '.join('%s=%d' % (k, v) for k, v in counts.items()))


def main():
    wanted = [a for a in sys.argv[1:] if not a.startswith('-')] or list(SOURCES)
    for name in wanted:
        if name not in SOURCES:
            sys.exit('unknown source %r; known: %s' % (name, ', '.join(SOURCES)))
    print('Building source funnels from info/02 …\n')
    for name in wanted:
        build(name, SOURCES[name])
    print('\nDone. Point Bing ads at /info/bg1/ and OpenAI ads at /info/oa1/.')


if __name__ == '__main__':
    main()
