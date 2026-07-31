-- ============================================================
-- JALANKAN SQL INI DI SUPABASE DASHBOARD → SQL Editor
-- ============================================================

ALTER TABLE pesanan 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'AKTIF'
    CHECK (status IN ('AKTIF', 'SELESAI')),
  ADD COLUMN IF NOT EXISTS selesai_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS diselesaikan_oleh TEXT;
