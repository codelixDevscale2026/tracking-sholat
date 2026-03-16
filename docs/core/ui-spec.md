# UI Spec — Sholat Tracker (Mobile)
**Versi:** 1.0 | 17 Maret 2026  
**Berdasarkan:** UX Flow v1.0, Mockup PDF (Figma), UI Spec v2.0  
**Platform:** Mobile Web (375px–430px viewport width)  
**Component Library:** shadcn/ui  
**Note:** Desktop spec tidak dicakup — hanya mobile berdasarkan mockup yang tersedia.

---

## 1. Design Tokens

```css
/* Colors */
--color-primary:        #2EAA6E;
--color-primary-light:  #D6F0E4;
--color-warning:        #F5A623;
--color-late:           #F97316;
--color-danger:         #E8434A;
--color-info:           #3B82F6;
--color-background:     #F2F4F2;
--color-surface:        #FFFFFF;
--color-text-primary:   #1A1A1A;
--color-text-secondary: #6B7280;
--color-border:         #E5E7EB;

/* Spacing */
--spacing-page:   16px;   /* padding horizontal halaman */
--spacing-card:   16px;   /* padding dalam card */
--spacing-gap:    12px;   /* jarak antar elemen */

/* Border radius */
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-full: 9999px;
```

---

## 2. Layout Global

### 2.1 Page Shell

```
┌─────────────────────────────┐  ← viewport (375px)
│  Header (56px)              │
├─────────────────────────────┤
│                             │
│  Page Content               │
│  (scrollable, flex-1)       │
│  padding: 0 16px            │
│                             │
├─────────────────────────────┤
│  Bottom Navigation (64px)   │
└─────────────────────────────┘
```

- Header: `fixed top-0`, `bg-surface`, `z-50`, `border-bottom`
- Bottom Nav: `fixed bottom-0`, `bg-surface`, `border-top`, `safe-area-inset-bottom`
- Content area: `padding-top: 56px`, `padding-bottom: 64px + safe-area`

### 2.2 Auth Shell (tidak ada Header & Bottom Nav)

```
┌─────────────────────────────┐
│  background: --color-bg     │
│  padding: 24px 16px         │
│                             │
│  Auth Card (centered)       │
│  border-radius: 16px        │
│  background: --color-surface│
│                             │
└─────────────────────────────┘
```

---

## 3. Screen: Register & Login (`/auth`)

### 3.1 Layout

```
┌────────────────────────────────┐
│  [Icon masjid — 64px circle]   │  ← lingkaran primary-light
│  Sholat Tracker                │  ← heading-xl, bold, center
│  "Track your daily prayers..."│  ← body, secondary, center
│                                │
│  Create Account                │  ← heading-md, bold
│                                │
│  [Input: Full Name]            │
│  [Input: Email]                │
│  [Input: Password]             │
│                                │
│  ○ I agree to Terms of Service │
│                                │
│  [Create Account →]            │  ← CTA button, full width
│                                │
│  ─────── Or sign up with ──── │
│  [Google]        [Apple]       │  ← dua tombol side-by-side
│                                │
│  Already have an account? Sign In │
└────────────────────────────────┘
```

### 3.2 Komponen shadcn/ui

| Elemen | Komponen shadcn/ui | Konfigurasi |
|---|---|---|
| Input Full Name | `<Input>` | `type="text"`, prefix icon `User` (lucide) |
| Input Email | `<Input>` | `type="email"`, prefix icon `Mail` |
| Input Password | `<Input>` | `type="password"`, prefix icon `Lock`, suffix toggle icon `Eye/EyeOff` |
| Checkbox ToS | `<Checkbox>` | Label dengan `<Link>` untuk Terms |
| Tombol CTA | `<Button>` | `variant="default"`, `size="lg"`, `className="w-full rounded-full"` |
| Tombol SSO | `<Button>` | `variant="outline"`, `size="lg"`, `className="flex-1"` |
| Error inline | `<FormMessage>` (react-hook-form) | Warna `danger`, teks 12px |
| Loading CTA | `<Button disabled>` + `<Loader2 className="animate-spin">` | — |

