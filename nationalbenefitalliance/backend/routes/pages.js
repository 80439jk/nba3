/**
 * Page Routes — National Benefit Alliance
 * Handles all unique-URL server-side rendered pages.
 *
 * Routes:
 *   GET /                        → homepage
 *   GET /florida                 → Florida state index
 *   GET /florida/:county         → County resource page
 *   GET /search                  → ZIP search result redirect
 *   GET /about                   → About page
 *   GET /faq                     → FAQ page
 *   GET /contact                 → Contact page
 *   GET /privacy                 → Privacy policy
 *   GET /terms                   → Terms of use
 *   GET /coming-soon             → Placeholder for future states
 */

const express  = require('express');
const path     = require('path');
const FL_ZIP   = require('../data/florida-zip-county.json');
const FL_DATA  = require('../data/florida-counties.json');

module.exports = (pool) => {
  const router = express.Router();

  /* ---- helpers ---- */
  const slugToName = (slug) =>
    slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' County';

  const getCountyData = (slug) =>
    FL_DATA.counties.find(c => c.slug === slug) || null;

  const logPageView = (req, county, state) => {
    pool.query(
      `INSERT INTO page_views (path, county, state, referrer, viewed_at) VALUES ($1,$2,$3,$4,NOW())`,
      [req.path, county || null, state || null, req.get('Referrer') || null]
    ).catch(() => {});
  };

  /* --------------------------------------------------
     GET / — Homepage (serves static file)
     -------------------------------------------------- */
  router.get('/', (req, res) => {
    logPageView(req, null, null);
    res.sendFile(path.join(__dirname, '../../index.html'));
  });

  /* --------------------------------------------------
     GET /search — ZIP → county redirect
     -------------------------------------------------- */
  router.get('/search', (req, res) => {
    const zip = (req.query.zip || '').replace(/\D/g, '').slice(0, 5);
    if (!zip || zip.length !== 5) {
      return res.redirect('/?error=invalid_zip');
    }

    const county = FL_ZIP[zip];
    if (county) {
      return res.redirect(301, `/florida/${county}/`);
    }

    // ZIP not found — could be another state
    return res.redirect(`/?error=zip_not_found&zip=${zip}`);
  });

  /* --------------------------------------------------
     GET /florida — Florida state index (serves static)
     -------------------------------------------------- */
  router.get('/florida', (req, res) => res.redirect(301, '/florida/'));
  router.get('/florida/', (req, res) => {
    logPageView(req, null, 'florida');
    res.sendFile(path.join(__dirname, '../../florida/index.html'));
  });

  /* --------------------------------------------------
     GET /florida/:county — County resource page
     Serves static file if exists; falls back to 404
     -------------------------------------------------- */
  router.get('/florida/:county', (req, res) => res.redirect(301, `/florida/${req.params.county}/`));
  router.get('/florida/:county/', (req, res) => {
    const { county } = req.params;

    // Validate county slug (alphanumeric + hyphens only)
    if (!/^[a-z0-9-]+$/.test(county)) return res.redirect('/florida/');

    const countyData = getCountyData(county);
    if (!countyData) return res.redirect('/florida/');

    logPageView(req, county, 'florida');

    // Serve static file for pre-built counties (Miami-Dade, Broward, etc.)
    const staticFile = path.join(__dirname, `../../florida/${county}/index.html`);
    const fs = require('fs');

    if (fs.existsSync(staticFile)) {
      return res.sendFile(staticFile);
    }

    // Dynamic template fallback for counties without a static file
    res.send(buildCountyPage(countyData));
  });

  /* --------------------------------------------------
     GET /florida/:county/pdf — Trigger PDF download
     -------------------------------------------------- */
  router.get('/florida/:county/pdf', (req, res) => {
    const { county } = req.params;
    const pdfPath = path.join(__dirname, `../../downloads/${county}-resources.pdf`);
    const fs = require('fs');

    if (fs.existsSync(pdfPath)) {
      res.download(pdfPath, `${county}-county-resource-guide.pdf`);
    } else {
      res.status(404).send('PDF not yet available for this county. Please request via email.');
    }
  });

  /* --------------------------------------------------
     Static content pages (served from static HTML files)
     -------------------------------------------------- */
  const staticPages = ['about', 'faq', 'contact', 'privacy', 'terms', 'accessibility', 'coming-soon'];
  staticPages.forEach(page => {
    router.get(`/${page}`, (req, res) => res.redirect(301, `/${page}/`));
    router.get(`/${page}/`, (req, res) => {
      logPageView(req, null, null);
      const filePath = path.join(__dirname, `../../${page}/index.html`);
      const fs = require('fs');
      if (fs.existsSync(filePath)) return res.sendFile(filePath);
      res.redirect('/');
    });
  });

  return router;
};

