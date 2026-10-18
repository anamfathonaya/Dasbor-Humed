-- Migrasi 010: Tabel Log Webhook Kanal (channel_webhook_logs) dengan RLS
CREATE TABLE IF NOT EXISTS channel_webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT REFERENCES social_channels(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload_json TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'received', -- 'received' | 'processed' | 'failed' | 'ignored'
  ip_address VARCHAR(50),
  signature_verified BOOLEAN DEFAULT true,
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON channel_webhook_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_platform ON channel_webhook_logs(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON channel_webhook_logs(status);

-- RLS
ALTER TABLE channel_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read webhook logs for admin and head only"
ON channel_webhook_logs FOR SELECT
TO authenticated
USING (
  (auth.jwt()->>'role') IN ('head', 'admin') OR
  (auth.jwt()->'app_metadata'->>'role') IN ('head', 'admin')
);

CREATE POLICY "Allow insert webhook logs from system or admin"
ON channel_webhook_logs FOR INSERT
TO authenticated
WITH CHECK (true);
