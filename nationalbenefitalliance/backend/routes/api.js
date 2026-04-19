/**
 * API Routes — National Benefit Alliance
 * Handles: ZIP lookup, access code verify, registration, PDF, email
 */

const express   = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt    = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const FL_ZIP_COUNTY = require('../data/florida-zip-county.json');
const FL_COUNTIES   = require('../data/florida-counties.json');

// Strict limiter for access code endpoint
const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts. Call 1-800-605-8906.' },
});

module.exports = (pool) => {
  const router = express.Router();

  /* --------------------------------------------------
     GET /api/zip/:zip
     Returns county slug + county info for a ZIP code
     -------------------------------------------------- */
  router.get('/zip/:zip',
    param('zip').matches(/^\d{5}$/).withMessage('ZIP must be 5 digits'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { zip } = req.params;
      const county  = FL_ZIP_COUNTY[zip];

      if (!county) {
        return res.status(404).json({ success: false, error: 'ZIP code not found in Florida database.' });
      }

      const countyData = FL_COUNTIES.counties.find(c => c.slug === county);
      return res.json({
        success: true,
        zip,
        state: 'florida',
        county,
        countyName: countyData?.name || county,
        url: `/florida/${county}/`,
      });
    }
  );

  /* --------------------------------------------------
     POST /api/verify-code
     Verifies an access code and logs the use
     Body: { code, county, state, email? }
     -------------------------------------------------- */
  router.post('/verify-code',
    codeLimiter,
    [
      body('code').trim().matches(/^[A-Z0-9]{6,8}$/i).withMessage('Invalid code format'),
      body('county').trim().notEmpty(),
      body('state').trim().notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { code, county, state, email } = req.body;
      const normalizedCode = code.toUpperCase();

      try {
        // Look up code in DB
        const result = await pool.query(
          `SELECT * FROM access_codes WHERE code = $1 AND is_active = true AND expires_at > NOW()`,
          [normalizedCode]
        );

        if (result.rows.length === 0) {
          // Log failed attempt
          await pool.query(
            `INSERT INTO code_attempts (code, county, state, ip_address, success, attempted_at)
             VALUES ($1, $2, $3, $4, false, NOW())`,
            [normalizedCode, county, state, req.ip]
          );
          return res.status(401).json({ success: false, error: 'Invalid or expired access code.' });
        }

        const accessCode = result.rows[0];

        // Log successful use
        await pool.query(
          `INSERT INTO code_uses (code_id, county, state, email, ip_address, used_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [accessCode.id, county, state, email || null, req.ip]
        );

        return res.json({
          success: true,
          message: 'Access granted.',
          countyUrl: `/${state}/${county}/`,
          sessionToken: generateSessionToken(accessCode.id),
        });

      } catch (err) {
        console.error('verify-code error:', err);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
      }
    }
  );

  /* --------------------------------------------------
     POST /api/register
     Creates a new customer record with unique TXN ID
     Body: { firstName, lastName, email, phone, zip, county, state, ... }
     -------------------------------------------------- */
  router.post('/register',
    [
      body('email').isEmail().normalizeEmail(),
      body('firstName').trim().isLength({ min: 1, max: 100 }),
      body('lastName').trim().isLength({ min: 1, max: 100 }),
      body('phone').optional().matches(/^\+?[\d\s\-().]{7,20}$/),
      body('zip').matches(/^\d{5}$/),
      body('state').trim().isLength({ min: 2, max: 50 }),
      body('county').trim().isLength({ min: 2, max: 100 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const {
        firstName, lastName, email, phone, zip, county, state,
        address, city, dob, householdSize, annualIncome,
        preferredLanguage, howHeard, consentMarketing,
        // Future expandable attributes (stored in metadata JSONB)
        ...metadata
      } = req.body;

      // Generate unique transaction ID
      const transactionId = generateTransactionId();

      try {
        // Check for duplicate email
        const existing = await pool.query(
          'SELECT id FROM customers WHERE email = $1', [email]
        );
        if (existing.rows.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Email already registered.',
            transactionId: existing.rows[0].transaction_id,
          });
        }

        // Insert new customer
        const result = await pool.query(`
          INSERT INTO customers (
            transaction_id, first_name, last_name, email, phone,
            zip_code, county, state, address, city,
            date_of_birth, household_size, annual_income,
            preferred_language, how_heard, consent_marketing,
            metadata, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13,
            $14, $15, $16,
            $17, 'active', NOW(), NOW()
          ) RETURNING id, transaction_id, created_at
        `, [
          transactionId, firstName, lastName, email, phone || null,
          zip, county, state, address || null, city || null,
          dob || null, householdSize || null, annualIncome || null,
          preferredLanguage || 'en', howHeard || null,
          consentMarketing === true || consentMarketing === 'true',
          JSON.stringify(metadata),
        ]);

        const customer = result.rows[0];

        // Generate access code for this customer
        const accessCode = generateAccessCode();
        await pool.query(`
          INSERT INTO access_codes (
            customer_id, code, county, state, is_active, created_at, expires_at
          ) VALUES ($1, $2, $3, $4, true, NOW(), NOW() + INTERVAL '30 days')
        `, [customer.id, accessCode, county, state]);

        // Send confirmation email (async, don't await)
        sendConfirmationEmail({
          email, firstName, transactionId: customer.transaction_id, accessCode,
          county, state
        }).catch(err => console.error('Email error:', err));

        return res.status(201).json({
          success: true,
          transactionId: customer.transaction_id,
          message: 'Registration successful. Your access code will arrive by email.',
          countyUrl: `/${state}/${county}/`,
        });

      } catch (err) {
        console.error('register error:', err);
        return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
      }
    }
  );

  /* --------------------------------------------------
     POST /api/send-pdf
     Emails a county resource PDF to the user
     Body: { email, county, state, firstName? }
     -------------------------------------------------- */
  router.post('/send-pdf',
    [
      body('email').isEmail().normalizeEmail(),
      body('county').trim().notEmpty(),
      body('state').trim().notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { email, county, state, firstName } = req.body;

      try {
        // Log email request
        await pool.query(`
          INSERT INTO pdf_requests (email, county, state, requested_at, ip_address)
          VALUES ($1, $2, $3, NOW(), $4)
        `, [email, county, state, req.ip]);

        // Queue email delivery (in production: use a job queue like Bull)
        sendPdfEmail({ email, county, state, firstName })
          .catch(err => console.error('PDF email error:', err));

        return res.json({
          success: true,
          message: `Resource guide queued for delivery to ${email}.`,
        });

      } catch (err) {
        console.error('send-pdf error:', err);
        return res.status(500).json({ success: false, error: 'Failed to queue PDF. Please try again.' });
      }
    }
  );

  /* --------------------------------------------------
     GET /api/counties/:state
     Returns list of all counties for a state
     -------------------------------------------------- */
  router.get('/counties/:state', (req, res) => {
    const { state } = req.params;
    if (state !== 'florida') {
      return res.status(404).json({ success: false, error: 'State not yet available.' });
    }
    return res.json({
      success: true,
      state: 'florida',
      counties: FL_COUNTIES.counties,
    });
  });

  /* --------------------------------------------------
     GET /api/health
     Health check endpoint
     -------------------------------------------------- */
  router.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch {
      res.status(500).json({ status: 'error', db: 'disconnected' });
    }
  });

  return router;
};

/* ====================================================
   HELPERS
   ==================================================== */

function generateTransactionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random    = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NBA-${timestamp}-${random}`;
  // Example output: NBA-LX8K2PA9-M3ZT7R
}

function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateSessionToken(codeId) {
  const payload = Buffer.from(JSON.stringify({ codeId, ts: Date.now() })).toString('base64');
  return payload;
}

async function sendConfirmationEmail({ email, firstName, transactionId, accessCode, county, state }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"National Benefit Alliance" <noreply@nationalbenefitalliance.com>`,
    to: email,
    subject: `Your Access Code + Free ${formatCounty(county)} Resource Guide`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">
        <div style="background:#1B3A6B;padding:2rem;text-align:center;">
          <h1 style="color:#E8A020;margin:0;font-size:1.5rem;">National Benefit Alliance</h1>
          <p style="color:rgba(255,255,255,0.8);margin:0.5rem 0 0;">Free Resource Center</p>
        </div>
        <div style="padding:2rem;">
          <h2 style="color:#1B3A6B;">Hi ${firstName || 'there'}!</h2>
          <p>Thank you for registering with the National Benefit Alliance. Here are your details:</p>
          <div style="background:#F8F9FA;border:2px solid #E8A020;border-radius:8px;padding:1.5rem;margin:1.5rem 0;text-align:center;">
            <p style="margin:0;color:#6C757D;font-size:0.875rem;">YOUR PERSONAL ACCESS CODE</p>
            <p style="font-size:2rem;font-weight:800;color:#1B3A6B;letter-spacing:0.2em;margin:0.5rem 0;">${accessCode}</p>
            <p style="margin:0;color:#6C757D;font-size:0.8rem;">Valid for 30 days</p>
          </div>
          <div style="background:#F8F9FA;border-radius:8px;padding:1rem;margin-bottom:1.5rem;">
            <p style="margin:0;color:#6C757D;font-size:0.8rem;">Transaction ID</p>
            <p style="margin:0;font-weight:700;color:#1B3A6B;font-family:monospace;">${transactionId}</p>
          </div>
          <p>Use your code at:</p>
          <a href="https://nationalbenefitalliance.com/${state}/${county}/" style="display:inline-block;background:#1B3A6B;color:#fff;padding:1rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">
            View ${formatCounty(county)} Resources →
          </a>
          <p style="margin-top:1.5rem;font-size:0.875rem;color:#6C757D;">
            Questions? Call us at <strong>1-800-605-8906</strong> (Mon–Fri 9:30am–6:30pm ET)
          </p>
        </div>
        <div style="background:#1B3A6B;padding:1rem;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);margin:0;font-size:0.75rem;">
            © 2024 National Benefit Alliance · This is a free public resource · <a href="https://nationalbenefitalliance.com/unsubscribe" style="color:rgba(255,255,255,0.4);">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
  });
}

async function sendPdfEmail({ email, county, state, firstName }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"National Benefit Alliance" <noreply@nationalbenefitalliance.com>`,
    to: email,
    subject: `Your Free ${formatCounty(county)} Resource Guide — PDF`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1B3A6B;padding:2rem;text-align:center;">
          <h1 style="color:#E8A020;margin:0;">National Benefit Alliance</h1>
        </div>
        <div style="padding:2rem;">
          <h2 style="color:#1B3A6B;">Hi ${firstName || 'there'}!</h2>
          <p>Your <strong>${formatCounty(county)}, Florida</strong> free resource guide is attached to this email.</p>
          <p>The guide includes all verified assistance programs for:</p>
          <ul>
            <li>⚡ Utility assistance (LIHEAP, FPL, water)</li>
            <li>🏠 Rental and housing help</li>
            <li>🥗 Food assistance (SNAP, WIC, food banks)</li>
            <li>🏥 Healthcare and Medicaid</li>
            <li>💼 Unemployment and employment programs</li>
            <li>👶 Childcare and pre-K programs</li>
            <li>⚖️ Free legal aid</li>
            <li>👴 Senior services</li>
            <li>🚌 Transportation assistance</li>
          </ul>
          <a href="https://nationalbenefitalliance.com/${state}/${county}/" style="display:inline-block;background:#E8A020;color:#1B3A6B;padding:1rem 2rem;border-radius:8px;text-decoration:none;font-weight:800;margin-top:1rem;">
            View Online Guide →
          </a>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${county}-county-resource-guide.pdf`,
        path: `./public/downloads/${county}-resources.pdf`,
        contentType: 'application/pdf',
      }
    ],
  });
}

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.sendgrid.net',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatCounty(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' County';
}
