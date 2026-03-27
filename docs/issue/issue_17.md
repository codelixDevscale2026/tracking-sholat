**Labels:** `feature`, `fullstack`, `priority: medium`, `sprint: 5`

---

## Overview / Problem

Pengguna membutuhkan halaman riwayat untuk melihat catatan sholat hari-hari sebelumnya secara detail — bukan hanya angka agregat seperti di Stats, melainkan daftar per sholat per hari beserta waktu check-in aktual dan status masing-masing. Tanpa halaman ini, pengguna tidak bisa mengetahui sholat mana yang terlewat atau terlambat di hari-hari sebelumnya.

---

## Current Behaviour

Belum ada halaman riwayat. Tab "History" di Bottom Navigation belum memiliki konten. Endpoint `GET /api/v1/prayers/history` belum dibuat. Pengguna tidak bisa melihat catatan sholat historis secara detail.

---

## Expected Behaviour

- `GET /api/v1/prayers/history` mengembalikan daftar sholat dikelompokkan per hari dengan filter `period` (daily, weekly, monthly)
- Setiap hari menampilkan: tanggal, total selesai (`X/5 Completed`), dan list 5 sholat beserta status + waktu check-in
- Filter tab Daily / Weekly / Monthly mengubah rentang data yang ditampilkan
- Ikon kalender di header membuka date picker untuk navigasi ke tanggal tertentu
- Tombol "View All History" memuat data lebih banyak via pagination
- Status sholat konsisten dengan status di Home screen (on-time, performed, late, missed, early)
- TanStack Query mengelola caching dan pagination data riwayat

---

## Relevant Files

- `src/routes/prayers.ts` (Hono.js) — tambah endpoint `GET /api/v1/prayers/history`
- `src/services/historyService.ts` ← service baru
- `src/client/pages/History.tsx`
- `src/client/components/HistoryDayGroup.tsx` ← komponen baru
- `src/client/components/HistoryItem.tsx` ← komponen baru
- `src/client/hooks/usePrayerHistory.ts` (TanStack Query) ← hook baru
- Referensi: [API Contract v2.1] — Section 3 (GET /prayers/history)
- Referensi: [ERD v2.1] — Tabel `prayer_logs`, `daily_prayer_schedules`
- Referensi: [UX Flow v1.0] — Section 2.3 (Flow: History)
- Referensi: [UI Spec Mobile v1.0] — Section 5 (Screen: History)

---

## Tasks

### Backend (Hono.js + Prisma)

- [ ] Buat route `GET /api/v1/prayers/history` di `src/routes/prayers.ts`:
  - Query params: `period` (daily | weekly | monthly), `date` (YYYY-MM-DD, default: hari ini), `page` (default: 1), `per_page` (default: 7)
  - Contoh request: `GET /api/v1/prayers/history?period=daily&date=2026-03-17`
- [ ] Implementasi `historyService.ts`:
  - Hitung `date_range` dari/to berdasarkan `period` dan `date` acuan
  - Query `prayer_logs` + join `daily_prayer_schedules` untuk mendapatkan `adzan_time` dan `buffer_limit` per sholat
  - Kelompokkan hasil per `date` → array `data[]` berisi `{ date, total_completed, total_prayers, prayers[] }`
  - Hitung `total_completed` = count status bukan `missed` per hari
  - Implementasi pagination dengan `skip` dan `take` Prisma
- [ ] Format response sesuai [API Contract v2.1 Section 3]:
  ```json
  {
    "period": "daily",
    "pagination": { "current_page": 1, "per_page": 7, "total_pages": 4 },
    "data": [
      {
        "date": "2026-03-17",
        "total_completed": 4,
        "total_prayers": 5,
        "prayers": [
          {
            "prayer_name": "subuh",
            "adzan_time": "...",
            "buffer_limit": "...",
            "check_in_at": "...",
            "status": "on-time",
            "response_time_minutes": 5
          }
        ]
      }
    ]
  }
  ```
- [ ] Pastikan `buffer_limit` dihitung dari `adzan_snapshot_time + buffer_snapshot_minutes` (dari `prayer_logs`) — bukan dari settings saat ini, agar konsisten dengan data historis
- [ ] Tulis unit test dengan berbagai skenario: semua on-time, ada missed, data kosong, filter period berbeda

### Frontend (React + TanStack Query)

- [ ] Buat hook `usePrayerHistory(period, date, page)` dengan `useQuery` dari TanStack Query:
  - `queryKey: ['prayer-history', period, date, page]`
  - `staleTime: 5 * 60 * 1000` (5 menit — riwayat tidak berubah real-time)
  - Fetch dari `GET /api/v1/prayers/history`
- [ ] Implementasi halaman `History.tsx`:
  - Header: tombol back (←), judul "Prayer History", ikon kalender (kanan)
  - Tab filter: `<Tabs>` shadcn/ui — Daily / Weekly / Monthly, underline style, tab aktif `text-primary border-b-2 border-primary`
  - List: render `data[]` dari response sebagai `<HistoryDayGroup>` per hari
  - "View All History": `<Button variant="ghost">` — trigger load page berikutnya
- [ ] Buat komponen `HistoryDayGroup.tsx`:
  - Header grup: tanggal bold berwarna `primary` (format: "TODAY, 24 OCT" / "YESTERDAY, 23 OCT" / tanggal biasa), `total_completed/total_prayers` di kanan
  - Background header: `bg-primary/5`, `px-4 py-2`
  - Render `prayers[]` sebagai `<HistoryItem>` per sholat
- [ ] Buat komponen `HistoryItem.tsx`:
  - Icon sholat (sun/moon) dalam lingkaran `bg-primary/10`, ukuran 40px
  - Nama sholat bold, sublabel "Adzan HH:MM" abu
  - Waktu check-in di kanan (warna `primary` jika on-time, `warning` jika performed, `danger` jika missed)
  - `<Badge>` status (on-time, performed, late, missed, early) — warna sesuai [UI Spec Mobile v1.0 Section 5.2]
  - Jika `missed`: tampilkan waktu "--:--" berwarna `danger`
- [ ] Implementasi ikon kalender (header kanan):
  - Tap → buka `<Popover>` dengan `<Calendar>` shadcn/ui
  - Pilih tanggal → update `date` parameter, refetch dengan tanggal baru
- [ ] Implementasi tab filter:
  - Tap tab → update `period`, reset `page` ke 1, refetch
  - Scroll to top saat tab berubah
- [ ] Implementasi "View All History" (pagination):
  - Simpan `page` di state lokal
  - Tap → increment `page`, append data baru ke list yang ada (infinite-style)
  - Sembunyikan tombol jika `current_page >= total_pages`
- [ ] Handle loading state: `<Skeleton>` list item × 5 saat `isLoading`
- [ ] Handle empty state:
  - Tidak ada riwayat sama sekali: ilustrasi + teks "Belum ada riwayat sholat"
  - Tidak ada data untuk periode yang dipilih: teks "Tidak ada data untuk periode ini"
- [ ] Handle error state: error card + tombol "Coba Lagi" yang trigger refetch
- [ ] Handle pull-to-refresh: refetch dengan period & date saat ini
