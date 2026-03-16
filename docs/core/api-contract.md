# API Contract — Sholat Tracker
**Versi:** 2.0  
**Tanggal:** 17 Maret 2026  
**Base URL:** `https://api.yourdomain.com/api/v1`  
**Auth:** Bearer Token (JWT) — wajib di semua endpoint kecuali `/auth/*`

> **Changelog dari v1.0:**
> - ✅ Ditambahkan: Auth (register, login, logout, me)
> - ✅ Ditambahkan: GET /settings
> - ✅ Ditambahkan: GET /prayers/history
> - ✅ Diperbaiki: GET /prayers/today — tambah `city_name`, `buffer_limit`, `next_prayer`
> - ✅ Diperbaiki: GET /stats/summary — tambah `on_time_percentage`, `prayer_breakdown`, `daily_trend`
> - ✅ Diperbaiki: PATCH /settings — tambah `calculation_method`
> - ✅ Ditambahkan: Error response standar untuk semua endpoint

---

## Konvensi Umum

### Request Header
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Format Waktu
Semua field waktu menggunakan **ISO 8601 UTC** (`2026-02-04T04:15:00Z`). Konversi ke timezone lokal dilakukan di sisi frontend berdasarkan `timezone` dari settings user.

### Status Sholat (Enum)
| Value | Deskripsi |
|---|---|
| `pending` | Waktu sudah masuk, belum check-in, masih dalam window |
| `upcoming` | Waktu belum masuk |
| `on-time` | Check-in ≤ adzan + buffer |
| `performed` | Check-in > adzan + buffer, tapi sebelum adzan berikutnya |
| `late` | Check-in melewati grace window tambahan (opsional) |
| `missed` | Tidak ada check-in hingga adzan berikutnya masuk |
| `early` | Check-in sebelum adzan (ditandai untuk ditinjau) |

### Standard Error Response
Semua endpoint mengembalikan format error yang seragam:
```json
{
  "error": {
    "code": "DUPLICATE_CHECKIN",
    "message": "Anda sudah melakukan check-in untuk sholat ini hari ini.",
    "status": 409
  }
}
```

| HTTP Status | Error Code | Kondisi |
|---|---|---|
| `400` | `INVALID_REQUEST` | Body/query tidak valid |
| `400` | `PRAYER_TIME_NOT_YET` | Check-in sebelum adzan |
| `401` | `UNAUTHORIZED` | Token tidak ada atau expired |
| `401` | `INVALID_CREDENTIALS` | Email/password salah |
| `409` | `DUPLICATE_CHECKIN` | Sudah check-in untuk sholat ini hari ini |
| `409` | `EMAIL_ALREADY_EXISTS` | Email sudah terdaftar |
| `422` | `PRAYER_ALREADY_MISSED` | Sholat sudah berstatus missed |
| `500` | `INTERNAL_ERROR` | Kesalahan server |

---

## 1. Authentication

### 1.1 Register

