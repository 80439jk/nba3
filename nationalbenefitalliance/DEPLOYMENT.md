# National Benefit Alliance — Vercel Deployment Guide

## Quick Deploy (2 minutes)

Open your terminal and run:

```bash
cd /path/to/NBA2/nationalbenefitalliance

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel deploy --prod --yes --name "national-benefit-alliance"
```

Vercel will prompt you to log in with your account if needed. Once done, your site goes live at a `.vercel.app` URL immediately — then you point your domain.

---

## Step 1 — Deploy to Vercel

```bash
# From inside the nationalbenefitalliance/ folder:
vercel deploy --prod --yes --name "national-benefit-alliance"
```

Vercel auto-detects the project as a static site with serverless functions in `api/`.
No build step needed — all HTML/CSS/JS is pre-built.

---

## Step 2 — Set Environment Variables in Vercel Dashboard

Go to: **vercel.com → national-benefit-alliance → Settings → Environment Variables**

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/dbname` | For full functionality (optional at launch) |
| `SMTP_USER` | Your SendGrid API key label | For email PDF delivery |
| `SMTP_PASS` | Your SendGrid API key | For email PDF delivery |

> **Without these vars, the site runs in demo mode:** ZIP lookup, registration, and access code verification all work, but data isn't persisted and emails aren't sent.

---

## Step 3 — Connect Your Domain

In Vercel dashboard → **national-benefit-alliance → Settings → Domains**, add:
- `nationalbenefitalliance.com`
- `www.nationalbenefitalliance.com`

Vercel will give you DNS records to add at your registrar (usually just a CNAME or A record).

---

## Step 4 — Apply Subdomain (apply.nationalbenefitalliance.com)

The `apply/` folder is part of the same deployment. To serve it at the subdomain:

1. In Vercel, add domain: `apply.nationalbenefitalliance.com`
2. In `vercel.json`, add a rewrite: `{ "source": "/(.*)", "has": [{"type": "host", "value": "apply.nationalbenefitalliance.com"}], "destination": "/apply/$1" }`
3. Redeploy

---

## Step 5 — Database (Optional but Recommended)

```sql
-- Run this once against your PostgreSQL instance
-- File: backend/database/schema.sql

-- Get a free PostgreSQL database at:
-- https://neon.tech  (recommended for Vercel)
-- https://supabase.com
-- https://railway.app
```

Then set `DATABASE_URL` in Vercel env vars (Step 2 above).

---

## URL Structure

| URL | Page |
|-----|------|
| `nationalbenefitalliance.com/` | Homepage |
| `nationalbenefitalliance.com/florida` | Florida state index |
| `nationalbenefitalliance.com/florida/miami-dade` | Miami-Dade county (full) |
| `nationalbenefitalliance.com/florida/broward` | Broward county |
| `nationalbenefitalliance.com/florida/[county]` | Any of 67 FL counties |
| `nationalbenefitalliance.com/search?zip=33101` | ZIP redirect |
| `nationalbenefitalliance.com/sitemap.xml` | Main sitemap |
| `nationalbenefitalliance.com/sitemap-counties.xml` | Counties sitemap |

---

## API Endpoints (Vercel Serverless)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/zip/33101` | Lookup county by ZIP |
| POST | `/api/register` | Register, get transaction ID + access code |
| POST | `/api/verify-code` | Verify access code |
| POST | `/api/send-pdf` | Email PDF to user |
| GET | `/search?zip=33101` | Redirect to county page |
| GET | `/sitemap.xml` | Dynamic XML sitemap |
| GET | `/sitemap-counties.xml` | County-level sitemap |

---

## Google Quality Score Checklist

- [x] Schema.org markup (Organization, GovernmentService, Place, FAQPage, BreadcrumbList)
- [x] Unique URLs for every page (no SPA hash routing)
- [x] robots.txt with AI crawler allowances (GPTBot, Claude-Web, PerplexityBot, etc.)
- [x] Dynamic sitemap.xml with priority scores by county population
- [x] Mobile-responsive CSS (breakpoints at 1024px, 768px, 480px)
- [x] Security headers (X-Frame-Options, CSP, Referrer-Policy)
- [x] Canonical tags on every page
- [x] Open Graph + Twitter Card meta tags
- [x] ARIA labels and semantic HTML landmarks
- [ ] HTTPS (automatic via Vercel)
- [ ] Google Search Console: verify domain, submit sitemap
- [ ] Run Lighthouse → target score > 90

---

## Adding More States Later

1. Add county data: `api/_data.js` — add `TX_COUNTIES`, `TX_ZIP`, etc.
2. Create state page: `texas/index.html`
3. Create county pages: `texas/harris/index.html`, etc.
4. Update `api/sitemap.js` to include new state
5. Redeploy with `vercel deploy --prod`
