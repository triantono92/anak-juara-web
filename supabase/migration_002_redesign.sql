-- Migration 002: Redesign columns & new schedule_blocks table
-- Jalankan di Supabase SQL editor

-- 1. families: ubah default invite_code ke 4 karakter UPPERCASE untuk keluarga baru
ALTER TABLE families ALTER COLUMN invite_code
  SET DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

-- 2. app_users: tambah kolom baru
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parent_role text CHECK (parent_role IN ('ayah','bunda','wali')),
  ADD COLUMN IF NOT EXISTS member_status text NOT NULL DEFAULT 'aktif' CHECK (member_status IN ('aktif','menunggu','pemilik')),
  ADD COLUMN IF NOT EXISTS age integer;

-- 3. missions: tambah kolom kategori dan grup
ALTER TABLE missions
  ADD COLUMN IF NOT EXISTS kategori text NOT NULL DEFAULT 'Netral'
    CHECK (kategori IN ('Ibadah','Belajar','Rumah','Sehat','Sekolah','Netral')),
  ADD COLUMN IF NOT EXISTS grup text NOT NULL DEFAULT 'Harian'
    CHECK (grup IN ('Harian','Mingguan'));

-- 4. rewards: tambah stok dan batas_per_minggu
ALTER TABLE rewards
  ADD COLUMN IF NOT EXISTS stok integer,
  ADD COLUMN IF NOT EXISTS batas_per_minggu integer;

-- 5. redemptions: tambah status (dulu langsung approved)
ALTER TABLE redemptions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'menunggu'
    CHECK (status IN ('menunggu','disetujui','ditolak'));

-- 6. Tabel baru: schedule_blocks
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  hari integer NOT NULL CHECK (hari BETWEEN 0 AND 6), -- 0=Senin..6=Minggu
  jam_mulai time NOT NULL,
  durasi_menit integer NOT NULL DEFAULT 60,
  nama text NOT NULL,
  kategori text NOT NULL DEFAULT 'Netral'
    CHECK (kategori IN ('Ibadah','Belajar','Rumah','Sehat','Sekolah','Netral')),
  mission_ids uuid[] NOT NULL DEFAULT '{}',
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_blocks_child_hari ON schedule_blocks(child_id, hari);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_family ON schedule_blocks(family_id);

-- RLS untuk schedule_blocks
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ortu kelola jadwal sekeluarga" ON schedule_blocks;
CREATE POLICY "ortu kelola jadwal sekeluarga" ON schedule_blocks
  FOR ALL USING (family_id = current_family_id())
  WITH CHECK (family_id = current_family_id());
