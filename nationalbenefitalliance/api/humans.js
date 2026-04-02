module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`/* TEAM */\nOrganization: National Benefit Alliance\nWebsite: https://nationalbenefitalliance.com\nContact: info@nationalbenefitalliance.com\nPhone: 1-800-NBA-HELP\n\n/* MISSION */\nHelping Americans find free government and community assistance programs.\n\n/* TECHNOLOGY */\nFrontend: HTML5, CSS3, Vanilla JS\nBackend: Node.js, Vercel Serverless Functions\nDatabase: PostgreSQL\nSchema: Schema.org (GovernmentOrganization, Place, GovernmentService, FAQPage)\n`);
};
