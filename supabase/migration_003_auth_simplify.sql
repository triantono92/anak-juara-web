-- migration_003_auth_simplify.sql
-- Mengganti sistem auth anak dari PIN custom → Supabase Auth email+password.
-- Setelah migrasi ini, SEMUA pengguna (ortu & anak) masuk lewat Supabase Auth.
-- Jalankan di Supabase SQL editor setelah migration_002_redesign.sql.

-- ============================================================
-- 1. Update constraint auth_method: hapus 'pin', hanya 'password'
-- ============================================================
alter table app_users
  drop constraint if exists app_users_auth_method_check;

alter table app_users
  add constraint app_users_auth_method_check
  check (auth_method in ('password'));

-- ============================================================
-- 2. Hapus kolom PIN yang sudah tidak dipakai
-- ============================================================
alter table app_users
  drop column if exists pin_hash;

-- ============================================================
-- 3. Update helper function: current_family_id() sekarang berlaku
--    untuk semua role (ortu & anak) karena keduanya punya baris
--    di auth.users.
-- ============================================================
create or replace function current_family_id()
returns uuid
language sql
stable
security definer
as $$
  select family_id
  from app_users
  where id = auth.uid()
  limit 1;
$$;

-- ============================================================
-- 4. RLS policies baru untuk app_users
--    Sebelum: hanya ortu yang punya Supabase Auth session.
--    Sesudah: anak juga punya session, jadi bisa pakai auth.uid().
-- ============================================================
drop policy if exists "ortu baca anggota keluarga sendiri" on app_users;
drop policy if exists "anak baca diri sendiri" on app_users;
drop policy if exists "anggota baca keluarga" on app_users;

create policy "anggota baca keluarga"
  on app_users for select
  using (family_id = current_family_id());

-- ============================================================
-- 5. Pastikan RLS aktif
-- ============================================================
alter table app_users enable row level security;
alter table missions enable row level security;
alter table submissions enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;
