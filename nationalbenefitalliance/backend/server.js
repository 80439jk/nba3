/**
 * National Benefit Alliance — Node.js / Express Backend
 * =======================================================
 * Server with unique URL routing (SSR), API endpoints,
 * access code verification, PDF generation, and email delivery.
 *
 * Routes architecture:
 *   GET  /                          → homepage
 *   GET  /:state                    → state index (e.g. /florida)
 *   GET  /:state/:county            → county resource page
 *   GET  /api/zip/:zip              → ZIP → county lookup
 *   POST /api/verify-code           → access code verification
 *   POST /api/register              → user signup / transaction ID
 *   POST /api/send-pdf              → email PDF to user
 *   GET  /api/pdf/:state/:county    → generate/download PDF
 *   GET  /sitemap.xml               → dynamic sitemap
 */

require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const cors        = require('cors');
const path        = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ====================================================
   MIDDLEWARE
   ==================================================== */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Rate limiting — API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});
app.use('/api/', apiLimiter);

// Strict limiter for code verification (prevent brute force)
const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many code attempts. Please call 1-888-408-5650 for assistance.' },
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ====================================================
   DATABASE
   ==================================================== */
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('⚠️  Database connection error:', err.message);
  } else {
    console.log('✅ Database connected');
    release();
  }
});

/* ====================================================
   ROUTES — Import
   ==================================================== */
const pageRoutes   = require('./routes/pages');
const apiRoutes    = require('./routes/api');
const seoRoutes    = require('./routes/seo');

app.use('/', pageRoutes(pool));
app.use('/api', apiRoutes(pool));
app.use('/', seoRoutes(pool));

/* ====================================================
   404 & ERROR HANDLERS
   ==================================================== */
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
    <title>Page Not Found | National Benefit Alliance</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/css/styles.css">
    </head><body>
    <nav class="nav"><div class="nav__inner">
      <a href="/" class="nav__logo"><div class="nav__logo-text">
        <span class="nav__logo-name">National Benefit Alliance</span></div></a>
    </div></nav>
    <div style="text-align:center;padding:6rem 1.5rem;">
      <div style="font-size:5rem;margin-bottom:1rem;">🗺️</div>
      <h1 style="color:#1B3A6B;">Page Not Found</h1>
      <p style="color:#6C757D;max-width:400px;margin:1rem auto 2rem;">
        The page you're looking for doesn't exist. Try searching by ZIP code or browsing our Florida county directory.
      </p>
      <a href="/" class="btn btn--navy btn--lg">← Back to Home</a>
    </div>
    </body></html>
  `);
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error. Please try again.' });
});

/* ====================================================
   START SERVER
   ==================================================== */
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   National Benefit Alliance Server       ║
  ║   Running on http://localhost:${PORT}      ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
