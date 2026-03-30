#!/bin/bash
# =============================================================
# National Benefit Alliance — Vercel Deploy Script
# Run this from the nationalbenefitalliance/ folder.
# =============================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   National Benefit Alliance — Vercel Deploy      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

echo "✅ Vercel CLI ready."
echo ""

# Deploy to production
echo "🚀 Deploying to Vercel (production)..."
vercel deploy --prod --yes \
  --name "national-benefit-alliance" \
  --build-env NODE_ENV=production

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   ✅ Deployment complete!                        ║"
echo "║   Add env vars in Vercel dashboard:              ║"
echo "║   DATABASE_URL  — your PostgreSQL URL            ║"
echo "║   SMTP_USER     — SendGrid API key label         ║"
echo "║   SMTP_PASS     — SendGrid API key               ║"
echo "╚══════════════════════════════════════════════════╝"
