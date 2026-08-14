#!/usr/bin/env python3
"""
Build the /apply/4/ lean-funnel A/B variant from the apply/2 clone already
copied into place. Idempotent: each replacement is anchored on unique apply/2
text, so a second run is a no-op (the anchors are gone after the first run).

Funnel: Landing(needs) -> step-1-dob(DOB) -> step-2-zip(ZIP) ->
        step-3-phone(phone) -> step-4-name-email(name/email + SUBMIT) -> thank-you

Reuses apply/2 machinery verbatim; only strips fields + repoints navigation.
"""
import os, sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                    'nationalbenefitalliance', 'apply', '4')

applied = []

def load(rel):
    with open(os.path.join(BASE, rel), encoding='utf-8') as f:
        return f.read()

def save(rel, s):
    with open(os.path.join(BASE, rel), 'w', encoding='utf-8') as f:
        f.write(s)

def rep(tag, s, old, new, required=True, count=1):
    """Replace `old` with `new` up to `count` times. Assert it matched."""
    n = s.count(old)
    if n == 0:
        if required:
            sys.exit('NO MATCH (%s): anchor not found' % tag)
        applied.append('%s: SKIP (already applied)' % tag)
        return s
    s = s.replace(old, new, count)
    applied.append('%s: %d' % (tag, min(n, count)))
    return s

ZIP_TO_STATE = r"""// ---- Derive USPS state from ZIP (state field removed from this variant;
// backend + CRM still want a state, so we backfill from the ZIP's first 3
// digits). Same map used by /apply/3. Approximate at a few prefix boundaries;
// state is not load-bearing for the CRM. ----
function zipToState(zip) {
  var z = parseInt(String(zip || '').replace(/\D/g, '').slice(0, 3), 10);
  if (isNaN(z)) return '';
  var R = [
    [6,9,'PR'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],
    [50,54,'VT'],[55,55,'MA'],[56,59,'VT'],[60,69,'CT'],[70,89,'NJ'],
    [100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,205,'DC'],
    [206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],
    [290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],
    [370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],
    [430,459,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],
    [530,549,'WI'],[550,567,'MN'],[570,577,'SD'],[580,588,'ND'],
    [590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],
    [680,693,'NE'],[700,714,'LA'],[716,729,'AR'],[730,749,'OK'],
    [750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],
    [840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[889,899,'NV'],
    [900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],
    [995,999,'AK']
  ];
  for (var i = 0; i < R.length; i++) { if (z >= R[i][0] && z <= R[i][1]) return R[i][2]; }
  return '';
}
"""

# ============================================================
# 1) LANDING  (index.html) — needs only, state removed
# ============================================================
s = load('index.html')

# 1a. Drop the "1" step badge (no step "2" section anymore)
s = rep('land.badge', s,
    '''          <div class="hero__card-header">
            <div class="hero__card-step">1</div>
            <h2 class="hero__card-title">What brings you here today?</h2>
          </div>''',
    '''          <div class="hero__card-header">
            <h2 class="hero__card-title">What brings you here today?</h2>
          </div>''')

# 1b. Remove the whole "Where do you live?" state section (divider + header +
#     select-wrap) and replace with a Continue CTA + inline error. The block runs
#     from the divider up to (not including) the trust row.
land_start = '          <hr class="hero__card-divider">'
land_end = '          <div class="hero__card-trust">'
i0 = s.index(land_start)
i1 = s.index(land_end)
state_block = s[i0:i1]
assert 'id="heroState"' in state_block, 'landing state block boundary wrong'
cta_block = '''          <button type="button" id="heroContinue" class="hero__form-btn">See Available Programs</button>
          <div class="hero__form-error" id="needsError">Please pick at least one so we can match you.</div>

'''
s = s[:i0] + cta_block + s[i1:]
applied.append('land.state-section-removed: 1')

# 1c. Remove the pageshow handler that reset #heroState (no select now)
s = rep('land.pageshow', s,
    '''
// ---- Reset the state dropdown every time the lander is shown, INCLUDING
// bfcache restores when the user taps Back from step 1. Without this, the
// select comes back from cache with the previous state still selected, so
// reselecting the SAME state fires no 'change' event and the user is stuck
// with no way to advance again. Clearing it forces a fresh pick that
// auto-advances. The saved state in nba_funnel is overwritten on reselect.
window.addEventListener('pageshow', function() {
  var s = document.getElementById('heroState');
  if (s) s.value = '';
});
''', '\n')