### 3.3 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Tap field | Field mendapat `border-primary` (focus ring hijau) |
| Tap Eye icon (password) | Toggle `type="password"` ↔ `type="text"` |
| Submit form kosong | Validasi client-side muncul, form tidak dikirim |
| Submit valid | Tombol disabled + spinner, field disabled |
| Link "Sign In" | Navigate ke `/auth/login` (atau toggle form di halaman yang sama) |
| Tap Google/Apple | Redirect ke OAuth provider |

---

## 4. Screen: Home (`/home`)

### 4.1 Layout

```
┌────────────────────────────────┐
│ HEADER                         │
│ [📅] Jadwal Sholat    [🔔]     │
│      Jakarta, Indonesia        │
├────────────────────────────────┤
│                                │
│  MENUJU ASHAR                  │  ← caption uppercase, primary
│  [01] : [12] : [35]            │  ← 3 box primary-light
│  HOURS   MIN    SEC            │
│                                │
│  Jadwal Hari Ini               │  ← heading-lg
│                                │
│  ┌──────────────────────────┐  │
│  │ Subuh     ON-TIME  [Done]│  │  ← Prayer Card
│  │ 04:35  Batas: 04:55      │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Dzuhur  PERFORMED [Late] │  │
│  │ 12:02  Batas: 12:22      │  │
│  └──────────────────────────┘  │
│  ... (Ashar, Maghrib, Isya)    │
│                                │
└────────────────────────────────┘
```

### 4.2 Komponen shadcn/ui

| Elemen | Komponen | Konfigurasi |
|---|---|---|
| Header wrapper | `<div>` custom | `fixed`, `h-14`, `px-4`, `flex items-center justify-between` |
| Bell icon | `<Button variant="ghost" size="icon">` | Icon `Bell` lucide |
| Countdown box | `<div>` custom | `bg-primary/10`, `rounded-xl`, `min-w-[72px]`, teks `text-primary` |
| Prayer Card | `<Card>` | `border-l-4` warna sesuai status, `rounded-xl`, `shadow-sm` |
| Badge status | `<Badge>` | `variant` custom per status (lihat 4.3) |
| Tombol Done | `<Button>` | `variant="default"`, `size="sm"`, `rounded-full`, `bg-primary` |
| Tombol Late | `<Button>` | `variant="default"`, `size="sm"`, `rounded-full`, `bg-warning` |
| Tombol Check-in (aktif) | `<Button>` | `variant="outline"`, `size="sm"`, `rounded-full`, `border-primary text-primary` |
| Tombol Check-in (disabled) | `<Button disabled>` | `variant="outline"`, `size="sm"`, `rounded-full`, `opacity-40` |
| Alert missed | `<div>` + icon `AlertCircle` lucide | Warna `danger` |
| Skeleton loading | `<Skeleton>` | Height sesuai Prayer Card (~80px) × 5 |

### 4.3 Badge Status — Variant Map

| Status | `<Badge>` className |
|---|---|
| `on-time` | `bg-primary/10 text-primary border-primary/20` |
| `performed` | `bg-warning/10 text-warning border-warning/20` |
| `late` | `bg-late/10 text-late border-late/20` |
| `missed` | `bg-danger/10 text-danger border-danger/20` |
| `pending` | `bg-muted text-muted-foreground` |
| `early` | `bg-info/10 text-info border-info/20` |

### 4.4 Prayer Card — Left Border Map

| Status | `border-l-4` color |
|---|---|
| `on-time` | `border-l-[#2EAA6E]` |
| `performed` | `border-l-[#F5A623]` |
| `late` | `border-l-[#F97316]` |
| `missed` | `border-l-[#E8434A]` |
| `pending` | `border-l-[#2EAA6E]` |
| `upcoming` | `border-l-transparent` |

### 4.5 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Tap Check-in (aktif) | Tombol disabled sementara + spinner kecil di dalam tombol, POST /checkin |
| Check-in success | Badge dan tombol update secara optimistic, lalu dikonfirmasi saat refetch |
| Tap Bell | Navigate ke `/notifications` (belum di-scope — nonaktifkan atau hide sementara) |
| Pull-to-refresh | Refetch GET /prayers/today |
| Countdown timer | Update setiap detik via `setInterval`, berpindah ke sholat berikutnya otomatis |

