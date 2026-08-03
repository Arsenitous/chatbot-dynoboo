-- ============================================================
-- 005 - Admin Users Permissions (PBAC)
-- ============================================================

-- Menambahkan kolom permissions (JSONB)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Untuk memastikan superadmin saat ini memiliki akses ['all'] (walau akan selalu di-bypass di backend, ini opsional untuk kerapihan data)
UPDATE admin_users SET permissions = '["all"]'::jsonb WHERE role = 'superadmin';
