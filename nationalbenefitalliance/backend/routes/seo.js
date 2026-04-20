/**
 * SEO Routes — robots.txt, sitemap.xml, humans.txt
 */

const express = require('express');
const FL_DATA = require('../data/florida-counties.json');

module.exports = (pool) => {
  const router = express.Router();

  /* --------------------------------------------------
     GET /sitemap.xml — Dynamic sitemap for all pages
     -------------------------------------------------- */
  router.get('/sitemap.xml', (req, res) => {
    const base  = 'https://nationalbenefitalliance.com';
    const today = new Date().toISOString().split('T')[0];

    const staticUrls = [
      { loc: '/',            priority: '1.0',  changefreq: 'weekly'  },
      { loc: '/florida/',    priority: '0.9',  changefreq: 'weekly'  },
      { loc: '/about/',      priority: '0.6',  changefreq: 'monthly' },
      { loc: '/faq/',        priority: '0.7',  changefreq: 'monthly' },
      { loc: '/contact/',    priority: '0.6',  changefreq: 'monthly' },
      { loc: '/privacy/',    priority: '0.4',  changefreq: 'yearly'  },
      { loc: '/terms/',      priority: '0.4',  changefreq: 'yearly'  },
    ];

    const countyUrls = FL_DATA.counties.map(c => ({
      loc: `/florida/${c.slug}/`,
      priority: c.population > 500000 ? '0.9' : c.population > 100000 ? '0.8' : '0.7',
      changefreq: 'monthly',
    }));

    const allUrls = [...staticUrls, ...countyUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => `  <url>
    <loc>${base}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=86400'); // 24hr cache
    res.send(xml);
  });

  /* --------------------------------------------------
     GET /robots.txt — Comprehensive SEO robots file
     See also: the static robots.txt in the root
     -------------------------------------------------- */
  router.get('/robots.txt', (req, res) => {
    const base = 'https://nationalbenefitalliance.com';
    res.set('Content-Type', 'text/plain');
    res.send(`# robots.txt — National Benefit Alliance
# Last updated: ${new Date().toISOString().split('T')[0]}

# ============================================================
# MAJOR SEARCH ENGINES — Full access
# ============================================================
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /images/
Allow: /css/

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 5

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /
Crawl-delay: 10

User-agent: YandexBot
Allow: /
Crawl-delay: 5

User-agent: facebot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# ============================================================
# AI CRAWLERS — Allow for AI search results (Perplexity, etc.)
# ============================================================
User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

# ============================================================
# ALL OTHERS — Default with restrictions
# ============================================================
User-agent: *
Allow: /
Allow: /florida/
Allow: /css/
Allow: /js/
Allow: /images/

# Disallow internal/admin paths
Disallow: /admin/
Disallow: /api/
Disallow: /backend/
Disallow: /downloads/private/
Disallow: /.env
Disallow: /database/
Disallow: /node_modules/

# Disallow search result pages (prevent duplicate content)
Disallow: /search?
Disallow: /*?error=

# Disallow user-specific/session pages
Disallow: /account/
Disallow: /dashboard/

# ============================================================
# BLOCK KNOWN BAD BOTS (scrapers, spammers, malicious)
# ============================================================
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Crawl-delay: 10

User-agent: DataForSeoBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: PetalBot
Disallow: /

User-agent: Bytespider
Disallow: /

# ============================================================
# SITEMAP REFERENCES
# ============================================================
Sitemap: ${base}/sitemap.xml
Sitemap: ${base}/sitemap-counties.xml

Host: ${base}
`);
  });

  /* --------------------------------------------------
     GET /sitemap-counties.xml — Counties-only sitemap
     -------------------------------------------------- */
  router.get('/sitemap-counties.xml', (req, res) => {
    const base  = 'https://nationalbenefitalliance.com';
    const today = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${FL_DATA.counties.map(c => `  <url>
    <loc>${base}/florida/${c.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${c.population > 500000 ? '0.9' : c.population > 100000 ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  });

  /* --------------------------------------------------
     GET /humans.txt — Easter egg / transparency
     -------------------------------------------------- */
  router.get('/humans.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`/* TEAM */
Organization: National Benefit Alliance
Website: https://nationalbenefitalliance.com
Contact: info@nationalbenefitalliance.com
Phone: 1-800-605-8906

/* MISSION */
We help Americans navigate free government and community assistance programs.
This site covers all 50 states, organized by county — completely free.

/* TECHNOLOGY */
Backend: Node.js, Express
Database: PostgreSQL
Frontend: HTML5, CSS3, Vanilla JS
Schema: Schema.org (GovernmentOrganization, Place, GovernmentService, FAQPage)
Hosted: United States
`);
  });

  return router;
};
