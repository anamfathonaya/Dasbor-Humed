-- Migrasi 007: Tabel Hasil Perbandingan Modul & Matriks Paritas Hak Akses
CREATE TABLE IF NOT EXISTS module_parity_records (
  id BIGSERIAL PRIMARY KEY,
  module_name VARCHAR(100) NOT NULL,
  astro_route VARCHAR(150) NOT NULL,
  nextjs_route VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'matched', -- 'matched' | 'drift' | 'verified'
  api_endpoints_count INTEGER DEFAULT 0,
  rls_policies_count INTEGER DEFAULT 0,
  ui_parity_score INTEGER DEFAULT 100,
  notes TEXT,
  tested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_access_parity (
  id BIGSERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  astro_allowed BOOLEAN NOT NULL DEFAULT true,
  supabase_rls_allowed BOOLEAN NOT NULL DEFAULT true,
  parity_status VARCHAR(50) NOT NULL DEFAULT 'matched',
  verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE module_parity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_access_parity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read module parity records"
ON module_parity_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow read role access parity"
ON role_access_parity FOR SELECT
TO authenticated
USING (true);
