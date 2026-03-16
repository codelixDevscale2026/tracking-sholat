// ============================================================
// ERD — Sholat Tracker
// Versi: 2.1 | 17 Maret 2026
// Changelog dari v1.0:
//   - users: tambah full_name, klarifikasi username
//   - prayer_settings: tambah calculation_method, auto_detect_location,
//     city_name (v2.1)
//   - daily_prayer_schedules: tambah user_id, calculation_method,
//     perbaiki UNIQUE index (sebelumnya global, sekarang per-user)
//   - prayer_logs: tambah buffer_snapshot_minutes, adzan_snapshot_time,
//     created_at; lengkapi komentar enum status (v2.1)
//   - Tambah tabel: auth_tokens
// ============================================================

// -----------------------------------------------------------
// AREA 1: Authentication & User
// -----------------------------------------------------------

Table users {
  id          integer     [primary key, increment]
  full_name   varchar     [not null, note: "Nama lengkap — ditampilkan di UI"]
  username    varchar     [unique, note: "Opsional: untuk fitur sosial di roadmap"]
  email       varchar     [unique, not null]
  password_hash varchar   [not null]
  created_at  timestamp   [default: `now()`]

  Note: "Menyimpan informasi autentikasi dasar pengguna."
}

// Untuk invalidasi JWT saat logout
// Alternatif: gunakan Redis jika ingin stateless
Table auth_tokens {
  id          integer     [primary key, increment]
  user_id     integer     [not null]
  token_hash  varchar     [not null, unique, note: "SHA-256 dari JWT"]
  expires_at  timestamp   [not null]
  revoked_at  timestamp   [note: "Diisi saat logout — NULL berarti masih aktif"]
  created_at  timestamp   [default: `now()`]

  Note: "Blacklist token untuk mendukung POST /auth/logout."
}

// -----------------------------------------------------------
// AREA 2: User Preferences
// -----------------------------------------------------------

Table prayer_settings {
  id                      integer   [primary key, increment]
  user_id                 integer   [unique, not null, note: "1 user = 1 settings row"]

  // Buffer & toleransi
  global_buffer_minutes   integer   [default: 20, not null, note: "Range: 5–60 menit"]

  // Lokasi
  latitude                decimal(9,6)
  longitude               decimal(9,6)
  city_name               varchar   [note: "Di-update otomatis saat koordinat berubah. Contoh: 'Surabaya, Indonesia'"]
  timezone                varchar   [default: 'Asia/Jakarta', not null]
  auto_detect_location    boolean   [default: true, not null]

  // Metode kalkulasi waktu sholat
  // Nilai: 'mwl' | 'isna' | 'egypt' | 'karachi' | 'tehran' | 'kemenag'
  calculation_method      varchar   [default: 'mwl', not null]

  updated_at              timestamp [default: `now()`]

  Note: '''
    Menyimpan preferensi personalisasi per user.
    calculation_method menentukan algoritma API jadwal sholat eksternal
    (Al-Adhan / Kemenag). Dipakai saat fetch daily_prayer_schedules.
  '''
}

// -----------------------------------------------------------
// AREA 3: Prayer Schedule (Cache dari API Eksternal)
// -----------------------------------------------------------

Table daily_prayer_schedules {
  id                    integer   [primary key, increment]

  // ⚠️  v1.0 tidak ada user_id → jadwal bersifat global
  // → dua user beda kota/metode akan tabrakan di UNIQUE index
  // Fix: UNIQUE(user_id, date, prayer_name)
  user_id               integer   [not null]

  date                  date      [not null]

  // Nilai: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'
  prayer_name           varchar   [not null]

  scheduled_adzan_time  timestamp [not null, note: "Waktu adzan dalam UTC"]

  // Disimpan agar jika user ganti metode, jadwal lama tidak ikut berubah
  calculation_method    varchar   [not null, note: "Snapshot metode saat fetch"]

  // Koordinat saat jadwal ini di-fetch
  // (user bisa pindah kota, jadwal lama tetap valid)
  latitude              decimal(9,6) [not null]
  longitude             decimal(9,6) [not null]

  fetched_at            timestamp [default: `now()`, note: "Kapan di-fetch dari API eksternal"]

  Indexes {
    // v1.0: UNIQUE(date, prayer_name) → ❌ global, tidak bisa multi-user
    // v2.0: tambah user_id → ✅ per-user
    (user_id, date, prayer_name) [unique]
  }

  Note: '''
    Cache jadwal adzan harian dari API eksternal (Al-Adhan / Kemenag).
    Di-fetch sekali per hari per user saat pertama kali GET /prayers/today
    dipanggil. Digunakan sebagai benchmark waktu untuk kalkulasi status.
  '''
}

// -----------------------------------------------------------
// AREA 4: Prayer Logs (Tabel Inti — Tracking)
// -----------------------------------------------------------

Table prayer_logs {
  id                integer   [primary key, increment]
  user_id           integer   [not null]

  prayer_name       varchar   [not null]
  date              date      [not null]

  // Waktu saat user tekan tombol "Sudah Sholat"
  check_in_timestamp timestamp [note: "NULL jika status = missed (tidak ada check-in)"]

  // Status hasil kalkulasi backend
  // Nilai:
  //   'on-time'   — check-in <= adzan + buffer
  //   'performed' — check-in > buffer, tapi sebelum adzan berikutnya
  //   'late'      — check-in melewati grace window tambahan (opsional)
  //   'missed'    — tidak ada check-in hingga adzan berikutnya (diisi cron job)
  //   'early'     — check-in sebelum adzan (ditandai untuk ditinjau)
  status            varchar   [not null]

  // ── Snapshot fields ──────────────────────────────────────
  // Disimpan saat check-in terjadi agar data historis tidak
  // berubah jika user kemudian mengubah settings.
  //
  // Skenario tanpa snapshot:
  //   User check-in kemarin pakai buffer 20 menit → "on-time"
  //   Hari ini user ubah buffer jadi 5 menit
  //   Buka History → status kemarin jadi "performed" ← ❌ salah
  //
  // Dengan snapshot: status historis tidak pernah berubah ← ✅
  buffer_snapshot_minutes integer [not null, note: "Nilai buffer saat check-in"]
  adzan_snapshot_time     timestamp [not null, note: "Nilai adzan_time saat check-in"]
  // ─────────────────────────────────────────────────────────

  // Selisih menit dari adzan ke check-in (untuk analytics avg response time)
  // NULL jika missed
  response_time_minutes integer [note: "= check_in_timestamp - adzan_snapshot_time"]

  created_at        timestamp [default: `now()`]

  Indexes {
    (user_id, date, prayer_name) [unique]
  }

  Note: '''
    Tabel inti untuk mencatat progres sholat per user.
    Status diisi otomatis oleh backend (Hono.js) saat POST /prayers/checkin.
    Status "missed" diisi oleh cron job (Feature #8) saat adzan berikutnya masuk.
    Snapshot fields menjamin integritas data historis.
  '''
}

// -----------------------------------------------------------
// RELATIONSHIPS
// -----------------------------------------------------------

Ref: auth_tokens.user_id > users.id [delete: cascade]
Ref: prayer_settings.user_id - users.id [delete: cascade]
  // "-" = one-to-one (user_id UNIQUE)

Ref: daily_prayer_schedules.user_id > users.id [delete: cascade]
Ref: prayer_logs.user_id > users.id [delete: cascade]