---

## 5. Screen: History (`/history`)

### 5.1 Layout

```
┌────────────────────────────────┐
│ ← Prayer History         [📅] │  ← header
├────────────────────────────────┤
│ [Daily] [Weekly] [Monthly]     │  ← tab filter, underline style
├────────────────────────────────┤
│ TODAY, 24 OCT       4/5 Done   │  ← section header
│ ┌──────────────────────────┐   │
│ │ [☀] Subuh  Adzan 04:30  04:35 ON-TIME  │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ [☀] Dzuhur Adzan 11:45  12:30 PERFORMED│
│ └──────────────────────────┘   │
│ ...                            │
│                                │
│ YESTERDAY, 23 OCT   5/5 Done   │
│ ...                            │
│                                │
│     View All History           │  ← link/button center
└────────────────────────────────┘
```

### 5.2 Komponen shadcn/ui

| Elemen | Komponen | Konfigurasi |
|---|---|---|
| Tab filter | `<Tabs>` + `<TabsList>` + `<TabsTrigger>` | `variant` custom: underline style, aktif `text-primary border-b-2 border-primary` |
| Section header | `<div>` custom | `bg-primary/5`, `px-4 py-2`, teks tanggal `text-primary font-semibold` |
| History item | `<div>` custom (bukan Card — lebih flat) | `flex items-center gap-3`, `px-4 py-3`, `border-b` |
| Icon sholat | `<div>` + lucide icon | `rounded-full bg-primary/10`, `p-2`, `w-10 h-10` |
| Badge status | `<Badge>` | Sama dengan Home (4.3) |
| View All | `<Button variant="ghost">` | `text-primary`, center |
| Skeleton loading | `<Skeleton>` | List item skeleton × 5 |
| Empty state | `<div>` custom | Ilustrasi + teks + CTA ke /home |

### 5.3 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Tap tab Daily/Weekly/Monthly | Refetch dengan `period` baru, scroll to top |
| Tap calendar icon (header) | Buka `<Popover>` dengan `<Calendar>` shadcn untuk pilih tanggal |
| Tap View All History | Load more (pagination), append ke list yang ada |
| Scroll ke bawah | Infinite scroll atau load more manual |
| Pull-to-refresh | Refetch dengan period & date saat ini |

---

## 6. Screen: Statistics (`/stats`)

### 6.1 Layout

```
┌────────────────────────────────┐
│ ← Statistics & Discipline [📅]│
├────────────────────────────────┤
│ ( Daily ) ( Weekly ) (Monthly) │  ← pill/capsule tabs
│                                │
│ ┌───────────┐ ┌───────────┐    │
│ │ On-Time   │ │ Performed │    │  ← 2×2 metric grid
│ │ 85% +5%   │ │ 142  -2%  │    │
│ └───────────┘ └───────────┘    │
│ ┌───────────┐ ┌───────────┐    │
│ │ Missed    │ │ Avg Resp  │    │
│ │ 8   +1%   │ │ 12 min    │    │
│ └───────────┘ └───────────┘    │
│                                │
│ ┌──────────────────────────┐   │
│ │ CURRENT STREAK  🔥       │   │  ← streak card, bg-primary
│ │ 14 Days          +2 days │   │
│ └──────────────────────────┘   │
│                                │
│ Weekly Discipline Trend        │
│ ┌──────────────────────────┐   │
│ │  [Bar chart 7 hari]      │   │
│ └──────────────────────────┘   │
│                                │
│ Prayer Breakdown               │
│ [Fajr   92%  14/14]            │
│ [Dhuhr  85%  12/14]            │
│ ...                            │
└────────────────────────────────┘
```

### 6.2 Komponen shadcn/ui

