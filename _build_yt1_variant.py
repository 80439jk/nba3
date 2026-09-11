#!/usr/bin/env python3
"""
Build the YouTube source funnel at /info/yt1/ from the live Google funnel
/apply/2/.

WHY THIS EXISTS
---------------
Call attribution on this site is done by URL + a hardcoded phone number, never
by swapping numbers at runtime. A runtime swap would break the Google
Forwarding Number pairing that Google Ads uses to count calls on /apply/2/.
So each traffic source gets its own copy of the funnel with its own line.
See apply/bg1 (Bing) and apply/oa1 (OpenAI) for the same pattern.

WHAT IT DOES
------------
Copies the 7 pages of apply/2 into info/yt1, then applies string-level
substitutions only. No structural change. The clone therefore inherits, byte
for byte: the GTM container, `noindex, nofollow`, the TCPA consent checkbox,
the honeypot (hp_website), the time-trap (form_duration_ms), TrustedForm,
captureUTM() and the transaction_id.

Also writes info/yt1/popup.js: a copy of apply/popup.js with only the phone
number changed. Behavior stays identical (30s delay, once per session,
re-pops 30s after close).

IDEMPOTENT
----------
The script regenerates info/yt1 from apply/2 on every run, so a second run
produces identical bytes. info/yt1 is a GENERATED directory: change this
script, then re-run. Do not hand-edit info/yt1.

RUN
---
    python3 _build_yt1_variant.py
"""
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, 'nationalbenefitalliance')
SRC = os.path.join(SITE, 'apply', '2')
DST = os.path.join(SITE, 'info', 'yt1')
SRC_POPUP = os.path.join(SITE, 'apply', 'popup.js')
DST_POPUP = os.path.join(DST, 'popup.js')

# The one YouTube line. Funnel header pill, thank-you call button, thank-you-2
# fallback button and the popup all dial this, so every call from this URL is
# a YouTube call.
YT_TEL = 'tel:+18883121358'
YT_DISPLAY = '1-888-312-1358'

PAGES = [
    'index.html',
    'step-1-dob-citizen/index.html',
    'step-2-address/index.html',
    'step-3-income-employ/index.html',
    'step-4-contact/index.html',
    'thank-you/index.html',
    'thank-you-2/index.html',
]

# (label, old, new, required_on_at_least_one_page)
# Order is safe: no `old` string is a substring of another `old` string, and
# no `new` string reintroduces an earlier `old`.
RULES = [
    # Internal navigation + JS redirects must stay inside the clone.
    ('nav path',        '/apply/2/',                '/info/yt1/',            True),
    # Started-funnel line -> YouTube line (header pill + thank-you-2 fallback).
    ('started tel',     'tel:+18135569954',         YT_TEL,                  True),
    ('started display', '1-813-556-9954',           YT_DISPLAY,              True),
    # Completed-funnel line -> YouTube line (thank-you ty-call-btn).
    ('completed tel',   'tel:+18135608063',         YT_TEL,                  True),
    ('completed display', '1-813-560-8063',         YT_DISPLAY,              True),
    # Dedicated popup copy, so popup calls are attributed to YouTube too.
    ('popup src',       '/apply/popup.js',          '/info/yt1/popup.js',    True),
    # Backend identifier, so leads are separable in Supabase / CallTools.
    ('landing_page',    "landing_page: 'apply2'",   "landing_page: 'yt1'",   True),
]

# Nothing from the Google funnel may survive in the clone.
FORBIDDEN = [
    '/apply/2/', 'tel:+18135569954', '1-813-556-9954',
    'tel:+18135608063', '1-813-560-8063',
    'tel:+18135569953', '1-813-556-9953',   # shared popup line
    "landing_page: 'apply2'",
]


def build_pages():
    counts = {label: 0 for label, _, _, _ in RULES}
    for rel in PAGES:
        src = os.path.join(SRC, rel)
        dst = os.path.join(DST, rel)
        if not os.path.exists(src):
            sys.exit('MISSING SOURCE: %s' % src)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(src, encoding='utf-8') as f:
            s = f.read()
        for label, old, new, _req in RULES:
            n = s.count(old)
            if n:
                s = s.replace(old, new)
                counts[label] += n
        for bad in FORBIDDEN:
            if bad in s:
                sys.exit('LEFTOVER apply/2 string %r in %s' % (bad, rel))
        with open(dst, 'w', encoding='utf-8') as f:
            f.write(s)
        print('  wrote info/yt1/%s' % rel)
    for label, _old, _new, req in RULES:
        if req and counts[label] == 0:
            sys.exit('NO MATCH: rule %r never matched. apply/2 changed shape.'
                     % label)
    print('\n  substitutions: %s'
          % ', '.join('%s=%d' % (k, v) for k, v in counts.items()))


def build_popup():
    """Number-only fork of apply/popup.js. Behavior must stay identical."""
    with open(SRC_POPUP, encoding='utf-8') as f:
        s = f.read()
    for old, new in [
        ("var PHONE_DISPLAY = '1-813-556-9953';",
         "var PHONE_DISPLAY = '%s';" % YT_DISPLAY),
        ("var PHONE_TEL = 'tel:+18135569953';",
         "var PHONE_TEL = '%s';" % YT_TEL),
    ]:
        if old not in s:
            sys.exit('NO MATCH in apply/popup.js: %r' % old)
        s = s.replace(old, new)
    with open(DST_POPUP, 'w', encoding='utf-8') as f:
        f.write(s)
    print('  wrote info/yt1/popup.js')


if __name__ == '__main__':
    if os.path.isdir(DST):
        shutil.rmtree(DST)
    os.makedirs(DST)
    print('Building /info/yt1/ from /apply/2/ ...')
    build_pages()
    build_popup()
    print('\nDone. 7 pages + popup.js. Point YouTube ads at /info/yt1/')
