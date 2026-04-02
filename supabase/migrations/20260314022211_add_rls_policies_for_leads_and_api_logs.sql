/*
  # Add RLS Policies for Backend Tables

  1. Overview
     - Adds Row Level Security policies for leads and api_logs tables
     - These are backend-only tables accessed exclusively via Edge Functions
     - Policies restrict all direct access from frontend clients
  
  2. Security Model
     - Service role (used by Edge Functions) bypasses RLS automatically
     - No authenticated or anonymous user access allowed
     - This ensures data can only be written/read through controlled Edge Function endpoints
  
  3. Policies Added
     - Restrictive policies that deny all direct client access
     - Edge Functions using service_role key will still have full access
*/

-- Policies for leads table
-- Deny all direct access from clients (Edge Functions use service_role which bypasses RLS)
CREATE POLICY "No direct access to leads"
  ON leads
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Policies for api_logs table
-- Deny all direct access from clients (Edge Functions use service_role which bypasses RLS)
CREATE POLICY "No direct access to api_logs"
  ON api_logs
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