| Elemen | Komponen | Konfigurasi |
|---|---|---|
| Tab filter | `<Tabs>` custom pill style | Aktif: `bg-white text-primary shadow-sm`, non-aktif: `bg-primary/10 text-muted-foreground`, semua dalam `bg-primary/10 rounded-full p-1` |
| Metric card | `<Card>` | `bg-primary/10`, `border-0`, `rounded-xl`, `p-4` |
| Delta positif | `<span>` | `text-primary text-xs font-medium` |
| Delta negatif | `<span>` | `text-danger text-xs font-medium` |
| Streak card | `<Card>` | `bg-primary`, `border-0`, `rounded-xl`, semua teks putih |
| Bar chart | Recharts `<BarChart>` atau `<Chart>` shadcn | Data dari `daily_trend[]` API, bar warna `primary` |
| Prayer breakdown item | `<div>` + `<Progress>` | Icon dalam lingkaran `primary/10`, `<Progress value={consistency_percentage}>` |
| Skeleton | `<Skeleton>` | Per card dan chart |
| Empty (streak = 0) | Streak card tetap tampil | Nilai "0 Days", tanpa badge "+X days" |

### 6.3 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Tap tab period | Refetch, animasi transisi angka |
| Tap calendar icon | Date picker untuk pilih minggu/bulan acuan |
| Hover bar chart | Tooltip nilai per hari (web) |
| Pull-to-refresh | Refetch summary |

---

## 7. Screen: Settings (`/settings`)

### 7.1 Layout

```
┌────────────────────────────────┐
│ ← Settings                    │
├────────────────────────────────┤
│                                │
│ ⏱ Smart Buffer System          │  ← section header
│ ┌──────────────────────────┐   │
│ │ "Adjust the global..."   │   │
│ │                          │   │
│ │ Global Buffer  [15 mins] │   │
│ │ 5m ━━━●─────────── 60m  │   │  ← slider
│ └──────────────────────────┘   │
│                                │
│ 📍 Location Settings           │
│ ┌──────────────────────────┐   │
│ │ CURRENT COORDINATES      │   │
│ │ 📍 -7.25° S, 112.75° E  Refresh│
│ │    Surabaya, Indonesia   │   │
│ │ ┌──────────────────────┐ │   │
│ │ │ [Map preview image]  │ │   │
│ │ └──────────────────────┘ │   │
│ │ Auto-detect Location  [●]│   │  ← toggle ON
│ └──────────────────────────┘   │
│                                │
│ ⚙ Prayer Method                │
│ ┌──────────────────────────┐   │
│ │ Calculation Method    >  │   │  ← navigasi ke sub-halaman
│ │ Muslim World League (MWL)│   │
│ └──────────────────────────┘   │
│                                │
└────────────────────────────────┘
```

### 7.2 Komponen shadcn/ui

| Elemen | Komponen | Konfigurasi |
|---|---|---|
| Section header | `<div>` dengan icon lucide | Icon warna `primary`, label `font-semibold text-base` |
| Section card | `<Card>` | `rounded-xl shadow-sm p-4` |
| Buffer slider | `<Slider>` | `min={5} max={60} step={5}`, warna track `primary` |
| Buffer value badge | `<Badge>` | `bg-primary/10 text-primary rounded-full px-3` |
| Coordinates row | `<div>` custom | Icon `MapPin` lucide, teks koordinat, `<Button variant="ghost" size="sm">` Refresh |
| Map preview | `<img>` atau static map embed | `rounded-lg`, `aspect-video`, `object-cover` |
| Auto-detect toggle | `<Switch>` | `checked={auto_detect_location}`, `onCheckedChange` → PATCH |
| Calculation method row | `<Button variant="ghost">` full width | `justify-between`, icon `ChevronRight` kanan, navigate ke sub-halaman |
| Toast sukses/gagal | `<Sonner>` / `useToast()` | Auto-dismiss 2 detik |
| Skeleton | `<Skeleton>` | Per section card |

### 7.3 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Geser slider | Update nilai badge secara real-time (optimistic), PATCH dikirim setelah debounce 500ms |
| Tap Refresh koordinat | Loading spinner di koordinat row, request GPS, update `city_name` + koordinat |
| Toggle Auto-detect ON | GPS aktif, koordinat diperbarui otomatis saat app dibuka |
| Toggle Auto-detect OFF | GPS tidak aktif, koordinat tetap seperti terakhir disimpan |
| Tap Calculation Method | Navigate ke `/settings/calculation-method` |
| Slider rollback | Jika PATCH gagal, nilai slider kembali ke nilai sebelumnya |

