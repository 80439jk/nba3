/**
 * POST /api/newsletter
 * Stores a newsletter signup from the /newsletter/ page into Supabase
 * (table: public.newsletter_signups), server-side via the REST endpoint.
 *
 * Required env vars (set in Vercel):
 *   SUPABASE_URL                 e.g. https://quhxbgsgtfvrasyjvaba.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    service_role key (kept server-side only)
 *
 * If those env vars are not set, the function runs in "demo mode": it
 * validates and returns success but does NOT store anything (matches the
 * pattern used by api/register.js). Data is only saved once the env vars exist.
 *
 * Always returns HTTP 200 on a valid submission so the front-end never blocks
 * the user, regardless of whether the DB write succeeds.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Parse body (Vercel may or may not have parsed it already).
  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid JSON body.' });
    }
  }

  const firstName = (body.firstName || '').toString().trim();
  const lastName  = (body.lastName  || '').toString().trim();
  const email     = (body.email     || '').toString().trim();
  const consent   = body.consent === true;

  // Validation (mirrors the client-side checks on /newsletter/).
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ success: false, error: 'firstName, lastName, and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (!consent) {
    return res.status(400).json({ success: false, error: 'Consent is required.' });
  }

  const fwd = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  const row = {
    first_name:   firstName,
    last_name:    lastName,
    email:        email,
    consent:      true,
    source:       (body.source || 'newsletter_page').toString().slice(0, 100),
    ip_address:   fwd || (req.socket && req.socket.remoteAddress) || null,
    user_agent:   (req.headers['user-agent'] || '').toString().slice(0, 1000) || null,
    referrer:     (body.referrer || req.headers['referer'] || '').toString().slice(0, 2000) || null,
    gclid:        (body.gclid        || '').toString().slice(0, 255) || null,
    utm_source:   (body.utm_source   || '').toString().slice(0, 255) || null,
    utm_medium:   (body.utm_medium   || '').toString().slice(0, 255) || null,
    utm_campaign: (body.utm_campaign || '').toString().slice(0, 255) || null,
    utm_content:  (body.utm_content  || '').toString().slice(0, 255) || null,
    utm_term:     (body.utm_term     || '').toString().slice(0, 255) || null,
  };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Demo mode — no DB configured. Validate-only so the page still works.
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn('[newsletter] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — signup NOT stored (demo mode).');
    return res.status(200).json({ success: true, stored: false });
  }

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_signups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(row),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('[newsletter] Supabase insert failed:', resp.status, detail);
      // Still return success so the user isn't blocked; the error is logged.
      return res.status(200).json({ success: true, stored: false });
    }

    return res.status(200).json({ success: true, stored: true });
  } catch (err) {
    console.error('[newsletter] insert error:', err.message);
    return res.status(200).json({ success: true, stored: false });
  }
};