# 1d. Replace the state auto-advance with a needs -> Continue-button advance
s = rep('land.advance', s,
    '''  // ---- State dropdown: auto-advance ----
  var sel = document.getElementById('heroState');
  if (sel) {
    sel.addEventListener('change', function() {
      if (!this.value) return;
      var needs = [];
      document.querySelectorAll('.hero__tile input:checked').forEach(function(cb) {
        needs.push(cb.value);
      });
      saveFunnelData({ state: this.value, needs: needs });
      window.location.href = '/apply/2/step-1-dob-citizen/';
    });
  }
''',
    '''  // ---- Continue button: require >=1 need, save, advance ----
  var cont = document.getElementById('heroContinue');
  var err = document.getElementById('needsError');
  if (cont) {
    cont.addEventListener('click', function() {
      var needs = [];
      document.querySelectorAll('.hero__tile input:checked').forEach(function(cb) {
        needs.push(cb.value);
      });
      if (!needs.length) { if (err) err.classList.add('show'); return; }
      if (err) err.classList.remove('show');
      saveFunnelData({ needs: needs });
      window.location.href = '/apply/4/step-1-dob/';
    });
  }
''')
save('index.html', s)

# ============================================================
# 2) STEP 1 — DOB (drop citizenship)  step-1-dob/index.html
# ============================================================
s = load('step-1-dob/index.html')

# 2a. Remove the citizenship field
s = rep('dob.field', s,
    '''
        <div class="form-group">
          <label for="citizenship" class="form-label">Citizenship Status</label>
          <select name="citizenship" id="citizenship" class="form-select" required>
            <option value="">Select one</option>
            <option value="us_citizen">U.S. Citizen</option>
            <option value="non_citizen_legal">Non-Citizen legally admitted to the U.S.</option>
            <option value="other">Other</option>
          </select>
          <div class="form-error">Please select your citizenship status</div>
        </div>
''', '')

# 2b. Back link -> /apply/4/
s = rep('dob.back', s, '<a href="/apply/2/" class="btn btn-back">Back</a>',
                       '<a href="/apply/4/" class="btn btn-back">Back</a>')

# 2c. Restore no longer restores citizenship
s = rep('dob.restore', s, "    restoreField('citizenship');\n", '')

# 2d. Drop citizenship var + validation, save only DOB, advance to step-2-zip
s = rep('dob.submit', s,
    '''      const dob = document.getElementById('dob');
      const cit = document.getElementById('citizenship');
      const dobMatch''',
    '''      const dob = document.getElementById('dob');
      const dobMatch''')
s = rep('dob.validate', s,
    "      if (!cit.value) { showError(cit, 'Please select your citizenship status'); valid = false; }\n", '')
s = rep('dob.save', s,
    "      saveFunnelData({ dob: isoDob, dobDisplay: dob.value, citizenship: cit.value });\n"
    "      window.location.href = '/apply/2/step-2-address/';",
    "      saveFunnelData({ dob: isoDob, dobDisplay: dob.value });\n"
    "      window.location.href = '/apply/4/step-2-zip/';")
save('step-1-dob/index.html', s)

# ============================================================
# 3) STEP 2 — ZIP only  step-2-zip/index.html
# ============================================================
s = load('step-2-zip/index.html')

# 3a. Title + reassurance
s = rep('zip.title', s,
    '<h1 class="form-title">Where Do You Live?</h1>',
    '<h1 class="form-title">What\'s your ZIP code?</h1>\n      <p class="security-note" style="text-align:center;margin:-0.25rem 0 1.25rem;">Programs vary by location — this is how we find yours.</p>')

# 3b. Remove street + city fields (keep ZIP)
s = rep('zip.fields', s,
    '''        <div class="form-group">
          <label for="streetAddress" class="form-label">Street Address</label>
          <input type="text" name="streetAddress" id="streetAddress" class="form-input" placeholder="123 Main St" required />
          <div class="form-error">Please enter your street address</div>
        </div>

        <div class="form-group">
          <label for="city" class="form-label">City</label>
          <input type="text" name="city" id="city" class="form-input" placeholder="New York" required />
          <div class="form-error">Please enter your city</div>
        </div>

''', '')

# 3c. Back link -> step-1-dob
s = rep('zip.back', s,
    '<a href="/apply/2/step-1-dob-citizen/" class="btn btn-back">Back</a>',
    '<a href="/apply/4/step-1-dob/" class="btn btn-back">Back</a>')

