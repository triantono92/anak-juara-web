# Anak Juara — Web App

Versi production, hosted, multi-device dari aplikasi kontrol pencapaian anak.
Dibangun dengan Next.js (App Router) + Supabase + Anthropic API, sesuai
`anak-juara-spesifikasi.md`.

## Status implementasi

**Sudah jalan penuh (server component + API route nyata, sudah lolos `tsc` & `next build`):**
- Landing, login anak (kode keluarga + PIN), login/daftar ortu (Supabase Auth)
- `/anak/misi` — upload foto, rekam suara, kuis otomatis (foto materi → Claude vision → soal → nilai → bintang masuk otomatis)
- `/anak/toko` — tukar hadiah
- `/anak/riwayat` — riwayat aktivitas
- `/ortu/persetujuan` — approve/reject submission + info kuis otomatis
- `/ortu/anggota` — kelola anggota, kode undangan keluarga
- `/ortu/misi`, `/ortu/hadiah` — CRUD misi & hadiah
- `/ortu/laporan` — statistik per anak (mingguan/bulanan), dihitung langsung dari data

**Belum diuji dengan Supabase/Anthropic API sungguhan** — sandbox pengembangan ini
tidak punya akses jaringan ke Supabase/Anthropic/Vercel, jadi validasi yang sudah
dilakukan adalah `tsc --noEmit`, `eslint`, dan `next build` (lolos semua). Sebelum
dipakai keluarga sungguhan, jalankan `npm run dev` dengan environment variable asli
dan uji end-to-end.

## Setup

1. **Buat project Supabase baru**, lalu jalankan `supabase/schema.sql` di SQL Editor.
2. **Buat Storage bucket** bernama `submissions` (public read) — dipakai untuk foto
   bukti misi. Ini tidak bisa dibuat lewat SQL, harus lewat dashboard/CLI:
   ```
   supabase storage buckets create submissions --public
   ```
3. **Salin `.env.example` ke `.env.local`** dan isi:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     — dari Project Settings > API di dashboard Supabase
   - `ANTHROPIC_API_KEY` — dari console.anthropic.com
   - `CHILD_SESSION_SECRET` — string acak, mis. `openssl rand -base64 32`
4. `npm install && npm run dev`

## Deploy ke Vercel

- Hubungkan repo GitHub project ini ke Vercel.
- Isi environment variable yang sama seperti `.env.local` di Vercel Project Settings.
- Auto-deploy setiap push ke branch utama.

## Keputusan desain yang sudah diambil

- **Login anak**: setiap keluarga dapat *kode undangan* 6 karakter (`families.invite_code`,
  di-generate otomatis). Anak memakai kode ini + username + PIN 4 digit di `/anak/login`.
  Ini menjawab celah di spesifikasi awal soal bagaimana anak "menemukan" keluarganya
  di aplikasi multi-tenant.
- **Sesi anak** memakai cookie HMAC-signed custom (`src/lib/childSession.ts`), terpisah
  dari Supabase Auth, karena anak tidak punya email. RLS Supabase hanya berlaku untuk
  sesi ortu (Supabase Auth); semua akses data anak wajib lewat API route yang memvalidasi
  cookie ini lalu memakai service-role client.
- **PIN disimpan sebagai hash SHA-256** (`pin_hash`), bukan plaintext.

## Yang masih perlu diputuskan (dibawa dari spesifikasi §6, belum berubah)

- Rate limiting untuk `/api/quiz/generate` supaya kuota/biaya Anthropic API terkendali
  per keluarga (belum diimplementasi — saat ini setiap request langsung diteruskan).
- Kompresi foto sudah ada di client (`src/lib/imageCompress.ts`, max 800px/900px, JPEG
  quality 0.7–0.75) — sesuaikan lagi kalau ukuran storage jadi masalah.
- Kebijakan retensi rekaman audio: prototipe di halaman `/anak/misi` untuk misi jenis
  "rekam" saat ini **hanya merekam durasi (timer)**, belum benar-benar mengunggah file
  audio ke Storage — perlu diputuskan format (webm/mp3), lalu disambungkan mirip alur
  `/api/upload` yang sudah ada untuk foto.
- Push notification ke ortu saat ada submission baru — belum diimplementasikan (opsional
  di spesifikasi, bisa pakai Web Push + service worker).
- Fungsi `increment_stars` disebut di komentar kode tapi implementasi saat ini pakai
  read-then-write biasa (bukan atomic). Untuk 1 keluarga kecil ini cukup aman, tapi kalau
  mau lebih robust, buat Postgres function `increment_stars(p_user_id uuid, p_delta int)`
  dan panggil lewat `.rpc()`.

## Struktur folder

```
src/
  app/
    anak/            — halaman anak (login di luar guard, sisanya di route group (app))
    ortu/            — halaman ortu (sama polanya)
    api/              — semua API route (child-auth, quiz, upload, submissions, redemptions, family)
  components/         — komponen UI + client component yang manggil API/Server Actions
  lib/
    supabase/         — client browser/server/service + middleware refresh sesi
    types.ts           — tipe TypeScript sesuai schema.sql
    childSession.ts     — sign/verify sesi PIN anak
    auth.ts             — helper getChildSession() & getParentUser()
    imageCompress.ts    — kompresi foto di browser sebelum upload
supabase/
  schema.sql          — DDL lengkap + RLS policies
```
