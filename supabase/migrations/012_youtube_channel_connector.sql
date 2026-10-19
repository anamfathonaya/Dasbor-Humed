-- Migrasi 012: Tabel Kanal YouTube Terhubung & Metadata OAuth (YouTube Data API v3 + Analytics API)
-- Terintegrasi dengan fondasi social_channels dan channel_credentials

CREATE TABLE IF NOT EXISTS youtube_connected_channels (
  id BIGSERIAL PRIMARY KEY,
  social_channel_id BIGINT REFERENCES social_channels(id) ON DELETE CASCADE,
  youtube_channel_id VARCHAR(120) NOT NULL UNIQUE, -- contoh: UCxHumasKemensosRI2026
  channel_title VARCHAR(255) NOT NULL,
  custom_url VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  total_views_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  analytics_views_30d BIGINT DEFAULT 0,
  analytics_watch_time_minutes_30d BIGINT DEFAULT 0,
  analytics_engagements_30d BIGINT DEFAULT 0,
  granted_scopes TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
  oauth_status VARCHAR(50) NOT NULL DEFAULT 'connected', -- 'connected' | 'expiring_soon' | 'expired' | 'disconnected'
  token_expires_at TIMESTAMPTZ,
  last_health_check_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  connected_by_email VARCHAR(255) DEFAULT 'admin.humas@kemensos.go.id',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_youtube_connected_channels_yt_id ON youtube_connected_channels(youtube_channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_connected_channels_status ON youtube_connected_channels(oauth_status);

ALTER TABLE youtube_connected_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read youtube_connected_channels for authenticated users"
ON youtube_connected_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow manage youtube_connected_channels for admin and head"
ON youtube_connected_channels FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);
