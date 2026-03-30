/**
 * GET /api/sitemap-counties  →  /sitemap-counties.xml
 */
const { FL_COUNTIES } = require('./_data');

module.exports = (req, res) => {
  const base  = 'https://nationalbenefitalliance.com';
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${FL_COUNTIES.map(c => `  <url>
    <loc>${base}/florida/${c.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${c.population > 500000 ? '0.9' : c.population > 100000 ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
};