/* ====================================================
   DYNAMIC COUNTY PAGE TEMPLATE
   Used for counties that don't yet have a static HTML file.
   Shares the same CSS/JS/Schema structure as Miami-Dade page.
   ==================================================== */
function buildCountyPage(county) {
  const title = county.name;
  const slug  = county.slug;
  const state = county.state || 'florida';
  const stateTitle = state.charAt(0).toUpperCase() + state.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} Benefits & Resources | Free Government Assistance – National Benefit Alliance</title>
  <meta name="description" content="Find free government and community assistance programs in ${title}, ${stateTitle}. Utility help, rental assistance, food, healthcare, unemployment, and more. Download free PDF guide."/>
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large"/>
  <link rel="canonical" href="https://nationalbenefitalliance.com/${state}/${slug}/"/>
  <meta property="og:title" content="${title} Benefits & Resources | National Benefit Alliance"/>
  <meta property="og:url" content="https://nationalbenefitalliance.com/${state}/${slug}/"/>

  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":["AdministrativeArea","Place"],
        "@id":"https://nationalbenefitalliance.com/${state}/${slug}/#place",
        "name":"${title}",
        "containedInPlace":{"@type":"State","name":"${stateTitle}"},
        "url":"https://nationalbenefitalliance.com/${state}/${slug}/",
        "geo":{"@type":"GeoCoordinates","latitude":${county.latitude || 0},"longitude":${county.longitude || 0}}
      },
      {
        "@type":"GovernmentService",
        "name":"${title} Benefits Resource Guide",
        "description":"Comprehensive guide to free government and community assistance programs in ${title}, ${stateTitle}.",
        "provider":{"@id":"https://nationalbenefitalliance.com/#organization"},
        "serviceArea":{"@id":"https://nationalbenefitalliance.com/${state}/${slug}/#place"},
        "availableChannel":{"@type":"ServiceChannel","serviceUrl":"https://nationalbenefitalliance.com/${state}/${slug}/","servicePhone":"+1-800-622-4357"}
      },
      {
        "@type":"WebPage",
        "url":"https://nationalbenefitalliance.com/${state}/${slug}/",
        "name":"${title} Benefits & Resources",
        "breadcrumb":{
          "@type":"BreadcrumbList",
          "itemListElement":[
            {"@type":"ListItem","position":1,"name":"Home","item":"https://nationalbenefitalliance.com/"},
            {"@type":"ListItem","position":2,"name":"${stateTitle}","item":"https://nationalbenefitalliance.com/${state}/"},
            {"@type":"ListItem","position":3,"name":"${title}","item":"https://nationalbenefitalliance.com/${state}/${slug}/"}
          ]
        }
      }
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/styles.css"/>
</head>
<body>

  <nav class="nav">
    <div class="nav__inner">
      <a href="/" class="nav__logo">
        <div class="nav__logo-icon">
          <svg viewBox="0 0 26 26"><path d="M13 2L3 7v6c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L13 2z" fill="#E8A020"/></svg>
        </div>
        <div class="nav__logo-text">
          <span class="nav__logo-name">National Benefit Alliance</span>
          <span class="nav__logo-tagline">Free Resource Center · All 50 States</span>
        </div>
      </a>
      <ul class="nav__links">
        <li><a href="/">Home</a></li>
        <li><a href="/${state}/" class="active">${stateTitle}</a></li>
        <li><a href="/faq/">FAQ</a></li>
      </ul>
      <div class="nav__cta">
        <a href="tel:18006224357" class="nav__phone">📞 1-800-NBA-HELP</a>
        <a href="https://apply.nationalbenefitalliance.com" class="btn btn--primary btn--sm">Apply Now</a>
      </div>
    </div>
  </nav>

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <div class="container">
      <ol class="breadcrumb__list">
        <li><a href="/">Home</a> <span class="separator">›</span></li>
        <li><a href="/${state}/">${stateTitle}</a> <span class="separator">›</span></li>
        <li><span class="current">${title}</span></li>
      </ol>
    </div>
  </nav>

  <main>
    <section class="county-hero">
      <div class="container">
        <div class="county-hero__eyebrow">📍 ${title} · ${stateTitle}</div>
        <h1>${title}<br/>Free Benefits &amp; Resources</h1>
        <p class="lead">Access verified government and community assistance programs for ${title} residents — utilities, housing, food, healthcare, employment, and more. All free.</p>
        <div class="county-hero__actions">
          <a href="#resources" class="btn btn--primary btn--lg">View All Resources</a>
          <a href="#pdf-download" class="btn btn--outline-white">📄 Download PDF Guide</a>
          <a href="tel:18006224357" class="btn btn--outline-white">📞 Get Access Code</a>
        </div>
        <div class="county-hero__meta">
          <div class="county-hero__meta-item"><span>${county.population ? county.population.toLocaleString() : 'N/A'}</span><span>Residents</span></div>
          <div class="county-hero__meta-item"><span>40+</span><span>Programs Listed</span></div>
          <div class="county-hero__meta-item"><span>9</span><span>Categories</span></div>
          <div class="county-hero__meta-item"><span>Free</span><span>PDF Download</span></div>
        </div>
      </div>
    </section>

    <section class="section resource-section" id="resources">
      <div class="container">
        <div class="page-layout">
          <div>
            <div id="access-gate" class="access-gate">
              <div class="access-gate__icon">🔐</div>
              <h3>Full Guide Access Required</h3>
              <p>Enter your free access code to unlock the complete ${title} resource guide. <strong>No code?</strong> Call <a href="tel:18006224357"><strong>1-800-NBA-HELP</strong></a> — it's free.</p>
              <form id="access-form">
                <div class="access-form">
                  <input type="text" id="access-code-input" placeholder="ENTER CODE" maxlength="8" autocomplete="off"/>
                  <button type="submit" class="btn btn--navy">Unlock →</button>
                </div>
              </form>
              <p id="code-error" style="color:var(--red);font-size:0.85rem;margin-top:0.5rem;min-height:1.2rem;"></p>
            </div>

            <div id="resources-content" style="display:none;">
              <div class="alert alert--info" style="margin-bottom:2rem;">
                <span>ℹ️</span>
                <span>This county's full resource database is being compiled. In the meantime, call <strong>211</strong> or <strong>1-800-NBA-HELP</strong> for immediate referrals.</span>
              </div>

              <!-- Statewide resources available in all FL counties -->
              <div class="resource-category">
                <div class="resource-category__header">
                  <div class="resource-category__icon">🌐</div>
                  <div><h3>Statewide Florida Resources</h3><p style="margin:0;font-size:0.85rem;color:var(--gray-600);">Available to all Florida residents including ${title}</p></div>
                </div>
                <div class="resource-list">
                  <div class="resource-item"><div class="resource-item__body">
                    <h4>ACCESS Florida — SNAP, Medicaid, TANF</h4>
                    <p>Apply for food stamps, Medicaid, and cash assistance through the Florida DCF online portal.</p>
                    <div class="resource-item__meta">
                      <a href="tel:18667622237" class="resource-item__phone">📞 1-866-762-2237</a>
                      <a href="https://www.myflorida.com/accessflorida" target="_blank" rel="noopener" class="resource-item__web">🌐 myflorida.com/accessflorida</a>
                    </div>
                  </div><div class="resource-item__actions"><span class="badge badge--green">SNAP · Medicaid</span></div></div>

                  <div class="resource-item"><div class="resource-item__body">
                    <h4>211 Florida — Community Crisis Referral</h4>
                    <p>Free 24/7 referral service connecting residents to local assistance for utilities, food, housing, healthcare, and more.</p>
                    <div class="resource-item__meta">
                      <a href="tel:211" class="resource-item__phone">📞 Dial 211</a>
                      <a href="https://www.211florida.org" target="_blank" rel="noopener" class="resource-item__web">🌐 211florida.org</a>
                    </div>
                  </div><div class="resource-item__actions"><span class="badge badge--gold">Referral</span></div></div>

                  <div class="resource-item"><div class="resource-item__body">
                    <h4>Florida DEO — Unemployment (Reemployment Assistance)</h4>
                    <p>File and manage unemployment insurance claims through the Florida Department of Economic Opportunity.</p>
                    <div class="resource-item__meta">
                      <a href="tel:18333527759" class="resource-item__phone">📞 1-833-352-7759</a>
                      <a href="https://www.connect.myflorida.com" target="_blank" rel="noopener" class="resource-item__web">🌐 connect.myflorida.com</a>
                    </div>
                  </div><div class="resource-item__actions"><span class="badge badge--navy">Unemployment</span></div></div>

                  <div class="resource-item"><div class="resource-item__body">
                    <h4>LIHEAP — Home Energy Assistance (Statewide)</h4>
                    <p>Federal energy assistance for low-income Floridians. Contact your local Community Action Agency for the ${title} LIHEAP office.</p>
                    <div class="resource-item__meta">
                      <a href="tel:18006244357" class="resource-item__phone">📞 1-800-NBA-HELP for local office</a>
                      <a href="https://www.floridacommunitydevelopment.org" target="_blank" rel="noopener" class="resource-item__web">🌐 floridacommunitydevelopment.org</a>
                    </div>
                  </div><div class="resource-item__actions"><span class="badge badge--blue">Energy</span></div></div>
                </div>
              </div>

              <div id="pdf-download" style="background:linear-gradient(135deg,#F8F9FA,#EEF1F7);border:2px solid var(--navy);border-radius:16px;padding:2.5rem;text-align:center;margin-top:3rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">📄</div>
                <h3 style="color:var(--navy);">Download the ${title} Resource Guide</h3>
                <p style="color:var(--gray-600);max-width:480px;margin:0 auto 2rem;">Get the complete county guide as a free PDF — or have it emailed to you.</p>
                <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                  <a href="/${state}/${slug}/pdf" class="btn btn--navy btn--lg" download>⬇️ Download PDF Free</a>
                  <button onclick="document.getElementById('email-form').style.display='block'" class="btn btn--outline btn--lg">📧 Email Me the Guide</button>
                </div>
                <div id="email-form" style="display:none;margin-top:1.5rem;">
                  <form style="display:flex;gap:0.75rem;max-width:400px;margin:0 auto;" onsubmit="event.preventDefault();fetch('/api/send-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.querySelector('input').value,county:'${slug}',state:'${state}'})}).then(()=>alert('Guide sent! Check your inbox.'));">
                    <input type="email" placeholder="your@email.com" style="flex:1;padding:0.85rem 1rem;border:2px solid var(--gray-200);border-radius:8px;font-size:1rem;outline:none;" required/>
                    <button type="submit" class="btn btn--primary">Send →</button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <aside class="sidebar">
            <div class="sidebar-card">
              <div class="sidebar-card__header">📞 Get Your Access Code</div>
              <div class="sidebar-card__body">
                <p style="font-size:0.875rem;color:var(--gray-600);margin-bottom:1rem;">Call our free helpline to receive your personal access code.</p>
                <a href="tel:18006224357" class="btn btn--primary btn--full">📞 1-800-NBA-HELP</a>
                <p style="font-size:0.75rem;color:var(--gray-400);text-align:center;margin-top:0.5rem;">Mon–Fri 8am–8pm · Sat 9am–5pm</p>
              </div>
            </div>
            <div class="sidebar-card">
              <div class="sidebar-card__header">🗺️ Browse ${stateTitle} Counties</div>
              <div class="sidebar-card__body">
                <a href="/${state}/" class="btn btn--outline btn--full">← All ${stateTitle} Counties</a>
              </div>
            </div>
            <div class="sidebar-card">
              <div class="sidebar-card__header">🆘 Crisis Resources</div>
              <div class="sidebar-card__body">
                <p style="font-size:0.875rem;margin-bottom:0.5rem;"><strong>📞 211</strong> — Immediate referrals</p>
                <p style="font-size:0.875rem;margin-bottom:0.5rem;"><strong>📞 988</strong> — Mental health crisis</p>
                <p style="font-size:0.875rem;"><strong>📞 311</strong> — Local county info</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__bottom" style="border-top:1px solid rgba(255,255,255,0.1);padding:1.5rem 0;margin-top:0;">
        <p>© 2024 National Benefit Alliance · <a href="/" style="color:rgba(255,255,255,0.5);">Home</a> · <a href="/${state}/" style="color:rgba(255,255,255,0.5);">${stateTitle}</a> · ${title}</p>
        <div class="footer__bottom-links"><a href="/sitemap.xml">Sitemap</a><a href="/privacy/">Privacy</a></div>
      </div>
    </div>
  </footer>

  <script src="/js/main.js" defer></script>
</body>
</html>`;
}