---

## 8. Sub-Screen: Calculation Method (`/settings/calculation-method`)

### 8.1 Layout

```
┌────────────────────────────────┐
│ ← Calculation Method          │
├────────────────────────────────┤
│                                │
│ ┌──────────────────────────┐   │
│ │ ◉ Muslim World League    │   │  ← terpilih
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ○ ISNA                   │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ○ Egyptian Survey        │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ○ Karachi                │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ○ Tehran                 │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ○ Kemenag RI             │   │
│ └──────────────────────────┘   │
│                                │
└────────────────────────────────┘
```

### 8.2 Komponen shadcn/ui

| Elemen | Komponen | Konfigurasi |
|---|---|---|
| List metode | `<RadioGroup>` | `value={calculation_method}`, `onValueChange` → PATCH + navigate back |
| Item metode | `<RadioGroupItem>` + `<Label>` | Dalam `<Card>` full-width, `cursor-pointer` |
| Item terpilih | Card dengan `border-primary bg-primary/5` | Visual highlight |

### 8.3 Interaksi Detail

| Aksi | Behavior |
|---|---|
| Pilih metode | PATCH /settings + navigate back ke /settings + refetch /prayers/today di background |
| Back tanpa pilih | Navigate back, tidak ada perubahan |

---

## 9. Komponen Shared

### 9.1 Bottom Navigation Bar

```tsx
// Komponen: <BottomNav />
// Posisi: fixed bottom-0, width: 100%
// Height: 64px + safe-area-inset-bottom

tabs = [
  { label: "Home",    icon: Home,    route: "/home"     },
  { label: "History", icon: History, route: "/history"  },
  { label: "Stats",   icon: BarChart2, route: "/stats"  },
  { label: "Settings",icon: Settings, route: "/settings"},
]
```

| State | Style |
|---|---|
| Aktif | Icon + label `text-primary`, icon `fill-primary/20` |
| Non-aktif | Icon + label `text-muted-foreground` |
| Tap | Scale 0.92 → 1.0 (spring animation 150ms) |

### 9.2 Toast Notifications

Menggunakan `<Sonner>` (shadcn/ui default toast library):

| Jenis | Warna | Durasi | Contoh teks |
|---|---|---|---|
| Success | Hijau | 2 detik | "Check-in berhasil", "Pengaturan tersimpan" |
| Error | Merah | 4 detik | "Gagal menyimpan, coba lagi" |
| Info | Abu | 3 detik | "Izin lokasi ditolak" |

### 9.3 Empty State

```
┌──────────────────────────┐
│   [Ilustrasi sederhana]  │  ← SVG/icon ~80px
│   Judul singkat          │  ← font-medium text-base
│   Deskripsi pendek       │  ← text-muted-foreground text-sm
│   [CTA button opsional]  │
└──────────────────────────┘
```

Komponen: `<div className="flex flex-col items-center gap-3 py-12 text-center">`

### 9.4 Error State

```
┌──────────────────────────┐
│   [Icon AlertCircle]     │  ← text-danger, 40px
│   Gagal memuat data      │
│   [Coba Lagi]            │  ← <Button variant="outline">
└──────────────────────────┘
```

---

## 10. Responsive Behavior

Karena hanya mobile yang di-scope, berikut breakpoint yang berlaku:

| Breakpoint | Width | Behavior |
|---|---|---|
| `xs` (default) | 375px | Layout tunggal, full-width card |
| `sm` | 430px | Sama, sedikit lebih longgar padding |
| `md+` | ≥ 768px | **Di luar scope** — gunakan UX Flow untuk kebutuhan desktop nanti |

**Catatan untuk implementasi:**
- Semua komponen menggunakan `w-full` di mobile
- Prayer Card: grid 1 kolom
- Metric cards Stats: grid 2 kolom (`grid-cols-2 gap-3`)
- SSO buttons Auth: `grid grid-cols-2 gap-3`
- Bottom Nav: `grid grid-cols-4`

---

*UI Spec v1.0 (Mobile) — Sholat Tracker. Berdasarkan UX Flow v1.0 dan mockup Figma.*
