-- Anak Juara — schema.sql
-- Jalankan di Supabase SQL editor (atau `supabase db push`) pada project baru.
-- Urutan penting: extension -> tables -> indexes -> RLS -> policies -> triggers.

create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- kode pendek yang dipakai anak di /anak/login untuk menemukan keluarganya
  -- (anak tidak punya email, jadi tidak bisa lewat Supabase Auth langsung).
  invite_code text unique not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  created_at timestamptz not null default now()
);

-- `id` di sini sengaja SAMA dengan auth.users.id untuk role 'ortu' (Supabase Auth),
-- supaya auth.uid() bisa langsung dipakai di RLS. Untuk role 'anak' (login PIN,
-- tanpa email), id di-generate manual dan TIDAK ada baris di auth.users.
create table app_users (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  role text not null check (role in ('ortu', 'anak')),
  username text not null,
  auth_method text not null check (auth_method in ('password', 'pin')),
  pin_hash text, -- hanya diisi untuk role 'anak'; hash SHA-256, bukan plaintext
  avatar_color text not null default '#FF7A59',
  class_info text,
  stars integer not null default 0 check (stars >= 0),
  created_at timestamptz not null default now(),
  unique (family_id, username)
);

create table missions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  icon text not null default '⭐',
  verify_type text not null check (verify_type in ('foto', 'rekam', 'kuis')),
  days int[] not null default '{0,1,2,3,4,5,6}', -- 0=Senin..6=Minggu
  assigned_to uuid[] not null default '{}',
  stars integer not null check (stars > 0),
  deadline_time time not null default '18:00',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  child_id uuid not null references app_users(id) on delete cascade,
  date date not null,
  verify_type text not null check (verify_type in ('foto', 'rekam', 'kuis')),
  status text not null check (status in ('pending', 'approved', 'rejected', 'auto_done')),
  photo_url text,
  audio_url text,
  quiz_json jsonb,
  score integer,
  answers_correct boolean[],
  stars_awarded integer not null default 0,
  reviewed_by uuid references app_users(id),
  "timestamp" timestamptz not null default now(),
  -- satu submission per anak, per misi, per hari
  unique (mission_id, child_id, date)
);

create table rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  icon text not null default '🎁',
  category text not null check (category in ('Uang', 'Privilege', 'Barang')),
  stars_cost integer not null check (stars_cost > 0),
  rupiah_amount integer,
  assigned_to text not null default 'all', -- 'all' | user_id (disimpan sebagai text)
  active boolean not null default true
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references app_users(id) on delete cascade,
  reward_id uuid not null references rewards(id),
  reward_name text not null,
  stars_spent integer not null,
  "timestamp" timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_app_users_family on app_users(family_id);
create index idx_missions_family on missions(family_id);
create index idx_submissions_child_date on submissions(child_id, date);
create index idx_submissions_status on submissions(status);
create index idx_rewards_family on rewards(family_id);
create index idx_redemptions_child on redemptions(child_id);

-- ============================================================
-- HELPER: keluarga milik user yang sedang login (ortu)
-- ============================================================

create or replace function current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from app_users where id = auth.uid() limit 1;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Catatan: akun 'anak' login via PIN lewat API route server-side
-- (service-role key), BUKAN lewat Supabase Auth — jadi anak tidak
-- punya auth.uid(). Semua query untuk anak harus lewat API route
-- yang memakai service-role client (bypass RLS, tapi divalidasi
-- manual di kode). Policy di bawah ini melindungi akses langsung
-- dari browser, yang hanya relevan untuk sesi 'ortu'.

alter table families enable row level security;
alter table app_users enable row level security;
alter table missions enable row level security;
alter table submissions enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

create policy "ortu lihat keluarga sendiri" on families
  for select using (id = current_family_id());

create policy "ortu lihat anggota sekeluarga" on app_users
  for select using (family_id = current_family_id());

create policy "ortu kelola misi sekeluarga" on missions
  for all using (family_id = current_family_id())
  with check (family_id = current_family_id());

create policy "ortu lihat & ubah submission sekeluarga" on submissions
  for all using (
    child_id in (select id from app_users where family_id = current_family_id())
  )
  with check (
    child_id in (select id from app_users where family_id = current_family_id())
  );

create policy "ortu kelola hadiah sekeluarga" on rewards
  for all using (family_id = current_family_id())
  with check (family_id = current_family_id());

create policy "ortu lihat penukaran sekeluarga" on redemptions
  for all using (
    child_id in (select id from app_users where family_id = current_family_id())
  );

-- ============================================================
-- SEED CATATAN
-- ============================================================
-- Tidak ada seed data di sini secara sengaja — akun ortu pertama dibuat
-- lewat Supabase Auth (sign up), lalu baris `families` + `app_users`
-- (role 'ortu') dibuat dalam satu transaksi dari API route pendaftaran.