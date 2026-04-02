-- National Benefit Alliance Database Schema
--
-- 1. New Tables
--    - leads: Stores all lead submissions with contact info, form data, and CRM tracking
--    - api_logs: Complete audit trail of all CRM API calls with request/response data
--
-- 2. Security
--    - RLS enabled on both tables
--    - Service role (Edge Functions) has full access
--    - No public access from frontend
--
-- 3. Indexes
--    - Fast lookups on transaction_id and email

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  state text NOT NULL,
  dob text NOT NULL,
  citizenship text NOT NULL,
  street_address text NOT NULL,
  city text NOT NULL,
  zip text NOT NULL,
  annual_income text NOT NULL,
  employment_status text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  tcpa_consent boolean NOT NULL,
  ip_address text,
  jornaya_leadid text,
  crm_lead_id text,
  crm_status text NOT NULL DEFAULT 'pending',
  crm_submitted_at timestamptz
);

-- Create api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  lead_id uuid REFERENCES leads(id),
  transaction_id uuid NOT NULL,
  caller_id text NOT NULL,
  request_payload jsonb NOT NULL,
  response_payload jsonb,
  http_status integer,
  success boolean NOT NULL,
  error_message text
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_transaction_id ON leads(transaction_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_api_logs_transaction_id ON api_logs(transaction_id);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- No public access policies (service role only via Edge Functions)