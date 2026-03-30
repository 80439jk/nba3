/**
 * National Benefit Alliance — Main JavaScript
 * nationalbenefitalliance.com
 */

/* ============================================================
   ZIP CODE → COUNTY LOOKUP (Florida)
   ============================================================ */

// Comprehensive Florida ZIP-to-County mapping
const FLORIDA_ZIP_COUNTY = {
  // Miami-Dade
  "33101":"miami-dade","33102":"miami-dade","33107":"miami-dade","33109":"miami-dade",
  "33110":"miami-dade","33111":"miami-dade","33112":"miami-dade","33114":"miami-dade",
  "33116":"miami-dade","33119":"miami-dade","33121":"miami-dade","33122":"miami-dade",
  "33124":"miami-dade","33125":"miami-dade","33126":"miami-dade","33127":"miami-dade",
  "33128":"miami-dade","33129":"miami-dade","33130":"miami-dade","33131":"miami-dade",
  "33132":"miami-dade","33133":"miami-dade","33134":"miami-dade","33135":"miami-dade",
  "33136":"miami-dade","33137":"miami-dade","33138":"miami-dade","33139":"miami-dade",
  "33140":"miami-dade","33141":"miami-dade","33142":"miami-dade","33143":"miami-dade",
  "33144":"miami-dade","33145":"miami-dade","33146":"miami-dade","33147":"miami-dade",
  "33149":"miami-dade","33150":"miami-dade","33154":"miami-dade","33155":"miami-dade",
  "33156":"miami-dade","33157":"miami-dade","33158":"miami-dade","33160":"miami-dade",
  "33161":"miami-dade","33162":"miami-dade","33163":"miami-dade","33165":"miami-dade",
  "33166":"miami-dade","33167":"miami-dade","33168":"miami-dade","33169":"miami-dade",
  "33170":"miami-dade","33172":"miami-dade","33173":"miami-dade","33174":"miami-dade",
  "33175":"miami-dade","33176":"miami-dade","33177":"miami-dade","33178":"miami-dade",
  "33179":"miami-dade","33180":"miami-dade","33181":"miami-dade","33182":"miami-dade",
  "33183":"miami-dade","33184":"miami-dade","33185":"miami-dade","33186":"miami-dade",
  "33187":"miami-dade","33189":"miami-dade","33190":"miami-dade","33193":"miami-dade",
  "33194":"miami-dade","33196":"miami-dade","33197":"miami-dade","33199":"miami-dade",
  // Broward
  "33004":"broward","33009":"broward","33019":"broward","33020":"broward",
  "33021":"broward","33022":"broward","33023":"broward","33024":"broward",
  "33025":"broward","33026":"broward","33027":"broward","33028":"broward",
  "33029":"broward","33060":"broward","33062":"broward","33063":"broward",
  "33064":"broward","33065":"broward","33066":"broward","33067":"broward",
  "33068":"broward","33069":"broward","33071":"broward","33072":"broward",
  "33073":"broward","33076":"broward","33301":"broward","33304":"broward",
  "33305":"broward","33306":"broward","33308":"broward","33309":"broward",
  "33310":"broward","33311":"broward","33312":"broward","33313":"broward",
  "33314":"broward","33315":"broward","33316":"broward","33317":"broward",
  "33319":"broward","33321":"broward","33322":"broward","33323":"broward",
  "33324":"broward","33325":"broward","33326":"broward","33327":"broward",
  "33328":"broward","33329":"broward","33330":"broward","33331":"broward",
  "33332":"broward","33334":"broward","33388":"broward","33441":"broward",
  "33442":"broward","33443":"broward",
  // Palm Beach
  "33401":"palm-beach","33402":"palm-beach","33403":"palm-beach","33404":"palm-beach",
  "33405":"palm-beach","33406":"palm-beach","33407":"palm-beach","33408":"palm-beach",
  "33409":"palm-beach","33410":"palm-beach","33411":"palm-beach","33412":"palm-beach",
  "33413":"palm-beach","33414":"palm-beach","33415":"palm-beach","33416":"palm-beach",
  "33417":"palm-beach","33418":"palm-beach","33419":"palm-beach","33420":"palm-beach",
  "33421":"palm-beach","33422":"palm-beach","33424":"palm-beach","33425":"palm-beach",
  "33426":"palm-beach","33427":"palm-beach","33428":"palm-beach","33430":"palm-beach",
  "33431":"palm-beach","33432":"palm-beach","33433":"palm-beach","33434":"palm-beach",
  "33435":"palm-beach","33436":"palm-beach","33437":"palm-beach","33438":"palm-beach",
  "33440":"palm-beach","33444":"palm-beach","33445":"palm-beach","33446":"palm-beach",
  "33447":"palm-beach","33448":"palm-beach","33449":"palm-beach","33450":"palm-beach",
  "33451":"palm-beach","33452":"palm-beach","33454":"palm-beach","33458":"palm-beach",
  "33460":"palm-beach","33461":"palm-beach","33462":"palm-beach","33463":"palm-beach",
  "33464":"palm-beach","33465":"palm-beach","33466":"palm-beach","33467":"palm-beach",
  "33468":"palm-beach","33469":"palm-beach","33470":"palm-beach","33471":"palm-beach",
  "33472":"palm-beach","33473":"palm-beach","33474":"palm-beach","33476":"palm-beach",
  "33477":"palm-beach","33478":"palm-beach","33480":"palm-beach","33481":"palm-beach",
  "33482":"palm-beach","33483":"palm-beach","33484":"palm-beach","33486":"palm-beach",
  "33487":"palm-beach","33488":"palm-beach","33493":"palm-beach","33496":"palm-beach",
  "33497":"palm-beach","33498":"palm-beach","33499":"palm-beach",
  // Orange
  "32801":"orange","32802":"orange","32803":"orange","32804":"orange",
  "32805":"orange","32806":"orange","32807":"orange","32808":"orange",
  "32809":"orange","32810":"orange","32811":"orange","32812":"orange",
  "32814":"orange","32815":"orange","32816":"orange","32817":"orange",
  "32818":"orange","32819":"orange","32820":"orange","32821":"orange",
  "32822":"orange","32824":"orange","32825":"orange","32826":"orange",
  "32827":"orange","32828":"orange","32829":"orange","32830":"orange",
  "32831":"orange","32832":"orange","32833":"orange","32834":"orange",
  "32835":"orange","32836":"orange","32837":"orange","32839":"orange",
  "34714":"orange","34734":"orange","34760":"orange","34761":"orange",
  "34777":"orange","34778":"orange",
  // Hillsborough
  "33510":"hillsborough","33511":"hillsborough","33527":"hillsborough","33534":"hillsborough",
  "33547":"hillsborough","33548":"hillsborough","33549":"hillsborough","33556":"hillsborough",
  "33558":"hillsborough","33559":"hillsborough","33563":"hillsborough","33565":"hillsborough",
  "33566":"hillsborough","33567":"hillsborough","33568":"hillsborough","33569":"hillsborough",
  "33570":"hillsborough","33571":"hillsborough","33572":"hillsborough","33573":"hillsborough",
  "33574":"hillsborough","33578":"hillsborough","33579":"hillsborough","33583":"hillsborough",
  "33584":"hillsborough","33586":"hillsborough","33587":"hillsborough","33592":"hillsborough",
  "33594":"hillsborough","33595":"hillsborough","33596":"hillsborough","33597":"hillsborough",
  "33601":"hillsborough","33602":"hillsborough","33603":"hillsborough","33604":"hillsborough",
  "33605":"hillsborough","33606":"hillsborough","33607":"hillsborough","33608":"hillsborough",
  "33609":"hillsborough","33610":"hillsborough","33611":"hillsborough","33612":"hillsborough",
  "33613":"hillsborough","33614":"hillsborough","33615":"hillsborough","33616":"hillsborough",
  "33617":"hillsborough","33618":"hillsborough","33619":"hillsborough","33620":"hillsborough",
  "33621":"hillsborough","33624":"hillsborough","33625":"hillsborough","33626":"hillsborough",
  "33629":"hillsborough","33634":"hillsborough","33635":"hillsborough","33637":"hillsborough",
  "33647":"hillsborough",
  // Pinellas
  "33701":"pinellas","33702":"pinellas","33703":"pinellas","33704":"pinellas",
  "33705":"pinellas","33706":"pinellas","33707":"pinellas","33708":"pinellas",
  "33709":"pinellas","33710":"pinellas","33711":"pinellas","33712":"pinellas",
  "33713":"pinellas","33714":"pinellas","33715":"pinellas","33716":"pinellas",
  "33730":"pinellas","33755":"pinellas","33756":"pinellas","33759":"pinellas",
  "33760":"pinellas","33761":"pinellas","33762":"pinellas","33763":"pinellas",
  "33764":"pinellas","33765":"pinellas","33766":"pinellas","33767":"pinellas",
  "33770":"pinellas","33771":"pinellas","33772":"pinellas","33773":"pinellas",
  "33774":"pinellas","33775":"pinellas","33776":"pinellas","33777":"pinellas",
  "33778":"pinellas","33779":"pinellas","33780":"pinellas","33781":"pinellas",
  "33782":"pinellas","33785":"pinellas","33786":"pinellas",
  // Duval (Jacksonville)
  "32099":"duval","32201":"duval","32202":"duval","32203":"duval","32204":"duval",
  "32205":"duval","32206":"duval","32207":"duval","32208":"duval","32209":"duval",
  "32210":"duval","32211":"duval","32212":"duval","32214":"duval","32216":"duval",
  "32217":"duval","32218":"duval","32219":"duval","32220":"duval","32221":"duval",
  "32222":"duval","32223":"duval","32224":"duval","32225":"duval","32226":"duval",
  "32227":"duval","32228":"duval","32229":"duval","32231":"duval","32232":"duval",
  "32233":"duval","32234":"duval","32235":"duval","32236":"duval","32237":"duval",
  "32238":"duval","32239":"duval","32240":"duval","32241":"duval","32244":"duval",
  "32245":"duval","32246":"duval","32247":"duval","32250":"duval","32254":"duval",
  "32255":"duval","32256":"duval","32257":"duval","32258":"duval","32259":"duval",
  "32266":"duval","32277":"duval",
  // Lee (Fort Myers)
  "33901":"lee","33902":"lee","33903":"lee","33904":"lee","33905":"lee",
  "33906":"lee","33907":"lee","33908":"lee","33909":"lee","33910":"lee",
  "33912":"lee","33913":"lee","33914":"lee","33915":"lee","33916":"lee",
  "33917":"lee","33919":"lee","33920":"lee","33921":"lee","33922":"lee",
  "33924":"lee","33928":"lee","33931":"lee","33932":"lee","33936":"lee",
  "33944":"lee","33945":"lee","33946":"lee","33947":"lee","33948":"lee",
  "33950":"lee","33951":"lee","33952":"lee","33953":"lee","33954":"lee",
  "33955":"lee","33956":"lee","33957":"lee","33960":"lee","33965":"lee",
  "33966":"lee","33967":"lee","33971":"lee","33972":"lee","33973":"lee",
  "33974":"lee","33976":"lee","33990":"lee","33991":"lee","33993":"lee","33994":"lee",
  // Polk (Lakeland)
  "33801":"polk","33802":"polk","33803":"polk","33804":"polk","33805":"polk",
  "33806":"polk","33807":"polk","33809":"polk","33810":"polk","33811":"polk",
  "33812":"polk","33813":"polk","33815":"polk","33823":"polk","33825":"polk",
  "33827":"polk","33830":"polk","33831":"polk","33835":"polk","33836":"polk",
  "33837":"polk","33838":"polk","33839":"polk","33840":"polk","33841":"polk",
  "33843":"polk","33844":"polk","33845":"polk","33846":"polk","33847":"polk",
  "33848":"polk","33849":"polk","33850":"polk","33851":"polk","33853":"polk",
  "33855":"polk","33856":"polk","33859":"polk","33860":"polk","33863":"polk",
  "33868":"polk","33877":"polk","33880":"polk","33881":"polk","33882":"polk",
  "33883":"polk","33884":"polk","33885":"polk","33888":"polk",
  // Brevard (Melbourne)
  "32901":"brevard","32902":"brevard","32903":"brevard","32904":"brevard",
  "32905":"brevard","32906":"brevard","32907":"brevard","32908":"brevard",
  "32909":"brevard","32910":"brevard","32911":"brevard","32912":"brevard",
  "32919":"brevard","32920":"brevard","32922":"brevard","32923":"brevard",
  "32924":"brevard","32925":"brevard","32926":"brevard","32927":"brevard",
  "32931":"brevard","32932":"brevard","32934":"brevard","32935":"brevard",
  "32936":"brevard","32937":"brevard","32940":"brevard","32941":"brevard",
  "32949":"brevard","32950":"brevard","32951":"brevard","32952":"brevard",
  "32953":"brevard","32954":"brevard","32955":"brevard","32956":"brevard",
  "32957":"brevard","32958":"brevard","32959":"brevard","32976":"brevard",
};

