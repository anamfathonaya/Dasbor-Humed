-- Migrasi 013: Google Analytics 4 Integration Schema
-- Tabel untuk menyimpan properti GA4 yang terhubung dan kredensial OAuth

CREATE TABLE IF NOT EXISTS google_analytics_properties (
  id BIGSERIAL PRIMARY KEY,
  property_id VARCHAR(50) NOT NULL UNIQUE, -- Format: properties/123456789
  property_name VARCHAR(255) NOT NULL,
  website_url TEXT,
  account_id VARCHAR(50),
  account_name VARCHAR(255),
  connected_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  oauth_status VARCHAR(50) NOT NULL DEFAULT 'connected', -- 'connected' | 'expired' | 'disconnected'
  last_synced_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS google_analytics_credentials (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES google_analytics_properties(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan metrik harian GA4
CREATE TABLE IF NOT EXISTS google_analytics_daily_metrics (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES google_analytics_properties(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  pageviews INTEGER DEFAULT 0,
  avg_session_duration NUMERIC(10, 2) DEFAULT 0,
  bounce_rate NUMERIC(5, 2) DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  engaged_sessions INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(property_id, metric_date)
);

-- Tabel untuk top pages (aggregated)
CREATE TABLE IF NOT EXISTS google_analytics_top_pages (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES google_analytics_properties(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  views INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_time_on_page NUMERIC(10, 2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk traffic sources (aggregated)
CREATE TABLE IF NOT EXISTS google_analytics_traffic_sources (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES google_analytics_properties(id) ON DELETE CASCADE,
  source_medium VARCHAR(255) NOT NULL,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ga_properties_status ON google_analytics_properties(oauth_status);
CREATE INDEX IF NOT EXISTS idx_ga_daily_metrics_date ON google_analytics_daily_metrics(property_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_ga_top_pages_period ON google_analytics_top_pages(property_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ga_traffic_sources_period ON google_analytics_traffic_sources(property_id, period_start, period_end);

-- RLS Policies
ALTER TABLE google_analytics_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_top_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_analytics_traffic_sources ENABLE ROW LEVEL SECURITY;

-- Properties: read by authenticated users
CREATE POLICY "Allow read google_analytics_properties for authenticated users"
ON google_analytics_properties FOR SELECT
TO authenticated
USING (true);

-- Properties: manage by admin and head only
CREATE POLICY "Allow manage google_analytics_properties for admin and head"
ON google_analytics_properties FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);

-- Credentials: admin and head only
CREATE POLICY "Allow manage google_analytics_credentials for admin and head only"
ON google_analytics_credentials FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);

-- Metrics: read by all authenticated users
CREATE POLICY "Allow read google_analytics_daily_metrics for authenticated users"
ON google_analytics_daily_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read google_analytics_top_pages for authenticated users"
ON google_analytics_top_pages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read google_analytics_traffic_sources for authenticated users"
ON google_analytics_traffic_sources FOR SELECT
TO authenticated
USING (true);
