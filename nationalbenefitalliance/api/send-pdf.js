/**
 * POST /api/send-pdf
 * Logs a PDF email request and (when SMTP is configured) sends the email.
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

  const { email, county, state, firstName } = body;
  if (!email || !county) {
    return res.status(400).json({ success: false, error: 'email and county are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  const countyName = county.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') + ' County';

  // Log to DB if available
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await client.connect();
      await client.query(
        `INSERT INTO pdf_requests (email, county, state, status, requested_at) VALUES ($1, $2, $3, 'pending', NOW())`,
        [email, county, state || 'florida']
      );
      await client.end();
    } catch (e) { console.error('pdf_requests insert error:', e.message); }
  }

  // Send email if SMTP configured
  if (process.env.SMTP_PASS && process.env.SMTP_USER) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST   || 'smtp.sendgrid.net',
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from:    `"National Benefit Alliance" <${process.env.EMAIL_FROM || 'noreply@nationalbenefitalliance.com'}>`,
        to:      email,
        subject: `Your Free ${countyName} Resource Guide`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1B3A6B;padding:2rem;text-align:center;">
              <h1 style="color:#E8A020;margin:0;font-size:1.5rem;">National Benefit Alliance</h1>
            </div>
            <div style="padding:2rem;">
              <h2 style="color:#1B3A6B;">Hi ${firstName || 'there'}!</h2>
              <p>Your <strong>${countyName}, ${(state || 'Florida').charAt(0).toUpperCase() + (state || 'Florida').slice(1)}</strong> free resource guide is ready.</p>
              <p>Visit your county resource page to access the full guide and download the PDF:</p>
              <a href="https://nationalbenefitalliance.com/${state || 'florida'}/${county}" style="display:inline-block;background:#1B3A6B;color:#fff;padding:1rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:1rem;">
                View ${countyName} Resources →
              </a>
              <p style="margin-top:1.5rem;font-size:0.875rem;color:#6C757D;">
                Questions? Call <strong>1-888-408-5650</strong> (Mon–Fri 8am–8pm ET)
              </p>
            </div>
            <div style="background:#1B3A6B;padding:1rem;text-align:center;">
              <p style="color:rgba(255,255,255,0.5);margin:0;font-size:0.75rem;">
                © 2024 National Benefit Alliance · Free public resource ·
                <a href="https://nationalbenefitalliance.com/privacy" style="color:rgba(255,255,255,0.4);">Privacy Policy</a>
              </p>
            </div>
          </div>`,
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }
  }

  return res.json({
    success: true,
    message: `Resource guide link sent to ${email}. Check your inbox within 5 minutes.`,
  });
};
