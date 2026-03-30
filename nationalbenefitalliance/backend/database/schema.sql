-- ============================================================
-- NATIONAL BENEFIT ALLIANCE — DATABASE SCHEMA
-- PostgreSQL 15+
-- Run: psql -d nba_db -f schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search

-- ============================================================
-- TABLE: customers
-- Core customer record with unique transaction ID
-- Designed for easy attribute expansion via JSONB metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id                  SERIAL PRIMARY KEY,
    transaction_id      VARCHAR(30) UNIQUE NOT NULL,
                        -- Format: NBA-{timestamp36}-{random6}
                        -- Example: NBA-LX8K2PA9-M3ZT7R

    -- Core identity
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    phone               VARCHAR(25),

    -- Location
    zip_code            CHAR(5),
    county              VARCHAR(100),
    state               VARCHAR(50),
    address             VARCHAR(255),
    city                VARCHAR(100),

    -- Demographics (optional — for program eligibility)
    date_of_birth       DATE,
    household_size      SMALLINT CHECK (household_size > 0 AND household_size <= 20),
    annual_income       NUMERIC(12, 2),
    preferred_language  VARCHAR(10) DEFAULT 'en',

    -- Acquisition
    how_heard           VARCHAR(100),   -- 'google', 'facebook', 'referral', etc.
    consent_marketing   BOOLEAN DEFAULT false,
    referral_code       VARCHAR(50),

    -- Status tracking
    status              VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','blocked','pending')),
    verified_email      BOOLEAN DEFAULT false,
    verified_phone      BOOLEAN DEFAULT false,

    -- *** EXPANDABLE: store any future attributes here ***
    -- Add new fields without DB migrations by using JSONB
    -- Example: {"ssdi_eligible": true, "veteran": false, "disability_type": "mobility"}
    metadata            JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at       TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ  -- Soft delete
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_email       ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_txn_id      ON customers(transaction_id);
CREATE INDEX IF NOT EXISTS idx_customers_zip         ON customers(zip_code);
CREATE INDEX IF NOT EXISTS idx_customers_county_state ON customers(county, state);
CREATE INDEX IF NOT EXISTS idx_customers_created     ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_metadata    ON customers USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_customers_name        ON customers USING GIN((first_name || ' ' || last_name) gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: access_codes
-- Generated codes that allow users to unlock county guides
-- ============================================================

CREATE TABLE IF NOT EXISTS access_codes (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    code            VARCHAR(10) UNIQUE NOT NULL,
                    -- 8-char alphanumeric, no ambiguous chars
                    -- Example: A4KM8NXP

    county          VARCHAR(100) NOT NULL,
    state           VARCHAR(50)  NOT NULL,

    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    deactivated_at  TIMESTAMPTZ,
    deactivated_by  VARCHAR(100),  -- admin username

    -- Usage statistics
    use_count       INTEGER DEFAULT 0,
    max_uses        INTEGER DEFAULT 10,  -- 0 = unlimited

    created_by      VARCHAR(100) DEFAULT 'system',  -- 'system' or admin username
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_codes_code      ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_customer  ON access_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_codes_county    ON access_codes(county, state);
CREATE INDEX IF NOT EXISTS idx_codes_active    ON access_codes(is_active, expires_at);

-- ============================================================
-- TABLE: code_uses
-- Logs every time an access code is used (audit trail)
-- ============================================================

CREATE TABLE IF NOT EXISTS code_uses (
    id          SERIAL PRIMARY KEY,
    code_id     INTEGER REFERENCES access_codes(id) ON DELETE SET NULL,
    county      VARCHAR(100),
    state       VARCHAR(50),
    email       VARCHAR(255),
    ip_address  INET,
    user_agent  TEXT,
    used_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_uses_code   ON code_uses(code_id);
CREATE INDEX IF NOT EXISTS idx_code_uses_county ON code_uses(county, state);
CREATE INDEX IF NOT EXISTS idx_code_uses_date   ON code_uses(used_at DESC);

-- ============================================================
-- TABLE: code_attempts
-- Failed access code attempts (for brute-force detection)
-- ============================================================

CREATE TABLE IF NOT EXISTS code_attempts (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(10),
    county       VARCHAR(100),
    state        VARCHAR(50),
    ip_address   INET,
    success      BOOLEAN DEFAULT false,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_ip   ON code_attempts(ip_address, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_code ON code_attempts(code);

-- ============================================================
-- TABLE: counties
-- Master list of all counties with metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS counties (
    id              SERIAL PRIMARY KEY,
    state           VARCHAR(50)  NOT NULL,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
                    -- URL-friendly, e.g. 'miami-dade'
    fips_code       CHAR(5),    -- Federal FIPS county code
    population      INTEGER,
    seat            VARCHAR(100),    -- County seat city
    established     SMALLINT,        -- Year established
    area_sq_miles   NUMERIC(8,2),
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    phone_211       VARCHAR(20),     -- Local 211 number if available
    website_url     VARCHAR(255),
    resource_count  INTEGER DEFAULT 0,
    is_published    BOOLEAN DEFAULT true,
    last_verified   DATE,
    metadata        JSONB DEFAULT '{}'::jsonb,

    UNIQUE(state, slug)
);

CREATE INDEX IF NOT EXISTS idx_counties_state ON counties(state);
CREATE INDEX IF NOT EXISTS idx_counties_slug  ON counties(state, slug);

-- ============================================================
-- TABLE: resources
-- Individual assistance programs by county
-- ============================================================

CREATE TABLE IF NOT EXISTS resources (
    id              SERIAL PRIMARY KEY,
    county_id       INTEGER REFERENCES counties(id) ON DELETE CASCADE,
    state           VARCHAR(50)  NOT NULL,
    county          VARCHAR(100) NOT NULL,

    -- Program details
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(50)  NOT NULL,
                    -- 'utilities','housing','food','healthcare',
                    -- 'employment','childcare','legal','transportation','senior'
    subcategory     VARCHAR(100),
    description     TEXT,
    eligibility     TEXT,        -- Eligibility requirements
    how_to_apply    TEXT,        -- Application instructions

    -- Contact
    organization    VARCHAR(255),
    address         VARCHAR(255),
    city            VARCHAR(100),
    zip_code        CHAR(5),
    phone           VARCHAR(25),
    phone_alt       VARCHAR(25),
    email           VARCHAR(255),
    website_url     VARCHAR(500),
    hours           VARCHAR(255),  -- "Mon-Fri 8am-5pm"

    -- Geographic scope
    serves_all_county BOOLEAN DEFAULT true,
    service_area    TEXT,  -- If not full county

    -- Status
    is_active       BOOLEAN DEFAULT true,
    is_bilingual    BOOLEAN DEFAULT false,
    languages       VARCHAR(100) DEFAULT 'English',
    requires_code   BOOLEAN DEFAULT true,  -- Whether access code needed to see this
    is_featured     BOOLEAN DEFAULT false, -- Show in preview without code

    -- Metadata & audit
    source_url      VARCHAR(500),  -- Where we verified this info
    last_verified   DATE DEFAULT CURRENT_DATE,
    verified_by     VARCHAR(100),
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_county    ON resources(county, state);
CREATE INDEX IF NOT EXISTS idx_resources_category  ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_active    ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_search    ON resources USING GIN(to_tsvector('english', name || ' ' || COALESCE(description,'')));

CREATE TRIGGER trigger_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: pdf_requests
-- Tracks PDF email delivery requests
-- ============================================================

CREATE TABLE IF NOT EXISTS pdf_requests (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    county          VARCHAR(100) NOT NULL,
    state           VARCHAR(50)  NOT NULL,
    customer_id     INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    ip_address      INET,
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','sent','failed','bounced')),
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    error_message   TEXT
);

CREATE INDEX IF NOT EXISTS idx_pdf_requests_email  ON pdf_requests(email);
CREATE INDEX IF NOT EXISTS idx_pdf_requests_county ON pdf_requests(county, state);
CREATE INDEX IF NOT EXISTS idx_pdf_requests_status ON pdf_requests(status);

-- ============================================================
-- TABLE: signups (Application Funnel — apply subdomain)
-- Stores applications from apply.nationalbenefitalliance.com
-- ============================================================

CREATE TABLE IF NOT EXISTS signups (
    id                  SERIAL PRIMARY KEY,
    transaction_id      VARCHAR(30) UNIQUE NOT NULL,

    -- Captured fields
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    email               VARCHAR(255),
    phone               VARCHAR(25),
    zip_code            CHAR(5),
    county              VARCHAR(100),
    state               VARCHAR(50),

    -- Funnel tracking
    funnel_step         SMALLINT DEFAULT 1,
    funnel_completed    BOOLEAN DEFAULT false,
    utm_source          VARCHAR(100),
    utm_medium          VARCHAR(100),
    utm_campaign        VARCHAR(100),
    utm_term            VARCHAR(100),
    referrer_url        TEXT,

    -- Program interest (multi-select via JSONB array)
    programs_interested JSONB DEFAULT '[]'::jsonb,
    -- Example: ["utilities", "food", "healthcare"]

    -- Status
    status              VARCHAR(20) DEFAULT 'new',
    follow_up_notes     TEXT,
    assigned_to         VARCHAR(100),  -- Staff member assigned

    -- Expandable
    metadata            JSONB DEFAULT '{}'::jsonb,

    -- Audit
    ip_address          INET,
    user_agent          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signups_txn      ON signups(transaction_id);
CREATE INDEX IF NOT EXISTS idx_signups_email    ON signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_county   ON signups(county, state);
CREATE INDEX IF NOT EXISTS idx_signups_status   ON signups(status);
CREATE INDEX IF NOT EXISTS idx_signups_created  ON signups(created_at DESC);

CREATE TRIGGER trigger_signups_updated_at
    BEFORE UPDATE ON signups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: page_views (simple analytics, privacy-friendly)
-- ============================================================

CREATE TABLE IF NOT EXISTS page_views (
    id          BIGSERIAL PRIMARY KEY,
    path        VARCHAR(500) NOT NULL,
    county      VARCHAR(100),
    state       VARCHAR(50),
    referrer    VARCHAR(500),
    country     VARCHAR(5),
    viewed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pageviews_path  ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_date  ON page_views(viewed_at DESC);

-- ============================================================
-- VIEWS (for reporting)
-- ============================================================

-- Popular counties by resource guide views
CREATE OR REPLACE VIEW vw_county_popularity AS
SELECT
    county,
    state,
    COUNT(*) AS view_count,
    DATE_TRUNC('month', viewed_at) AS month
FROM page_views
WHERE county IS NOT NULL
GROUP BY county, state, DATE_TRUNC('month', viewed_at)
ORDER BY view_count DESC;

-- Customer registration stats by county
CREATE OR REPLACE VIEW vw_registrations_by_county AS
SELECT
    county,
    state,
    COUNT(*) AS total_registrations,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS last_30_days,
    MAX(created_at) AS last_registration
FROM customers
WHERE deleted_at IS NULL
GROUP BY county, state
ORDER BY total_registrations DESC;

-- Active access codes summary
CREATE OR REPLACE VIEW vw_active_codes AS
SELECT
    ac.*,
    c.first_name, c.last_name, c.email
FROM access_codes ac
LEFT JOIN customers c ON ac.customer_id = c.id
WHERE ac.is_active = true AND ac.expires_at > NOW()
ORDER BY ac.created_at DESC;

-- ============================================================
-- SEED: Florida counties (partial — top 10)
-- Run database/seed.sql for complete 67-county seed
-- ============================================================

INSERT INTO counties (state, name, slug, fips_code, population, seat, latitude, longitude, phone_211, website_url)
VALUES
  ('florida','Miami-Dade County','miami-dade','12086',2701767,'Miami',25.5516,-80.6327,'211','https://www.miamidade.gov'),
  ('florida','Broward County','broward','12011',1952778,'Fort Lauderdale',26.1224,-80.1373,'211','https://www.broward.org'),
  ('florida','Palm Beach County','palm-beach','12099',1496770,'West Palm Beach',26.6406,-80.3927,'211','https://discover.pbcgov.org'),
  ('florida','Orange County','orange','12095',1429908,'Orlando',28.5383,-81.3792,'211','https://www.orangecountyfl.net'),
  ('florida','Hillsborough County','hillsborough','12057',1459762,'Tampa',27.9944,-82.4528,'211','https://www.hillsboroughcounty.org'),
  ('florida','Pinellas County','pinellas','12103',971895,'Clearwater',27.8762,-82.7819,'211','https://www.pinellascounty.org'),
  ('florida','Duval County','duval','12031',995318,'Jacksonville',30.3322,-81.6557,'211','https://www.coj.net'),
  ('florida','Lee County','lee','12071',760822,'Fort Myers',26.5954,-81.8611,'211','https://www.leegov.com'),
  ('florida','Polk County','polk','12105',724777,'Bartow',27.9347,-81.7787,'211','https://www.polk-county.net'),
  ('florida','Brevard County','brevard','12009',606612,'Titusville',28.2639,-80.7214,'211','https://www.brevardfl.gov')
ON CONFLICT (state, slug) DO NOTHING;
