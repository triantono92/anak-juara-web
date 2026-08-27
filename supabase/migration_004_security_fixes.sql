-- migration_004_security_fixes.sql
-- Perbaikan keamanan: RLS policy UPDATE/DELETE untuk app_users + fungsi
-- increment_stars atomik untuk menghindari race condition bintang.
-- Jalankan setelah migration_003_auth_simplify.sql.

-- ============================================================
-- 1. RLS policy UPDATE untuk app_users
--    Dipakai oleh: approveMember (update member_status).
--    Hanya boleh mengubah anggota di keluarga sendiri.
--    Tambahan: tidak boleh mengubah baris milik diri sendiri lewat policy ini
--    (pemilik akun sendiri dikelola via Supabase Auth, bukan di sini).
-- ============================================================
drop policy if exists "ortu update anggota sekeluarga" on app_users;
create policy "ortu update anggota sekeluarga"
  on app_users for update
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- ============================================================
-- 2. RLS policy DELETE untuk app_users
--    Dipakai oleh: rejectMember (hapus anggota menunggu).
--    Hanya boleh menghapus anggota di keluarga sendiri.
-- ============================================================
drop policy if exists "ortu hapus anggota sekeluarga" on app_users;
create policy "ortu hapus anggota sekeluarga"
  on app_users for delete
  using (family_id = current_family_id());

-- ============================================================
-- 3. Fungsi increment_stars — update bintang atomik di level DB.
--    p_delta boleh negatif (pengurangan bintang saat tukar hadiah).
--    GREATEST(0, ...) mencegah bintang minus.
--    security definer: bisa dipanggil oleh service-role client
--    maupun dari RLS-scoped client.
-- ============================================================
create or replace function increment_stars(p_user_id uuid, p_delta int)
returns void
language sql
security definer
set search_path = public
as $$
  update app_users
  set stars = greatest(0, stars + p_delta)
  where id = p_user_id;
$$;
