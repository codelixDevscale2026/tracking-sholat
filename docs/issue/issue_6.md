**Labels:** `deployment`, `devops`, `priority: high`

---

## Overview / Problem
Membutuhkan panduan dan action item untuk mendeploy sistem `tracking-sholat` (API, Platform frontend, Database PostgreSQL) ke arsitektur production (VPS/Server) agar dapat diakses oleh end-user secara publik secara aman dan stabil.

**Spesifikasi Environment Target:**
- **VPS:** IDCloudHost (Paket Dasar)
- **Domain:** `sholat.anaslabs.my.id` (Platform/Frontend) & `api.sholat.anaslabs.my.id` (API/Backend)
- **Stack & Tools:** Docker, Nginx (Reverse Proxy), PM2 (Process Manager), dan GitHub Actions (CI/CD).

---

## Current Behaviour
Saat ini aplikasi masih berjalan pada environment lokal (Localhost) menggunakan `docker-compose.dev.yml` atau secara native dengan `pnpm`. Belum ada environment yang bisa diakses publik.

---

## Expected Behaviour
- Aplikasi (App dan API) berjalan lancar menggunakan PM2 dan/atau Docker di dalam production server.
- Database PostgreSQL berjalan aman menggunakan volume persisten melalui Docker Container.
- Request masuk diarahkan menggunakan Reverse Proxy Nginx.
- Traffic antara pengguna dan server dienkripsi menggunakan SSL (HTTPS) via Let's Encrypt.
- Update framework kode otomatis dijalankan melalui pipeline CI/CD menggunakan GitHub Actions.

---

## Relevant Files
- `docker-compose.yml` (untuk menjalankan service DB atau Docker-based apps)
- `apps/api/Dockerfile` / Ekosistem startup backend
- `apps/platform/Dockerfile` / Build target frontend
- Konfigurasi Nginx Server Block (misal: `/etc/nginx/sites-available/tracking-sholat`)
- `.github/workflows/deploy.yml` (Konfigurasi CI/CD GitHub Actions)
- `pm2 ecosystem.config.js` (Jika setup spesifik dengan PM2)

---

## Tasks

### Persiapan Server & Prasyarat (IDCloudHost)
- [ ] Provisioning VPS IDCloudHost Paket Dasar.
- [ ] SSH Access: Siapkan SSH keypair agar GitHub Actions bisa terhubung ke server secara aman tanpa password.
- [ ] Instal Node.js, `npm`/`pnpm`, dan `pm2` secara global di server idcloudhost.
- [ ] Instal Docker Engine dan docker-compose (untuk PostgreSQL).
- [ ] Install `nginx` dan pastikan firewall VPS telah mengizinkan port `80` (HTTP) dan `443` (HTTPS).

### Reverse Proxy Nginx & Sertifikat SSL
- [ ] Buat file konfigurasi (server block) Nginx terpisah atau digabungkan untuk domain `sholat.anaslabs.my.id` dan `api.sholat.anaslabs.my.id`.
- [ ] Arahkan trafik domain `api.sholat.anaslabs.my.id` ke port aplikasi API backend (misal port 8000).
- [ ] Arahkan trafik domain `sholat.anaslabs.my.id` ke static files web app platform/SPA Nginx, atau reverse proxy ke app port (misal 3000).
- [ ] Install Let's Encrypt (Certbot) dan pastikan SSL aktif (misal `sudo certbot --nginx -d sholat.anaslabs.my.id -d api.sholat.anaslabs.my.id`).

### Setup Database & PM2 / Docker App Deployment
- [ ] Clone repository secara manual di initial setup.
- [ ] Siapkan file `.env` aplikasi backend (`POSTGRES_USER`, `DATABASE_URL`, dll.) dan API Base URL Frontend (`VITE_API_BASE_URL=https://api.sholat.anaslabs.my.id`).
- [ ] Eksekusi `docker compose up -d db` untuk menjalankan instance PostgreSQL.
- [ ] Lakukan Prisma/ORM migration (`pnpm prisma db push` atau `pnpm prisma migrate deploy`).
- [ ] Build dan deploy API Service serta Frontend dengan `pm2 start` atau membungkus container di dalam Docker.

### Implementasi CI/CD (GitHub Actions)
- [ ] Buat file `.github/workflows/deploy.yml` pada root repository.
- [ ] Daftarkan GitHub Secrets (`HOST`, `USERNAME`, `SSH_KEY`, dll.).
- [ ] Pastikan GitHub action memiliki steps untuk:
  - Mengeksekusi SSH remote SSH command ke server idcloudhost.
  - Menjalankan `git pull` dari branch `main`.
  - Menginstall dependencies (`pnpm install`).
  - Build aplikasi backend/frontend.
  - Restart service lewat komando PM2 (misal `pm2 restart api` dan `pm2 restart platform`) atau container Docker terkait.
- [ ] Test push deployment via CI/CD.