const COUNTY_NAMES = {
  "miami-dade": "Miami-Dade County",
  "broward": "Broward County",
  "palm-beach": "Palm Beach County",
  "orange": "Orange County",
  "hillsborough": "Hillsborough County",
  "pinellas": "Pinellas County",
  "duval": "Duval County",
  "lee": "Lee County",
  "polk": "Polk County",
  "brevard": "Brevard County",
  "volusia": "Volusia County",
  "seminole": "Seminole County",
  "pasco": "Pasco County",
  "manatee": "Manatee County",
  "sarasota": "Sarasota County",
  "collier": "Collier County",
  "st-lucie": "St. Lucie County",
  "marion": "Marion County",
  "alachua": "Alachua County",
  "escambia": "Escambia County",
  "leon": "Leon County",
};

/**
 * Look up a Florida county by ZIP code
 */
function lookupZip(zip) {
  const clean = zip.replace(/\D/g, '').slice(0, 5);
  return FLORIDA_ZIP_COUNTY[clean] || null;
}

/**
 * Handle ZIP form submission
 */
function handleZipSubmit(e) {
  e && e.preventDefault();
  const input = document.getElementById('zip-input');
  if (!input) return;
  const zip = input.value.trim();

  if (!/^\d{5}$/.test(zip)) {
    showZipError('Please enter a valid 5-digit ZIP code.');
    return;
  }

  const county = lookupZip(zip);
  if (county) {
    // For prototype: redirect to county page
    window.location.href = `/florida/${county}/index.html`;
  } else {
    // ZIP not found — could be other state or unrecognized
    showZipError('ZIP code not found in our Florida database. <a href="/florida/">Browse all Florida counties →</a>');
  }
}

