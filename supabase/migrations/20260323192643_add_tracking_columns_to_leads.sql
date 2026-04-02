/*
  # Add Tracking Parameter Columns to Leads Table

  ## Overview
  This migration adds campaign tracking columns to the leads table to enable complete visibility into lead sources and marketing attribution.

  ## Changes Made
  
  ### 1. New Columns Added to leads table
    - `gclid` (text, nullable) - Google Click Identifier for Google Ads conversion tracking
    - `utm_source` (text, nullable) - Traffic source (e.g., google, facebook, email)
    - `utm_medium` (text, nullable) - Marketing medium (e.g., cpc, social, email)
    - `utm_campaign` (text, nullable) - Campaign name for grouping related marketing efforts
    - `utm_content` (text, nullable) - Content variation for A/B testing
    - `utm_term` (text, nullable) - Paid search keywords
  
  ## Purpose
  These columns allow you to:
  - Track which campaigns generate the most leads
  - Calculate ROI per marketing channel
  - Analyze conversion rates by traffic source
  - Match leads back to Google Ads conversions
  - Run SQL queries without parsing JSON from api_logs
  
  ## Important Notes
  - All columns are nullable since not all leads will have tracking parameters
  - Tracking parameters are also stored in api_logs.request_payload for audit purposes
  - This creates dual storage: structured columns for analysis + JSON for audit trail
*/

-- Add tracking parameter columns to leads table
DO $$
BEGIN
  -- Add gclid column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'gclid'
  ) THEN
    ALTER TABLE leads ADD COLUMN gclid text;
  END IF;

  -- Add utm_source column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE leads ADD COLUMN utm_source text;
  END IF;

  -- Add utm_medium column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE leads ADD COLUMN utm_medium text;
  END IF;

  -- Add utm_campaign column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE leads ADD COLUMN utm_campaign text;
  END IF;

  -- Add utm_content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'utm_content'
  ) THEN
    ALTER TABLE leads ADD COLUMN utm_content text;
  END IF;

  -- Add utm_term column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'utm_term'
  ) THEN
    ALTER TABLE leads ADD COLUMN utm_term text;
  END IF;
END $$;

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_gclid ON leads(gclid);

-- Add comment to table documenting the tracking columns
COMMENT ON COLUMN leads.gclid IS 'Google Click ID for Google Ads conversion tracking';
COMMENT ON COLUMN leads.utm_source IS 'Traffic source identifier (e.g., google, facebook, email)';
COMMENT ON COLUMN leads.utm_medium IS 'Marketing medium (e.g., cpc, social, email)';
COMMENT ON COLUMN leads.utm_campaign IS 'Campaign name for grouping marketing efforts';
COMMENT ON COLUMN leads.utm_content IS 'Content variation for A/B testing';
COMMENT ON COLUMN leads.utm_term IS 'Paid search keywords';
