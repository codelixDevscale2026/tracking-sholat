**Labels:** `feature`, `fullstack`, `core-logic`, `priority: critical`

> **Changelog v2.0:** Tambah LATE + EARLY ke enum PrayerStatus, tambah bufferSnapshotMinutes + adzanSnapshotTime ke PrayerLog (kritis untuk integritas historis), hapus latitude/longitude dari request body checkin.

---

## Overview / Problem

Ini adalah **fitur inti** aplikasi. Pengguna membutuhkan tombol satu klik untuk menandai sholat selesai. Backend harus merekam timestamp presisi, membandingkannya dengan waktu adzan + buffer, dan menentukan status secara otomatis. UI harus menampilkan indikator status berwarna.

---

## Current Behaviour

Belum ada mekanisme check-in. Tidak ada pencatatan aktivitas sholat maupun kalkulasi status kedisiplinan.

---

## Expected Behaviour

- `POST /api/v1/prayers/checkin` menerima `prayer_name`, merekam `check_in_timestamp` server-side
- **Logika kalkulasi status:**
  - `check_in < adzan_time` → `400 PRAYER_TIME_NOT_YET`
  - `check_in ≤ adzan_time + buffer` → 🟢 **on-time**
  - `check_in > adzan_time + buffer` DAN sebelum adzan berikutnya → 🟡 **performed**
  - `check_in > adzan_time + buffer + grace_window` → 🟠 **late** _(opsional)_
  - `check_in < adzan_time` (edge case jam device salah) → 🔵 **early** _(ditandai untuk ditinjau)_
  - Tidak ada check-in hingga adzan berikutnya → 🔴 **missed** (ditangani Feature #8)
- Response: `prayer_name`, `check_in_at`, `adzan_time`, `buffer_limit`, `status`, `response_time_minutes`
- **Snapshot disimpan saat check-in** agar status historis tidak berubah jika user mengubah settings kemudian
- **Validasi:** tolak jika belum masuk waktu sholat (`400`), tolak duplicate check-in (`409`), tolak jika sudah missed (`422`)
- Request body **tidak perlu** `latitude`/`longitude` — lokasi diambil dari `prayer_settings` user

---

## Relevant Files

- `prisma/schema.prisma` — model `PrayerLog`, enum `PrayerStatus`
- `src/routes/prayers.ts` (Hono.js)
- `src/services/statusCalculation.ts`
- `src/client/components/PrayerCard.tsx`, `src/client/components/StatusBadge.tsx`
- `src/client/hooks/useCheckIn.ts` (TanStack Query `useMutation`)
- Referensi: [ERD v2.1] — Tabel `prayer_logs`
- Referensi: [API Contract v2.1] — Section 2.2 (POST /prayers/checkin)

---

## Tasks

### Database (Prisma)

- [x] Definisikan enum `PrayerStatus`:
  ```prisma
  enum PrayerStatus {
    ON_TIME
    PERFORMED
    LATE       // ← baru: melewati grace window (opsional)
    MISSED
    EARLY      // ← baru: check-in sebelum adzan
  }
  ```
  > **Note:** LATE dan EARLY ditunda implementasinya, enum saat ini: `ON_TIME | PERFORMED | MISSED`
  
- [x] Definisikan enum `PrayerName`:
  ```prisma
  enum PrayerName {
    subuh
    dzuhur
    ashar
    maghrib
    isya
  }
  ```

- [x] Update model `PrayerLog` di `prisma/schema.prisma`:
  - `prayerName` menggunakan enum `PrayerName`
  - `status` menggunakan enum `PrayerStatus`
  - Snapshot fields sudah lengkap (bufferSnapshotMinutes, adzanSnapshotTime)

- [ ] ~~Jalankan `prisma migrate dev`~~ — **AKAN DILAKUKAN MANUAL**
- [ ] ~~Buat seed script untuk data sample~~ — **DITUNDA**

### Backend (Hono.js)

- [x] Buat route `POST /api/v1/prayers/checkin`
  - Request body: `{ prayer_name: string }` — **tanpa** latitude/longitude
  - Ambil `adzan_time` dari `daily_prayer_schedules` untuk user + hari ini + prayer_name
  - Ambil `global_buffer_minutes` dari `prayer_settings` user
  - Menggunakan `authMiddleware` untuk autentikasi
  
- [x] Implementasi `prayer-checkin.service.ts`:
  - `calculateCheckInStatus()`: Hitung status ON_TIME / PERFORMED
  - `validateCheckInTime()`: Validasi check_in >= adzan_time
  - Hitung `buffer_limit = adzan_time + buffer_minutes`
  - Hitung `response_time_minutes = check_in - adzan_time`

- [x] Validasi di `checkInPrayer` controller:
  - `check_in < adzan_time` → `400 PRAYER_TIME_NOT_YET`
  - Duplicate check-in → `409 DUPLICATE_CHECKIN`
  - Status sudah missed → `422 PRAYER_ALREADY_MISSED`

- [x] Simpan `PrayerLog` dengan snapshot:
  ```
  bufferSnapshotMinutes = prayer_settings.globalBufferMinutes  // snapshot saat ini
  adzanSnapshotTime     = daily_prayer_schedules.scheduledAdzanTime  // snapshot saat ini
  ```

- [x] Format response sesuai [API Contract v2.1 Section 2.2]
- [x] Update `getTodaySchedule`: include `checkInAt`, `responseTimeMinutes`, `isChecked`
- [ ] ~~Tulis unit test untuk setiap skenario status~~ — **DITUNDA (integration test)**
- [ ] ~~Tulis integration test end-to-end~~ — **AKAN DILAKUKAN TERPISAH**

### Frontend (React + TanStack Query)

- [x] Implementasi tombol check-in di `PrayerCard` — kirim hanya `prayer_name`
  - Handle click event
  - Loading state dengan spinner
  - Disable saat loading atau tidak memenuhi syarat
  
- [x] Buat hook `useCheckIn` dengan `useMutation` dari TanStack Query
  - Toast notifications untuk success/error
  - Error handling untuk 400, 409, 422
  
- [x] Implementasi optimistic update: invalidate query `todaySchedule` setelah mutation sukses

- [ ] ~~Desain komponen `StatusBadge` dengan 5 variasi warna~~ — **DITUNDA**
  > Status badge sudah di-handle dalam PrayerCard

- [x] Disable tombol jika: sudah check-in, belum masuk waktu (upcoming), atau sudah missed
- [x] Handle error network dan semua error code (400, 409, 422, 500)
- [x] Responsive design untuk mobile — **sudah built-in**
