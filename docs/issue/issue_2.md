**Labels:** `feature`, `fullstack`, `priority: critical`

> **Changelog v2.0:** Tambah task logout + auth_tokens, rename field `name` → `full_name`, tambah `useLogout` hook.

---

## Overview / Problem

Aplikasi membutuhkan sistem autentikasi agar setiap pengguna memiliki data sholat yang terpisah dan aman. Tanpa auth, tidak ada cara membedakan data antar pengguna.

---

## Current Behaviour

Belum ada sistem registrasi, login, logout, atau manajemen sesi pengguna.

---

## Expected Behaviour

- Pengguna dapat mendaftar dengan `full_name`, `email`, `password`
- Pengguna dapat login dan mendapatkan token (JWT)
- Pengguna dapat logout — token di-blacklist via tabel `auth_tokens`
- Semua endpoint API terproteksi oleh authentication middleware di Hono.js
- UI menampilkan halaman Register, Login, dan redirect ke Dashboard setelah berhasil
- Auth state dikelola menggunakan TanStack Query untuk caching dan invalidation

---

## Relevant Files

- `prisma/schema.prisma` — model `User`, model `AuthToken`
- `src/features/auth/auth.route.ts` (Hono.js routes)
- `src/features/auth/auth.middleware.ts`
- `src/features/auth/components/` (UI components)
- `src/features/auth/hooks/useAuthFeature.ts` (TanStack Query hooks)
- Referensi: [ERD v2.1] — Tabel `users`, `auth_tokens`
- Referensi: [API Contract v2.1] — Section 1 (Auth)

---

## Tasks

### Database (Prisma)

- [x] Definisikan model `User` di `prisma/schema.prisma`:
  ```prisma
  model User {
    id           Int      @id @default(autoincrement())
    fullName     String                          // ← full_name, bukan name
    username     String?  @unique               // ← opsional, untuk roadmap sosial
    email        String   @unique
    passwordHash String
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt

    settings     PrayerSetting?
    prayerLogs   PrayerLog[]
    schedules    DailyPrayerSchedule[]
    authTokens   AuthToken[]
  }
  ```
- [x] Definisikan model `AuthToken` untuk blacklist JWT saat logout:
  ```prisma
  model AuthToken {
    id        Int       @id @default(autoincrement())
    userId    Int
    tokenHash String    @unique               // SHA-256 dari JWT
    expiresAt DateTime
    revokedAt DateTime?                       // NULL = masih aktif
    createdAt DateTime  @default(now())

    user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```
- [x] Tambahkan `@@unique` constraint pada `email` di User
- [x] Jalankan `prisma migrate dev` dan verifikasi tabel di PostgreSQL
- [x] Buat seed script untuk data dummy

### Backend (Hono.js)

- [x] Buat route `POST /api/v1/auth/register` — hashing password (bcrypt), return JWT, simpan token ke `AuthToken`
- [x] Buat route `POST /api/v1/auth/login` — validasi credentials, return JWT
- [x] Buat route `POST /api/v1/auth/logout` — set `revokedAt` pada row `AuthToken` yang sesuai
- [x] Buat route `GET /api/v1/auth/me` — return current user (dari JWT)
- [x] Implementasi auth middleware: cek JWT valid + cek token tidak ada di blacklist (`AuthToken.revokedAt IS NULL`)
- [ ] Tulis unit test untuk setiap auth route (Roadmap)

### Frontend (React + TanStack Query)

- [x] Desain dan implementasi halaman Register (field: full_name, email, password)
- [x] Desain dan implementasi halaman Login (field: email, password)
- [x] Buat custom hooks:
  - `useRegister` — `useMutation` POST /auth/register
  - `useLogin` — `useMutation` POST /auth/login
  - `useLogout` — `useMutation` POST /auth/logout, clear token + redirect ke /auth/login
  - `useCurrentUser` — `useQuery` GET /auth/me
- [x] Implementasi auth state management (token storage di localStorage/cookie, auto-redirect)
- [x] Implementasi protected route / auth guard
- [x] Handle inline validation error (email sudah terdaftar, kredensial salah)