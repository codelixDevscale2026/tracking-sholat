**Labels:** `feature`, `fullstack`, `priority: critical`

> **Changelog v2.0:** Tambah calculationMethod, autoDetectLocation, cityName ke Prisma model PrayerSetting. Tambah task GET /settings dan task frontend untuk Calculation Method sub-screen.

---

## Overview / Problem

Pengguna membutuhkan waktu transisi setelah adzan (wudhu, perjalanan ke masjid). Standar "tepat saat adzan" tidak realistis. Diperlukan sistem toleransi yang dapat dipersonalisasi, serta konfigurasi lokasi dan metode kalkulasi waktu sholat.

---

## Current Behaviour

Belum ada mekanisme buffer. Tidak ada cara mengatur toleransi waktu, lokasi, atau metode kalkulasi sholat.

---

## Expected Behaviour

- `GET /api/v1/settings` mengembalikan semua pengaturan saat ini (termasuk `available_calculation_methods`)
- `PATCH /api/v1/settings` menerima partial update untuk semua field pengaturan
- Validasi range buffer: 5–60 menit, default 20
- Halaman Settings menampilkan slider buffer, koordinat GPS, toggle auto-detect, dan selector metode kalkulasi
- Perubahan buffer langsung mempengaruhi kalkulasi status di seluruh aplikasi
- Dashboard menampilkan "Batas On-Time" = `adzan + buffer` di setiap kartu sholat
- TanStack Query mengelola cache settings dan invalidation setelah update

---

## Relevant Files

- `prisma/schema.prisma` — model `PrayerSetting`
- `src/routes/settings.ts` (Hono.js)
- `src/client/pages/Settings.tsx`
- `src/client/pages/CalculationMethod.tsx` ← sub-halaman baru
- `src/client/components/BufferSlider.tsx`
- `src/client/hooks/useSettings.ts` (TanStack Query)
- Referensi: [ERD v2.1] — Tabel `prayer_settings`
- Referensi: [API Contract v2.1] — Section 5 (GET/PATCH /settings)
- Referensi: [UI Spec Mobile v1.0] — Screen Settings

---

## Tasks

### Database (Prisma)

- [ ] Definisikan model `PrayerSetting` di `prisma/schema.prisma`:
  ```prisma
  model PrayerSetting {
    id                    Int      @id @default(autoincrement())
    userId                Int      @unique
    globalBufferMinutes   Int      @default(20)
    latitude              Decimal? @db.Decimal(9, 6)
    longitude             Decimal? @db.Decimal(9, 6)
    cityName              String?             // ← reverse geocode result
    timezone              String   @default("Asia/Jakarta")
    autoDetectLocation    Boolean  @default(true)  // ← baru
    calculationMethod     String   @default("mwl") // ← baru
    updatedAt             DateTime @updatedAt

    user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```
- [ ] Jalankan `prisma migrate dev`
- [ ] Buat seed script dengan data default per user baru

### Backend (Hono.js)

- [ ] Buat route `GET /api/v1/settings`:
  - Return semua field + `available_calculation_methods` (list statis di kode)
  - Jika belum ada row, buat otomatis dengan default values
- [ ] Buat route `PATCH /api/v1/settings`:
  - Partial update via Prisma `update` (semua field opsional)
  - Validasi: buffer range 5–60, format koordinat valid
  - Jika `latitude`/`longitude` berubah: trigger reverse geocoding → update `cityName`
  - Jika `calculationMethod` berubah: invalidate `daily_prayer_schedules` user hari ini (hapus cache)
- [ ] Tulis unit test

### Frontend (React + TanStack Query)

- [ ] Desain dan implementasi halaman Settings sesuai [UI Spec Mobile v1.0 Section 7]
- [ ] Buat hook `useSettings` (`useQuery`) dan `useUpdateSettings` (`useMutation`)
- [ ] Implementasi slider `globalBufferMinutes` — PATCH dengan debounce 500ms, rollback UI jika gagal
- [ ] Implementasi tombol Refresh koordinat — pakai `navigator.geolocation`, PATCH koordinat baru
- [ ] Implementasi toggle `autoDetectLocation` — PATCH saat toggle berubah
- [ ] Implementasi sub-halaman `/settings/calculation-method`:
  - Tampilkan `<RadioGroup>` dengan daftar dari `available_calculation_methods`
  - Tap pilihan → PATCH `calculationMethod` + navigate back + invalidate `useTodaySchedule`
- [ ] Tampilkan "Batas On-Time" (`adzan + buffer`) di setiap `PrayerCard`
- [ ] Invalidate query `todaySchedule` dan `statsSummary` setelah settings update
- [ ] Validasi input buffer (min 5, max 60) di sisi client