/**
 * GET /api/search?zip=33101
 * Redirects to the correct county page based on ZIP code.
 */
const { FL_ZIP, FL_COUNTIES } = require('./_data');

module.exports = (req, res) => {
  const zip = (req.query.zip || '').replace(/\D/g, '').slice(0, 5);

  if (!zip || zip.length !== 5) {
    return res.redirect(302, '/?error=invalid_zip');
  }

  const countySlug = FL_ZIP[zip];
  if (countySlug) {
    return res.redirect(301, `/florida/${countySlug}`);
  }

  return res.redirect(302, `/?error=zip_not_found&zip=${zip}`);
};
