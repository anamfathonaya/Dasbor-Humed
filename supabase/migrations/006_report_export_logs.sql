-- Migrasi 006: Tabel Riwayat Uji Ekspor Laporan (report_export_logs)
CREATE TABLE IF NOT EXISTS report_export_logs (
  id BIGSERIAL PRIMARY KEY,
  export_type VARCHAR(50) NOT NULL, -- 'budget' | 'performance' | 'annual' | 'audit' | 'metrics'
  format VARCHAR(20) NOT NULL,       -- 'csv' | 'xlsx' | 'pdf' | 'json'
  status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'completed' | 'split_needed' | 'failed'
  total_rows INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  download_url TEXT,
  split_count INTEGER DEFAULT 1,
  tested_by VARCHAR(150) DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_logs_type ON report_export_logs(export_type);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON report_export_logs(status);

-- RLS Policies
ALTER TABLE report_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read export logs to authenticated staff"
ON report_export_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert export logs to authenticated staff"
ON report_export_logs FOR INSERT
TO authenticated
WITH CHECK (true);
