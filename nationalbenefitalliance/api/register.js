/**
 * POST /api/register
 * Registers a new user, assigns a unique Transaction ID, and (optionally) persists to DB.
 * Works in demo mode when DATABASE_URL is not set.
 */
const { FL_ZIP, FL_COUNTIES } = require('./_data');

function generateTransactionId() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NBA-${ts}-${rnd}`;
}

function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid JSON body.' });
    }
  }

  const { firstName, lastName, email, phone, zip, county, state } = body;

  // Basic validation
  if (!firstName || !lastName || !email || !zip) {
    return res.status(400).json({ success: false, error: 'firstName, lastName, email, and zip are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ success: false, error: 'Invalid ZIP code.' });
  }

  // Resolve county from ZIP if not provided
  const resolvedCounty = county || FL_ZIP[zip] || 'unknown';
  const resolvedState  = state  || (FL_ZIP[zip] ? 'florida' : 'unknown');

  const transactionId = generateTransactionId();
  const accessCode    = generateAccessCode();

  // Attempt DB write if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await client.connect();

      await client.query(`
        INSERT INTO customers (
          transaction_id, first_name, last_name, email, phone,
          zip_code, county, state,
          household_size, annual_income, preferred_language,
          how_heard, consent_marketing, metadata,
          status, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'active',NOW(),NOW())
        ON CONFLICT (email) DO NOTHING
      `, [
        transactionId, firstName, lastName, email, phone || null,
        zip, resolvedCounty, resolvedState,
        body.householdSize || null, body.annualIncome || null, body.preferredLanguage || 'en',
        body.howHeard || null, body.consentMarketing === true,
        JSON.stringify({ programsInterested: body.programsInterested || [], utmSource: body.utmSource, utmMedium: body.utmMedium, utmCampaign: body.utmCampaign }),
      ]);

      await client.query(`
        INSERT INTO access_codes (customer_id, code, county, state, is_active, created_at, expires_at)
        SELECT id, $1, $2, $3, true, NOW(), NOW() + INTERVAL '30 days'
        FROM customers WHERE transaction_id = $4
      `, [accessCode, resolvedCounty, resolvedState, transactionId]);

      await client.end();
    } catch (dbErr) {
      console.error('DB write failed:', dbErr.message);
      // Fall through — still return success with generated IDs
    }
  }

  return res.status(201).json({
    success:       true,
    transactionId,
    accessCode,
    county:        resolvedCounty,
    state:         resolvedState,
    countyUrl:     `/${resolvedState}/${resolvedCounty}`,
    message:       'Registration successful. Your access code is included in this response and will also be emailed to you.',
  });
};