function showZipError(msg) {
  let err = document.getElementById('zip-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'zip-error';
    err.style.cssText = 'color:#DC3545;font-size:0.85rem;margin-top:0.5rem;';
    const group = document.querySelector('.zip-input-group');
    if (group) group.parentNode.insertBefore(err, group.nextSibling);
  }
  err.innerHTML = msg;
  setTimeout(() => { if (err) err.innerHTML = ''; }, 5000);
}

/* ---- ZIP input: numbers only, max 5 digits ---- */
document.addEventListener('DOMContentLoaded', () => {
  const zipInput = document.getElementById('zip-input');
  if (zipInput) {
    zipInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    });
    zipInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleZipSubmit(e);
    });
  }

  // Bind form submit
  const zipForm = document.getElementById('zip-form');
  if (zipForm) zipForm.addEventListener('submit', handleZipSubmit);

  // Mobile nav toggle
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px'; navLinks.style.left = '0'; navLinks.style.right = '0';
      navLinks.style.background = '#fff'; navLinks.style.padding = '1rem';
      navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    });
  }

  // Animate elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.style.opacity = '1';
        el.target.style.transform = 'translateY(0)';
        observer.unobserve(el.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step, .category-card, .county-highlight').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

/* ============================================================
   ACCESS CODE VALIDATION
   ============================================================ */
function validateAccessCode(code) {
  // In production: API call to backend
  // For prototype: simple format check (6 alphanumeric chars)
  return /^[A-Z0-9]{6,8}$/.test(code.toUpperCase());
}

function handleAccessSubmit(e) {
  e && e.preventDefault();
  const input = document.getElementById('access-code-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (validateAccessCode(code)) {
    // In production: POST to /api/verify-code
    document.getElementById('access-gate').style.display = 'none';
    document.getElementById('resources-content').style.display = 'block';
    sessionStorage.setItem('nba_access_code', code);
    sessionStorage.setItem('nba_access_time', Date.now());
  } else {
    const err = document.getElementById('code-error');
    if (err) err.textContent = 'Invalid code. Please call our office at 1-800-NBA-HELP to get your access code.';
  }
}

// Check if user already has valid session access
window.addEventListener('DOMContentLoaded', () => {
  const code = sessionStorage.getItem('nba_access_code');
  const time = sessionStorage.getItem('nba_access_time');
  if (code && time && (Date.now() - parseInt(time)) < 3600000) { // 1 hour
    const gate = document.getElementById('access-gate');
    const content = document.getElementById('resources-content');
    if (gate && content) { gate.style.display = 'none'; content.style.display = 'block'; }
  }

  const accessForm = document.getElementById('access-form');
  if (accessForm) accessForm.addEventListener('submit', handleAccessSubmit);

  // Access code input: uppercase
  const codeInput = document.getElementById('access-code-input');
  if (codeInput) {
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    });
  }
});

/* ============================================================
   COUNTY PAGE: DOWNLOAD / EMAIL PDF
   ============================================================ */
function requestPdfEmail(county, state, email) {
  // In production: POST to /api/send-pdf
  fetch('/api/send-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ county, state, email })
  }).then(r => r.json()).then(data => {
    if (data.success) {
      alert(`Resource guide sent to ${email}! Check your inbox.`);
    }
  }).catch(() => {
    alert('Email queued. You will receive your resource guide shortly.');
  });
}

/* ============================================================
   COUNTER ANIMATION (for stats)
   ============================================================ */
function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const isFloat = target % 1 !== 0;
  const suffix = el.dataset.suffix || '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Initialize counters when visible
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
});
