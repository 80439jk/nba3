/**
 * POST /api/verify-code
 * Verifies an access code. Works with DB or in demo mode.
 * Demo mode: any 6-8 char alphanumeric code is accepted.
 */
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
      return res.status(400).json({ success: false, error: 'Invalid JSON.' });
    }
  }

  const { code, county, state } = body;
  if (!code) return res.status(400).json({ success: false, error: 'Code is required.' });

  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,8}$/.test(normalized)) {
    return res.status(401).json({ success: false, error: 'Invalid code format. Codes are 6–8 characters.' });
  }

  // DB verification
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await client.connect();

      const result = await client.query(
        `SELECT id FROM access_codes WHERE code = $1 AND is_active = true AND expires_at > NOW()`,
        [normalized]
      );

      if (result.rows.length === 0) {
        await client.end();
        return res.status(401).json({ success: false, error: 'Code not found or expired. Call 1-800-605-8906 for a new code.' });
      }

      await client.query(
        `INSERT INTO code_uses (code_id, county, state, used_at) VALUES ($1, $2, $3, NOW())`,
        [result.rows[0].id, county || null, state || null]
      );
      await client.end();

      return res.json({ success: true, message: 'Access granted.' });
    } catch (dbErr) {
      console.error('DB verify error:', dbErr.message);
      // Fall through to demo mode
    }
  }

  // Demo mode — accept any valid format code
  return res.json({
    success: true,
    message: 'Access granted (demo mode).',
    demo: !process.env.DATABASE_URL,
  });
};
