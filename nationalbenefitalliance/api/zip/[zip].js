/**
 * GET /api/zip/:zip
 * Returns county info for a given ZIP code.
 */
const { FL_ZIP, FL_COUNTIES } = require('../_data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const zip = (req.query.zip || req.url.split('/').pop() || '').replace(/\D/g, '').slice(0, 5);

  if (!zip || zip.length !== 5) {
    return res.status(400).json({ success: false, error: 'ZIP must be 5 digits.' });
  }

  const countySlug = FL_ZIP[zip];
  if (!countySlug) {
    return res.status(404).json({ success: false, error: 'ZIP not found in Florida database.' });
  }

  const countyData = FL_COUNTIES.find(c => c.slug === countySlug) || {};

  return res.json({
    success:    true,
    zip,
    state:      'florida',
    county:     countySlug,
    countyName: countyData.name || countySlug,
    url:        `/florida/${countySlug}`,
    population: countyData.population,
  });
};