# 3d. Restore only zip
s = rep('zip.restore', s,
    "    ['streetAddress','city','zip'].forEach(restoreField);",
    "    ['zip'].forEach(restoreField);")

# 3e. Submit: validate only ZIP, save only zip, advance to step-3-phone
s = rep('zip.submit', s,
    '''      const street = document.getElementById('streetAddress');
      const city = document.getElementById('city');
      const zip = document.getElementById('zip');
      if (!street.value.trim()) { showError(street, 'Please enter your street address'); valid = false; }
      if (!city.value.trim()) { showError(city, 'Please enter your city'); valid = false; }
      if (!/^\\d{5}$/.test(zip.value)) { showError(zip, 'Please enter a valid 5-digit ZIP'); valid = false; }
      if (!valid) return;
      saveFunnelData({ streetAddress: street.value.trim(), city: city.value.trim(), zip: zip.value });
      window.location.href = '/apply/2/step-3-income-employ/';''',
    '''      const zip = document.getElementById('zip');
      if (!/^\\d{5}$/.test(zip.value)) { showError(zip, 'Please enter a valid 5-digit ZIP'); valid = false; }
      if (!valid) return;
      saveFunnelData({ zip: zip.value });
      window.location.href = '/apply/4/step-3-phone/';''')
save('step-2-zip/index.html', s)

# ============================================================
# 4) STEP 3 — PHONE only  step-3-phone/index.html
#    (copied from apply/2 contact step; strip to phone + Continue, no submit)
# ============================================================
s = load('step-3-phone/index.html')

# 4a. Progress 100% -> 75%, "Step 4 of 4" -> "Step 3 of 4"
s = rep('phone.prog1', s, '<span class="progress-row__left">Step 4 of 4</span>',
                          '<span class="progress-row__left">Step 3 of 4</span>')
s = rep('phone.prog2', s, '<span class="progress-row__right">100% complete</span>',
                          '<span class="progress-row__right">75% complete</span>')
s = rep('phone.prog3', s, '<div class="progress-fill" style="width: 100%;"></div>',
                          '<div class="progress-fill" style="width: 75%;"></div>')

# 4b. Replace the whole form (name/email/phone/tcpa/honeypot/TF/submit) with phone-only
old_form_start = '      <h1 class="form-title">Contact Information</h1>'
old_form_end = '      </form>\n    </div>\n  </main>'
i0 = s.index(old_form_start)
i1 = s.index(old_form_end) + len('      </form>')
assert 'id="tcpaConsent"' in s[i0:i1], 'phone form boundary wrong'
new_form = '''      <h1 class="form-title">What's the best number to reach you?</h1>
      <p class="security-note" style="text-align:center;margin:-0.25rem 0 1.25rem;">We will never call you without your permission.</p>

      <form id="phoneForm" novalidate>
        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <input type="tel" name="phone" id="phone" class="form-input" placeholder="(XXX) XXX-XXXX" required />
          <div class="form-error">Please enter a valid phone number</div>
        </div>

        <div class="form-actions">
          <a href="/apply/4/step-2-zip/" class="btn btn-back">Back</a>
          <button type="submit" class="btn btn-next">Continue</button>
        </div>
        <p class="security-note">No credit check. No commitment. Just a free phone call.</p>
        <p class="security-note">Your information is secure and will only be used to match you with relevant programs.</p>
      </form>'''
s = s[:i0] + new_form + s[i1:]
applied.append('phone.form: 1')

# 4c. Replace the phone-step behaviour script (formatting kept; submit -> Continue)
old_script_start = '  <script>\n  // Phone formatting'
old_script_end = '  </script>\n  <script src="/apply/popup.js"></script>'
i0 = s.index(old_script_start)
i1 = s.index(old_script_end) + len('  </script>')
assert 'submit-lead' in s[i0:i1], 'phone script boundary wrong'
new_script = '''  <script>
  // Phone formatting
  document.getElementById('phone').addEventListener('input', function() {
    let v = this.value.replace(/\\D/g, '');
    if (v.length > 10) v = v.slice(0, 10);
    if (v.length >= 7) this.value = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6);
    else if (v.length >= 4) this.value = '(' + v.slice(0,3) + ') ' + v.slice(3);
    else if (v.length > 0) this.value = '(' + v;
  });

  document.addEventListener('DOMContentLoaded', function() {
    restoreField('phone');
    document.getElementById('phoneForm').addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();
      const phone = document.getElementById('phone');
      const phoneDigits = phone.value.replace(/\\D/g, '');
      const phoneError = validatePhone(phoneDigits);
      if (phoneError) { showError(phone, phoneError); return; }
      saveFunnelData({ phone: phoneDigits });
      window.location.href = '/apply/4/step-4-name-email/';
    });
  });
  </script>'''
