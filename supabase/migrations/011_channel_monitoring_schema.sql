-- Migrasi 011: Perluasan Skema Pemantauan Kanal Media Sosial (YouTube, Instagram, Facebook, TikTok)
-- Memakai ulang fondasi social_channels, channel_credentials, channel_daily_metrics

ALTER TABLE social_channels
  ADD COLUMN IF NOT EXISTS external_account_id VARCHAR(150),
  ADD COLUMN IF NOT EXISTS sync_schedule VARCHAR(50) DEFAULT '0 6 * * *',
  ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error_message TEXT,
  ADD COLUMN IF NOT EXISTS configured_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE channel_daily_metrics
  ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC(6, 2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS channel_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT REFERENCES social_channels(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  sync_type VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'manual' | 'health_check'
  status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success' | 'failed' | 'partial'
  metrics_synced INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by VARCHAR(100) DEFAULT 'cron_scheduler',
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_channel ON channel_sync_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_platform ON channel_sync_logs(platform);

ALTER TABLE channel_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read channel sync logs for authenticated users"
ON channel_sync_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert channel sync logs for admin and head"
ON channel_sync_logs FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);