- **Endpoint:** `POST /auth/register`
- **Auth:** Tidak diperlukan
- **Request Body:**
```json
{
  "full_name": "Ahmad Anas",
  "email": "anas@example.com",
  "password": "min8karakter"
}
```
- **Response `201 Created`:**
```json
{
  "message": "Registrasi berhasil.",
  "data": {
    "user": {
      "id": "usr_01J8XZ",
      "full_name": "Ahmad Anas",
      "email": "anas@example.com",
      "created_at": "2026-03-17T08:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
- **Errors:** `409 EMAIL_ALREADY_EXISTS`, `400 INVALID_REQUEST`

---

### 1.2 Login

- **Endpoint:** `POST /auth/login`
- **Auth:** Tidak diperlukan
- **Request Body:**
```json
{
  "email": "anas@example.com",
  "password": "min8karakter"
}
```
- **Response `200 OK`:**
```json
{
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "usr_01J8XZ",
      "full_name": "Ahmad Anas",
      "email": "anas@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
- **Errors:** `401 INVALID_CREDENTIALS`

---

### 1.3 Logout

- **Endpoint:** `POST /auth/logout`
- **Auth:** Required
- **Response `200 OK`:**
```json
{
  "message": "Logout berhasil."
}
```

---

### 1.4 Get Current User

Digunakan untuk memuat ulang data user saat app dibuka (token masih valid).

- **Endpoint:** `GET /auth/me`
- **Auth:** Required
- **Response `200 OK`:**
```json
{
  "data": {
    "id": "usr_01J8XZ",
    "full_name": "Ahmad Anas",
    "email": "anas@example.com",
    "created_at": "2026-03-17T08:00:00Z"
  }
}
```

---

## 2. Prayers — Home Screen

### 2.1 Get Today's Schedule & Status

Mengambil jadwal sholat hari ini beserta status check-in. Dipanggil saat Home screen dibuka dan di-refresh via TanStack Query.

- **Endpoint:** `GET /prayers/today`
- **Auth:** Required
- **Response `200 OK`:**
```json
{
  "date": "2026-03-17",
  "city_name": "Surabaya, Indonesia",
  "buffer_minutes": 20,
  "next_prayer": {
    "prayer_name": "ashar",
    "adzan_time": "2026-03-17T08:15:00Z",
    "countdown_seconds": 4355
  },
  "schedules": [
    {
      "prayer_name": "subuh",
      "adzan_time": "2026-03-17T22:30:00Z",
      "buffer_limit": "2026-03-17T22:50:00Z",
      "status": "on-time",
      "check_in_at": "2026-03-17T22:35:00Z",
      "response_time_minutes": 5,
      "is_checked": true
    },
    {
      "prayer_name": "dzuhur",
      "adzan_time": "2026-03-17T05:02:00Z",
      "buffer_limit": "2026-03-17T05:22:00Z",
      "status": "performed",
      "check_in_at": "2026-03-17T05:30:00Z",
      "response_time_minutes": 28,
      "is_checked": true
    },
    {
      "prayer_name": "ashar",
      "adzan_time": "2026-03-17T08:15:00Z",
      "buffer_limit": "2026-03-17T08:35:00Z",
      "status": "pending",
      "check_in_at": null,
      "response_time_minutes": null,
      "is_checked": false
    },
    {
      "prayer_name": "maghrib",
      "adzan_time": "2026-03-17T11:05:00Z",
      "buffer_limit": "2026-03-17T11:25:00Z",
      "status": "upcoming",
      "check_in_at": null,
      "response_time_minutes": null,
      "is_checked": false
    },
    {
      "prayer_name": "isya",
      "adzan_time": "2026-03-17T12:15:00Z",
      "buffer_limit": "2026-03-17T12:35:00Z",
      "status": "upcoming",
      "check_in_at": null,
      "response_time_minutes": null,
      "is_checked": false
    }
  ]
}
```

> **Catatan perubahan dari v1.0:**
> - Ditambahkan `city_name` → digunakan di header Home screen ("Surabaya, Indonesia")
> - Ditambahkan `buffer_limit` per sholat → digunakan untuk label "Batas: HH:MM" di Prayer Card
> - Ditambahkan `next_prayer` + `countdown_seconds` → digunakan untuk countdown timer
> - Ditambahkan `response_time_minutes` → digunakan di History screen

---

### 2.2 Prayer Check-in

Endpoint utama untuk menandai sholat selesai. Backend menghitung status berdasarkan timestamp saat request diterima.

- **Endpoint:** `POST /prayers/checkin`
- **Auth:** Required
- **Request Body:**
```json
{
  "prayer_name": "ashar"
}
```
- **Response `201 Created`:**
```json
{
  "message": "Check-in berhasil.",
  "data": {
    "prayer_name": "ashar",
    "adzan_time": "2026-03-17T08:15:00Z",
    "buffer_limit": "2026-03-17T08:35:00Z",
    "check_in_at": "2026-03-17T08:25:10Z",
    "status": "on-time",
    "response_time_minutes": 10
  }
}
```

> **Catatan perubahan dari v1.0:**
> - Field `latitude` / `longitude` dihapus dari request body — lokasi diambil dari `prayer_settings` user, bukan dari tiap request check-in (lebih bersih).
> - Ditambahkan `buffer_limit` di response → frontend bisa update UI tanpa refetch `/today`.

**Business Logic (tidak berubah dari v1.0):**
1. Validasi `current_time >= adzan_time` → jika tidak, `400 PRAYER_TIME_NOT_YET`
2. Cek duplikasi check-in hari ini → jika ada, `409 DUPLICATE_CHECKIN`
3. Cek apakah status sudah `missed` → jika ya, `422 PRAYER_ALREADY_MISSED`
4. Tentukan status:
   - `check_in_at <= adzan_time + buffer` → **on-time**
   - `check_in_at > adzan_time + buffer` DAN sebelum adzan berikutnya → **performed**
5. Hitung `response_time_minutes = (check_in_at - adzan_time)` dalam menit

---

## 3. Prayers — History Screen

### 3.1 Get Prayer History

Mengambil riwayat sholat per hari. Digunakan di screen History dengan filter Daily/Weekly/Monthly.

- **Endpoint:** `GET /prayers/history`
- **Auth:** Required
- **Query Parameters:**

| Parameter | Type | Wajib | Deskripsi |
|---|---|---|---|
| `period` | `daily` \| `weekly` \| `monthly` | Ya | Rentang waktu |
| `date` | `YYYY-MM-DD` | Opsional | Tanggal acuan (default: hari ini) |
| `page` | integer | Opsional | Untuk pagination (default: 1) |
| `per_page` | integer | Opsional | Jumlah hari per halaman (default: 7) |

- **Contoh Request:**
```
GET /prayers/history?period=daily&date=2026-03-17
```

- **Response `200 OK`:**
```json
{
  "period": "daily",
  "pagination": {
    "current_page": 1,
    "per_page": 7,
    "total_pages": 4
  },
  "data": [
    {
      "date": "2026-03-17",
      "total_completed": 4,
      "total_prayers": 5,
      "prayers": [
        {
          "prayer_name": "subuh",
          "adzan_time": "2026-03-17T22:30:00Z",
          "buffer_limit": "2026-03-17T22:50:00Z",
          "check_in_at": "2026-03-17T22:35:00Z",
          "status": "on-time",
          "response_time_minutes": 5
        },
        {
          "prayer_name": "dzuhur",
          "adzan_time": "2026-03-17T05:02:00Z",
          "buffer_limit": "2026-03-17T05:22:00Z",
          "check_in_at": "2026-03-17T05:30:00Z",
          "status": "performed",
          "response_time_minutes": 28
        },
        {
          "prayer_name": "ashar",
          "adzan_time": "2026-03-17T08:15:00Z",
          "buffer_limit": "2026-03-17T08:35:00Z",
          "check_in_at": "2026-03-17T08:25:00Z",
          "status": "on-time",
          "response_time_minutes": 10
        },
        {
          "prayer_name": "maghrib",
          "adzan_time": "2026-03-17T11:05:00Z",
          "buffer_limit": "2026-03-17T11:25:00Z",
          "check_in_at": null,
          "status": "missed",
          "response_time_minutes": null
        },
        {
          "prayer_name": "isya",
          "adzan_time": "2026-03-17T12:15:00Z",
          "buffer_limit": "2026-03-17T12:35:00Z",
          "check_in_at": "2026-03-17T12:20:00Z",
          "status": "on-time",
          "response_time_minutes": 5
        }
      ]
    },
    {
      "date": "2026-03-16",
      "total_completed": 5,
      "total_prayers": 5,
      "prayers": [
        {
          "prayer_name": "subuh",
          "adzan_time": "2026-03-16T22:31:00Z",
          "buffer_limit": "2026-03-16T22:51:00Z",
          "check_in_at": "2026-03-16T22:40:00Z",
          "status": "on-time",
          "response_time_minutes": 9
        }
        // ... dst (dzuhur, ashar, maghrib, isya)
      ]
    }
  ]
}
```

---

## 4. Statistics Screen

### 4.1 Get Statistics Summary

Mengambil ringkasan statistik. Digunakan di screen Stats untuk metric cards, streak, chart trend, dan prayer breakdown.

- **Endpoint:** `GET /stats/summary`
- **Auth:** Required
- **Query Parameters:**

| Parameter | Type | Wajib | Deskripsi |
|---|---|---|---|
| `period` | `daily` \| `weekly` \| `monthly` | Ya | Rentang waktu |
| `date` | `YYYY-MM-DD` | Opsional | Tanggal acuan (default: hari ini) |

- **Contoh Request:**
```
GET /stats/summary?period=weekly
```

- **Response `200 OK`:**
```json
{
  "period": "weekly",
  "date_range": {
    "from": "2026-03-11",
    "to": "2026-03-17"
  },
  "summary": {
    "total_on_time": 30,
    "total_performed": 4,
    "total_missed": 1,
    "total_prayers": 35,
    "on_time_percentage": 85,
    "average_response_time_minutes": 12,
    "streak_days": 14
  },
  "daily_trend": [
    { "day": "Mon", "date": "2026-03-11", "on_time": 4, "performed": 1, "missed": 0 },
    { "day": "Tue", "date": "2026-03-12", "on_time": 5, "performed": 0, "missed": 0 },
    { "day": "Wed", "date": "2026-03-13", "on_time": 4, "performed": 0, "missed": 1 },
    { "day": "Thu", "date": "2026-03-14", "on_time": 5, "performed": 0, "missed": 0 },
    { "day": "Fri", "date": "2026-03-15", "on_time": 4, "performed": 1, "missed": 0 },
    { "day": "Sat", "date": "2026-03-16", "on_time": 4, "performed": 1, "missed": 0 },
    { "day": "Sun", "date": "2026-03-17", "on_time": 4, "performed": 1, "missed": 0 }
  ],
  "prayer_breakdown": [
    {
      "prayer_name": "subuh",
      "total": 14,
      "on_time": 13,
      "performed": 1,
      "missed": 0,
      "consistency_percentage": 92
    },
    {
      "prayer_name": "dzuhur",
      "total": 14,
      "on_time": 12,
      "performed": 2,
      "missed": 0,
      "consistency_percentage": 85
    },
    {
      "prayer_name": "ashar",
      "total": 14,
      "on_time": 11,
      "performed": 2,
      "missed": 1,
      "consistency_percentage": 78
    },
    {
      "prayer_name": "maghrib",
      "total": 14,
      "on_time": 14,
      "performed": 0,
      "missed": 0,
      "consistency_percentage": 100
    },
    {
      "prayer_name": "isya",
      "total": 14,
      "on_time": 12,
      "performed": 2,
      "missed": 0,
      "consistency_percentage": 85
    }
  ]
}
```

> **Catatan perubahan dari v1.0:**
> - Ditambahkan `on_time_percentage` → langsung dipakai sebagai "85%" di metric card
> - Ditambahkan `date_range` → untuk label konteks di UI ("11–17 Mar")
> - Ditambahkan `daily_trend` (array 7 hari) → dipakai untuk Weekly Discipline Trend chart
> - Ditambahkan `prayer_breakdown` (per sholat) → dipakai untuk Prayer Breakdown list

---

## 5. Settings Screen

### 5.1 Get Settings

Mengambil pengaturan user saat ini. Dipanggil saat Settings screen dibuka pertama kali untuk memuat nilai awal form (slider buffer, koordinat, metode kalkulasi).

- **Endpoint:** `GET /settings`
- **Auth:** Required
- **Response `200 OK`:**
```json
{
  "data": {
    "global_buffer_minutes": 20,
    "latitude": -7.2575,
    "longitude": 112.7521,
    "city_name": "Surabaya, Indonesia",
    "timezone": "Asia/Jakarta",
    "auto_detect_location": true,
    "calculation_method": "mwl",
    "available_calculation_methods": [
      { "value": "mwl",       "label": "Muslim World League (MWL)" },
      { "value": "isna",      "label": "Islamic Society of North America (ISNA)" },
      { "value": "egypt",     "label": "Egyptian General Authority of Survey" },
      { "value": "karachi",   "label": "University of Islamic Sciences, Karachi" },
      { "value": "tehran",    "label": "Institute of Geophysics, University of Tehran" },
      { "value": "kemenag",   "label": "Kementerian Agama RI" }
    ]
  }
}
```

---

### 5.2 Update Settings

Mengupdate buffer, lokasi, dan/atau metode kalkulasi. Semua field bersifat opsional — hanya kirim field yang berubah.

- **Endpoint:** `PATCH /settings`
- **Auth:** Required
- **Request Body (semua field opsional):**
```json
{
  "global_buffer_minutes": 25,
  "latitude": -7.2575,
  "longitude": 112.7521,
  "timezone": "Asia/Jakarta",
  "auto_detect_location": true,
  "calculation_method": "kemenag"
}
```
- **Response `200 OK`:**
```json
{
  "message": "Pengaturan berhasil disimpan.",
  "data": {
    "global_buffer_minutes": 25,
    "latitude": -7.2575,
    "longitude": 112.7521,
    "city_name": "Surabaya, Indonesia",
    "timezone": "Asia/Jakarta",
    "auto_detect_location": true,
    "calculation_method": "kemenag"
  }
}
```

> **Catatan perubahan dari v1.0:**
> - Ditambahkan `GET /settings` (endpoint baru)
> - Ditambahkan field `auto_detect_location` → untuk toggle GPS di UI
> - Ditambahkan field `calculation_method` → untuk Prayer Method selector di UI
> - Ditambahkan `available_calculation_methods` di GET response → untuk populate dropdown pilihan metode
> - Ditambahkan `city_name` di response → frontend tidak perlu reverse geocode sendiri

---

## 6. Ringkasan Semua Endpoint

| # | Method | Endpoint | Auth | Screen |
|---|---|---|---|---|
| 1 | `POST` | `/auth/register` | ❌ | Register |
| 2 | `POST` | `/auth/login` | ❌ | Login |
| 3 | `POST` | `/auth/logout` | ✅ | — |
| 4 | `GET`  | `/auth/me` | ✅ | App init |
| 5 | `GET`  | `/prayers/today` | ✅ | Home |
| 6 | `POST` | `/prayers/checkin` | ✅ | Home |
| 7 | `GET`  | `/prayers/history` | ✅ | History |
| 8 | `GET`  | `/stats/summary` | ✅ | Stats |
| 9 | `GET`  | `/settings` | ✅ | Settings |
| 10 | `PATCH` | `/settings` | ✅ | Settings |

---

## 7. Business Logic — Status Calculation

Tidak berubah dari v1.0, dituliskan ulang secara lengkap untuk referensi implementasi Hono.js:

```typescript
// Dipanggil saat POST /prayers/checkin
async function determineStatus(
  checkInAt: Date,
  adzanTime: Date,
  bufferMinutes: number,
  nextAdzanTime: Date
): Promise<PrayerStatus> {

  // 1. Belum masuk waktu sholat
  if (checkInAt < adzanTime) {
    throw new AppError("PRAYER_TIME_NOT_YET", 400);
  }

  const bufferLimit = addMinutes(adzanTime, bufferMinutes);

  // 2. On-time: dalam buffer
  if (checkInAt <= bufferLimit) {
    return "on-time";
  }

  // 3. Performed: lewat buffer tapi sebelum adzan berikutnya
  if (checkInAt < nextAdzanTime) {
    return "performed";
  }

  // Tidak seharusnya sampai sini (sudah di-block oleh cron job missed)
  throw new AppError("PRAYER_ALREADY_MISSED", 422);
}

// Cron job (Feature #8) — berjalan setiap masuk adzan baru
async function markMissedPrayers(userId: string, currentAdzanTime: Date) {
  // Tandai semua prayer_logs yang:
  // - status masih "pending"
  // - adzan_time < currentAdzanTime
  // → set status = "missed"
}
```

---

*API Contract v2.0 — Sholat Tracker. Dibuat berdasarkan analisis gap antara UI mockup, PRD, dan API Contract v1.0.*
