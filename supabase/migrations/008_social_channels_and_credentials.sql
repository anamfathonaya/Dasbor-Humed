-- Migrasi 008: Tabel Kanal Media Sosial & Kredensial Terenkripsi (social_channels & channel_credentials)
CREATE TABLE IF NOT EXISTS social_channels (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'telegram' | 'website'
  handle VARCHAR(150) NOT NULL,
  followers_count BIGINT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'connected', -- 'connected' | 'disconnected' | 'reauth_required'
  platform_url TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channel_credentials (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT REFERENCES social_channels(id) ON DELETE CASCADE,
  auth_type VARCHAR(50) NOT NULL DEFAULT 'oauth2', -- 'oauth2' | 'api_key' | 'webhook'
  encrypted_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_channels_platform ON social_channels(platform);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_channel ON channel_credentials(channel_id);

-- RLS
ALTER TABLE social_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_credentials ENABLE ROW LEVEL SECURITY;

-- social_channels: Staf, admin, dan head dapat membaca kanal
CREATE POLICY "Allow read social channels for authenticated users"
ON social_channels FOR SELECT
TO authenticated
USING (true);

-- social_channels: Hanya admin dan head yang dapat menambah/mengubah kanal
CREATE POLICY "Allow manage social channels for admin and head"
ON social_channels FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);

-- channel_credentials: Hanya admin dan head yang dapat mengakses kredensial sensitif
CREATE POLICY "Allow manage credentials for admin and head only"
ON channel_credentials FOR ALL
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);
