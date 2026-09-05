#!/usr/bin/env python3
"""
Pipeline field parity, funnel side (idempotent).

Backend branch `pipeline-field-parity` added columns + CRM plumbing for fields the
funnels already collect but never posted. This is the funnel half.

1) apply/0 CATCH-UP. The organic clone was missed by the earlier click-id pass, so
   it still posts the legacy `click_id`, captures none of the 7 newer click ids,
   and sends no `landing_page`. That is the whole of the ~10% of recent leads with
   a null landing_page. Brings it to parity with apply/2, bg1, oa1 and info/01.

2) needs[] ON ALL FIVE FUNNELS. Every landing page writes the benefit tiles
   ("what brings you here today" -> food / utility / housing / other) into
   sessionStorage.nba_funnel.needs, and no step has ever posted it. It is the
   clearest intent signal in the funnel and it reached no system. The backend
   comma-joins it, stores leads.needs, and forwards it to both CRMs.

Idempotent: every replacement is keyed on a string that only exists in the
un-migrated form, so a second run is a no-op.

Touches ONLY the JS payload/capture objects. No tel: links, no GTM, no dataLayer,
no thank-you routing, no styling.
"""
import os
import sys

ROOT = "nationalbenefitalliance"

# --- 1) apply/0 catch-up ----------------------------------------------------

# captureUTM() lives on every page of the funnel (state has to persist across steps).
OLD_ARR = ("['utm_source','utm_medium','utm_campaign','utm_content','utm_term',"
           "'gclid','wbraid','gbraid']")
NEW_ARR = ("['utm_source','utm_medium','utm_campaign','utm_content','utm_term',"
           "'gclid','wbraid','gbraid','msclkid','fbclid','oppref','ttclid',"
           "'li_fat_id','twclid','epik']")

# apply/0's submit step still uses the pre-rename `click_id`.
OLD_APPLY0_CLICK = "        click_id: data.gclid || '',"
NEW_APPLY0_CLICK = "\n".join([
    "        gclid: data.gclid || '',",
    "        msclkid: data.msclkid || '',",
    "        oppref: data.oppref || '',",
    "        fbclid: data.fbclid || '',",
    "        ttclid: data.ttclid || '',",
    "        li_fat_id: data.li_fat_id || '',",
    "        twclid: data.twclid || '',",
    "        epik: data.epik || '',",
    "        landing_page: 'apply0',",
])

# --- 2) needs[] on every submit step ----------------------------------------
# Anchor on the honeypot line: it is present in exactly one place per submit file
# (the payload object) and is identical across all five funnels.
OLD_HP = "        hp_website: document.getElementById('website').value,"
NEW_HP = "\n".join([
    "        needs: data.needs || [],",
    "        hp_website: document.getElementById('website').value,",
])

SUBMIT_FILES = [
    "apply/0/step-3-phone/index.html",
    "apply/2/step-4-contact/index.html",
    "apply/bg1/step-4-contact/index.html",
    "apply/oa1/step-4-contact/index.html",
    "info/01/step-4-name-email/index.html",
]

APPLY0_DIR = os.path.join(ROOT, "apply", "0")


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def main():
    if not os.path.isdir(ROOT):
        sys.exit("run me from the repo root (expected ./%s)" % ROOT)

    changed = []

    # 1a. captureUTM array across every apply/0 page.
    for dirpath, dirnames, filenames in os.walk(APPLY0_DIR):
        dirnames[:] = [d for d in dirnames if d not in ("node_modules", ".git")]
        for name in filenames:
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            text = read(path)
            if OLD_ARR in text:
                write(path, text.replace(OLD_ARR, NEW_ARR))
                changed.append(path + "  [captureUTM]")

    # 1b + 2. Submit payloads.
    for rel in SUBMIT_FILES:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print("  ! missing, skipped: %s" % rel)
            continue
        text = read(path)
        before = text

        if OLD_APPLY0_CLICK in text:
            text = text.replace(OLD_APPLY0_CLICK, NEW_APPLY0_CLICK)

        # Only add `needs` if this payload doesn't already carry it.
        if "needs: data.needs" not in text and OLD_HP in text:
            text = text.replace(OLD_HP, NEW_HP)

        if text != before:
            write(path, text)
            changed.append(path + "  [payload]")

    if changed:
        print("Updated %d file(s):" % len(changed))
        for c in changed:
            print("  " + c)
    else:
        print("No changes — already migrated (script is idempotent).")


if __name__ == "__main__":
    main()
