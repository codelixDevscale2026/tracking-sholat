**Labels:** `feature`, `fullstack`, `priority: medium`

> **Changelog v2.0:** Update expected response fields (tambah on_time_percentage, daily_trend, prayer_breakdown). Tambah task backend dan frontend untuk fields baru tersebut.

---

## Overview / Problem

Pengguna membutuhkan visualisasi tren kedisiplinan sholat agar bisa mengukur progres perbaikan diri secara objektif. Tanpa statistik, sulit untuk melihat apakah ada peningkatan atau penurunan.

---

## Current Behaviour

Belum ada ringkasan performa atau visualisasi data.

---

## Expected Behaviour

`GET /api/v1/stats/summary?period=weekly` mengembalikan:
```json
{
  "period": "weekly",
  "date_range": { "from": "...", "to": "..." },
  "summary": {
    "total_on_time": 30,
    "total_performed": 4,
    "total_missed": 1,
    "total_prayers": 35,
    "on_time_percentage": 85,         // ← baru: langsung pakai di metric card
    "average_response_time_minutes": 12,
    "streak_days": 14
  },
  "daily_trend": [                     // ← baru: untuk Weekly Discipline Trend chart
    { "day": "Mon", "date": "...", "on_time": 4, "performed": 1, "missed": 0 },
    ...
  ],
  "prayer_breakdown": [                // ← baru: untuk Prayer Breakdown list
    { "prayer_name": "subuh", "total": 14, "on_time": 13, "performed": 1, "missed": 0, "consistency_percentage": 92 },
    ...
  ]
}
```

---

## Relevant Files

- `src/routes/stats.ts` (Hono.js)
- `src/services/statistics.ts`
- `src/client/pages/Statistics.tsx`
- `src/client/hooks/useStats.ts` (TanStack Query)
- Referensi: [API Contract v2.1] — Section 4 (GET /stats/summary)
- Referensi: [UI Spec Mobile v1.0] — Screen Stats

---

## Tasks

### Backend (Hono.js + Prisma)

- [ ] Buat route `GET /api/v1/stats/summary?period=daily|weekly|monthly`
- [ ] Implementasi Prisma queries untuk `summary`:
  - `count` per status dengan `groupBy`
  - `on_time_percentage` = `total_on_time / total_prayers * 100`
  - `average_response_time_minutes` via `_avg` pada `responseTimeMinutes`
  - `streak_days` — query berurutan mundur dari hari ini
- [ ] Implementasi `daily_trend` — `groupBy date` untuk 7 hari terakhir (period=weekly), hitung on_time/performed/missed per hari
- [ ] Implementasi `prayer_breakdown` — `groupBy prayerName`, hitung count dan `consistency_percentage` per sholat
- [ ] Hitung `date_range` dari/to berdasarkan parameter `period`
- [ ] Support filter `period` dengan date range query
- [ ] Tulis unit test dengan berbagai skenario data

### Frontend (React + TanStack Query)

- [ ] Desain UI halaman Statistics sesuai [UI Spec Mobile v1.0 Section 6]
- [ ] Buat hook `useStatsSummary(period)` dengan `useQuery`, konfigurasi `staleTime` yang sesuai (statistik tidak perlu real-time)
- [ ] Tampilkan 4 metric cards menggunakan data `summary`:
  - Total On-Time: `on_time_percentage` (tampilkan sebagai %)
  - Total Performed: `total_performed`
  - Total Missed: `total_missed`
  - Avg Response: `average_response_time_minutes` (tampilkan sebagai "X min")
- [ ] Tampilkan Streak card dari `streak_days`
- [ ] Implementasi **Weekly Discipline Trend chart** dari `daily_trend[]`:
  - Bar chart (Recharts `<BarChart>`) dengan 7 data points
  - Sumbu X: `day` label (Mon–Sun)
  - Bar: stacked on-time (hijau) + performed (kuning) + missed (merah)
- [ ] Implementasi **Prayer Breakdown list** dari `prayer_breakdown[]`:
  - Icon per sholat, nama, `consistency_percentage` (progress bar), `on_time/total`
- [ ] Implementasi tab filter Daily/Weekly/Monthly — trigger refetch dengan period baru
- [ ] Handle empty state (user baru, belum ada log)
- [ ] Handle loading skeleton dan error state