s = s[:i0] + new_script + s[i1:]
applied.append('phone.script: 1')
save('step-3-phone/index.html', s)

# ============================================================
# 5) STEP 4 — NAME/EMAIL + SUBMIT  step-4-name-email/index.html
#    (copied from apply/2 contact step; drop phone field, keep submit)
# ============================================================
s = load('step-4-name-email/index.html')

# 5a. Title
s = rep('ne.title', s, '<h1 class="form-title">Contact Information</h1>',
                       '<h1 class="form-title">Last step — where should we send your match?</h1>')

# 5b. Remove the phone input field (phone already captured on step 3)
s = rep('ne.phonefield', s,
    '''
        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <input type="tel" name="phone" id="phone" class="form-input" placeholder="(XXX) XXX-XXXX" required />
          <div class="form-error">Please enter a valid phone number</div>
        </div>
''', '')

# 5c. Back link -> step-3-phone
s = rep('ne.back', s,
    '<a href="/apply/2/step-3-income-employ/" class="btn btn-back">Back</a>',
    '<a href="/apply/4/step-3-phone/" class="btn btn-back">Back</a>')

# 5d. Add zipToState() helper (before "Restore saved values" in first script)
s = rep('ne.ziptostate', s,
    '// ---- Restore saved values ----\nfunction restoreField(name) {',
    ZIP_TO_STATE + '// ---- Restore saved values ----\nfunction restoreField(name) {')

# 5e. Remove the phone-formatting listener (no phone input on this page)
s = rep('ne.phonefmt', s,
    '''  <script>
  // Phone formatting
  document.getElementById('phone').addEventListener('input', function() {
    let v = this.value.replace(/\\D/g, '');
    if (v.length > 10) v = v.slice(0, 10);
    if (v.length >= 7) this.value = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6);
    else if (v.length >= 4) this.value = '(' + v.slice(0,3) + ') ' + v.slice(3);
    else if (v.length > 0) this.value = '(' + v;
  });

  document.addEventListener('DOMContentLoaded', function() {
    ['firstName','lastName','email','phone'].forEach(restoreField);''',
    '''  <script>
  document.addEventListener('DOMContentLoaded', function() {
    ['firstName','lastName','email'].forEach(restoreField);''')

# 5f. Drop the phone var + phone validation from the submit handler
s = rep('ne.phonevar', s,
    '''      const phone = document.getElementById('phone');
      const tcpa = document.getElementById('tcpaConsent');''',
    '''      const tcpa = document.getElementById('tcpaConsent');''')
s = rep('ne.phoneval', s,
    '''      const phoneDigits = phone.value.replace(/\\D/g, '');
      const phoneError = validatePhone(phoneDigits);
      if (phoneError) { showError(phone, phoneError); valid = false; }
''', '')

# 5g. Save block: phone comes from session now, not this page
s = rep('ne.save', s,
    '''      saveFunnelData({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        phone: phoneDigits,
        tcpaConsent: tcpa.checked
      });''',
    '''      saveFunnelData({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        tcpaConsent: tcpa.checked
      });''')

# 5h. Backfill state from ZIP in the payload
s = rep('ne.state', s, "        state: data.state || '',",
                       "        state: data.state || zipToState(data.zip) || '',")

# 5i. Repoint thank-you redirects to /apply/4/
s = rep('ne.ty', s,
    "window.location.href = crmAccepted ? '/apply/2/thank-you/' : '/apply/2/thank-you-2/';",
    "window.location.href = crmAccepted ? '/apply/4/thank-you/' : '/apply/4/thank-you-2/';")
save('step-4-name-email/index.html', s)

# ============================================================
# 6) THANK-YOU pages — repoint any internal /apply/2/ links to /apply/4/
#    (phone numbers + ty-call-btn stay identical to apply/2 on purpose)
# ============================================================
for rel in ('thank-you/index.html', 'thank-you-2/index.html'):
    s = load(rel)
    before = s
    s = s.replace('/apply/2/', '/apply/4/')
    if s != before:
        applied.append('%s: repointed /apply/2/ links' % rel)
    save(rel, s)

print('\n'.join(applied))
print('\nDONE.')
