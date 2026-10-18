-- Migrasi 009: Tabel Metrik Harian Kanal (channel_daily_metrics) dengan RLS
CREATE TABLE IF NOT EXISTS channel_daily_metrics (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT REFERENCES social_channels(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_date DATE NOT NULL,
  reach BIGINT DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  engagement BIGINT DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(channel_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_channel_metrics_date ON channel_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_channel_metrics_platform ON channel_daily_metrics(platform);

-- RLS
ALTER TABLE channel_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read daily metrics for all authenticated staff"
ON channel_daily_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert and update daily metrics for admin and head"
ON channel_daily_metrics FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);
