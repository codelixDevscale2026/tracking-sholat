## Product Overview

**Nama Produk:** (Placeholder: **OnTimeSholat** / **FajrTrack**)
**Deskripsi:** Sebuah aplikasi pelacakan sholat berbasis web yang berfokus pada kedisiplinan waktu. Aplikasi ini tidak hanya mencatat apakah pengguna sudah sholat, tetapi juga mengukur seberapa cepat pengguna merespons panggilan adzan dengan mempertimbangkan variabel manusiawi seperti wudhu, perjalanan, dan persiapan teknis lainnya.

---

## Background: Problem & Solution

### **The Problem**

- **Bias Pencatatan:** Aplikasi pelacak kebiasaan umumnya hanya mencatat "Sudah" atau "Belum", tanpa memperhitungkan apakah sholat dilakukan di awal waktu atau di akhir waktu.
- **Kebutuhan Persiapan:** Pengguna membutuhkan waktu transisi (adzan, wudhu, perjalanan ke masjid/mushola) yang seringkali membuat mereka merasa "terlambat" jika standarnya adalah tepat saat adzan berkumandang.
- **Kurangnya Metrik Kedisiplinan:** Sulit untuk mengukur tren perbaikan diri dalam hal menjaga waktu sholat secara objektif.

### **The Solution**

- **Smart Buffer System:** Memberikan toleransi waktu yang dapat dipersonalisasi (misal: 15–25 menit) untuk mencakup aktivitas persiapan.
- **Precision Tracking:** Menggunakan *timestamp* asli untuk memvalidasi status sholat (Tepat Waktu vs. Terlaksana vs. Terlambat).
- **Discipline Analytics:** Visualisasi data yang menunjukkan rata-rata waktu tunggu (*response time*) dari adzan hingga pelaksanaan.

---

## Features

### **Core Features (P0 - Minimum Viable Product)**

- **Manual Timestamp Check-in:** Tombol satu klik untuk menandai sholat selesai dan merekam waktu presisi.
- **Customizable Buffer (Toleransi):** Pengaturan global untuk menambahkan menit setelah adzan yang masih dianggap sebagai "Tepat Waktu".
- **Automated Prayer Times:** Integrasi API jadwal sholat berdasarkan koordinat GPS atau lokasi (seperti Mojokerto/Surabaya).
- **Daily Status Indicators:**
    - **On-Time (Hijau):** Pengguna check-in *setelah sholat selesai* dalam rentang **adzan + toleransi/buffer** (misal toleransi 20 menit).
    - **Performed (Kuning):** Pengguna check-in *setelah sholat selesai* **di luar toleransi**, tetapi **masih sebelum** waktu sholat berikutnya masuk.
    - **Late (Oranye) (Opsional):** Pengguna check-in melewati toleransi **dan** melewati *grace window* tambahan (misal +5 menit), namun masih sebelum sholat berikutnya. Berguna untuk membedakan “sedikit terlambat” vs “sangat terlambat”.
    - **Missed (Merah):** Tidak ada check-in sampai **waktu sholat berikutnya masuk** (status otomatis menjadi Missed ketika adzan berikutnya tiba).
    - **Early (Biru) (Opsional):** Check-in dilakukan **sebelum adzan** (misalnya jama’/qadha yang keliru tercatat, atau karena jam perangkat salah). Sistem menandai untuk ditinjau.
    - **Count down (Waktu ke sholat berikutnya):** Menampilkan hitung mundur otomatis menuju waktu sholat berikutnya berdasarkan jadwal hari ini dan lokasi pengguna. Countdown dimulai dari waktu saat ini hingga adzan sholat berikutnya, lalu berpindah otomatis ke sholat setelahnya. (Opsional: tampilkan juga total menit/jam tersisa dan label sholat tujuan, misalnya “Menuju Ashar · 01:12:35”).
    - **Keterangan waktu (yang ditampilkan di UI):**
        - **Waktu adzan:** Jam masuknya waktu sholat (sumber dari API jadwal sholat).
        - **Batas On-Time:** `adzan + toleransi`.
        - **Waktu check-in:** Jam saat pengguna menekan tombol selesai.
        - **Response time:** `waktu check-in - waktu adzan` (dalam menit).

---

## User Stories

| Role | Action | Reason |
| --- | --- | --- |
| **Pengguna** | Ingin mengatur toleransi waktu 20 menit | Agar waktu yang saya habiskan untuk wudhu dan perjalanan tidak dianggap sebagai keterlambatan. |
| **Pengguna** | Ingin menekan tombol segera setelah salam | Agar aplikasi merekam *timestamp* yang akurat untuk evaluasi kedisiplinan saya. |
| **Pengguna** | Ingin melihat rata-rata waktu respon mingguan | Agar saya bisa melihat apakah saya semakin cepat atau semakin lambat dalam memenuhi panggilan sholat. |
| **Pengguna** | Ingin mendapat label "On-Time" meskipun sholat 10 menit setelah adzan | Agar saya tetap termotivasi karena progres saya dihargai secara realistis. |

---

## Reference

- **Kemenag API / Al-Adhan API:** Referensi utama untuk pengambilan data jadwal sholat yang akurat di Indonesia.
- **Toggl Track:** Referensi UI untuk pencatatan berbasis waktu (*one-click tracking*).
- **Google Fit / Apple Health:** Referensi visualisasi grafik *consistency* dan *trends*.
- **Pomodoro Technique:** Konsep "buffer" atau jeda yang diadaptasi untuk transisi antar aktivitas.

---