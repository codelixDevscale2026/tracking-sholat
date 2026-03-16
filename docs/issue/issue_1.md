**Labels:** `setup`, `infrastructure`, `priority: high`

---

## Overview / Problem

Proyek belum memiliki struktur dasar. Diperlukan inisialisasi repository, konfigurasi tech stack, dan setup environment agar pengembangan fitur-fitur selanjutnya dapat dimulai.

**Tech Stack:** Hono.js (backend), TanStack Query + React (frontend), PostgreSQL (database), Prisma ORM

---

## Current Behaviour

Belum ada codebase, struktur folder, atau konfigurasi environment.

---

## Expected Behaviour

- Repository GitHub ter-inisialisasi dengan struktur folder monorepo atau terpisah (frontend + backend)
- Backend terkonfigurasi dengan **Hono.js** dan **Prisma ORM** terhubung ke **PostgreSQL**
- Frontend terkonfigurasi dengan **React** dan **TanStack Query** sebagai data-fetching layer
- File `.env.example`, `docker-compose.yml` (opsional), dan README tersedia
- Linting, formatting, dan pre-commit hooks aktif
- Prisma schema ter-inisialisasi dan database connection terverifikasi

---

## Relevant Files

- `README.md`, `.env.example`
- `package.json`
- `docker-compose.yml`
- `prisma/schema.prisma`
- `src/index.ts` (Hono.js entry point)
- `src/client/main.tsx` (React entry point)

---

## Tasks

### Backend

- [x]  Inisialisasi repository dan buat struktur folder
- [x]  Setup **Hono.js** sebagai backend framework
- [x]  Install dan konfigurasi **Prisma ORM** dengan **PostgreSQL**
- [x]  Inisialisasi `prisma/schema.prisma` dan jalankan `prisma init`
- [x]  Konfigurasi linting (Biome)

### Frontend

- [x]  Install dan konfigurasi **TanStack Query** (`@tanstack/react-query`)
- [x]  Setup `QueryClientProvider` di root app
- [x]  Konfigurasi routing dan HTTP client (hono client)
- [x]  Setup linting & formatting

### DevOps

- [x]  Buat `README.md` dengan dokumentasi setup
- [x]  Buat `docker-compose.yml` untuk PostgreSQL (opsional)
- [ ]  Konfigurasi CI/CD pipeline (opsional)