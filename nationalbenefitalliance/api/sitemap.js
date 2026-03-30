/**
 * GET /api/sitemap  →  /sitemap.xml
 */
const { FL_COUNTIES } = require('./_data');

module.exports = (req, res) => {
  const base  = 'https://nationalbenefitalliance.com';
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: '/',            priority: '1.0',  changefreq: 'weekly'  },
    { loc: '/florida',     priority: '0.9',  changefreq: 'weekly'  },
    { loc: '/about',       priority: '0.6',  changefreq: 'monthly' },
    { loc: '/faq',         priority: '0.7',  changefreq: 'monthly' },
    { loc: '/contact',     priority: '0.6',  changefreq: 'monthly' },
    { loc: '/privacy',     priority: '0.4',  changefreq: 'yearly'  },
    { loc: '/terms',       priority: '0.4',  changefreq: 'yearly'  },
  ];

  const countyUrls = FL_COUNTIES.map(c => ({
    loc:        `/florida/${c.slug}`,
    priority:   c.population > 500000 ? '0.9' : c.population > 100000 ? '0.8' : '0.7',
    changefreq: 'monthly',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...countyUrls].map(u => `  <url>
    <loc>${base}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
};
