# FILEEDIT — Struktur Folder & Kegunaan File

Dokumen ini menjelaskan struktur project **Ekspedisi Online** dan fungsi setiap folder/file utama. Gunakan sebagai panduan saat menambah atau mengedit fitur.

---

## Ringkasan Arsitektur

```
Browser (Customer / Staff)
        ↓
Next.js App Router (src/app)
        ↓
API Routes (src/app/api/v1)
        ↓
Middleware + Validasi (src/middleware, src/validations)
        ↓
Services (src/services)  →  Business logic
        ↓
Repositories (src/repositories)  →  Prisma / Database
        ↓
MySQL Database
```

---

## Struktur Root Project

```
Ekspedisi-Online/
├── README.md                 # Panduan setup, konfigurasi, deployment Docker
├── FILEEDIT.md               # Dokumen ini — peta struktur project
├── package.json              # Dependency npm & script project
├── package-lock.json         # Lock versi dependency
├── tsconfig.json             # Konfigurasi TypeScript
├── next.config.ts            # Konfigurasi Next.js + PWA
├── postcss.config.mjs        # Konfigurasi PostCSS / Tailwind
├── components.json           # Konfigurasi shadcn/ui
├── Dockerfile                # Image Docker untuk production
├── docker-compose.yml        # Orkestrasi app + MySQL
├── .dockerignore             # File yang diabaikan saat Docker build
├── .env.example              # Template variabel environment
├── .env                      # Environment lokal (jangan di-commit)
│
├── prisma/
│   ├── schema.prisma         # Skema database (model Prisma)
│   └── migrations/           # Riwayat migrasi database
│
├── database/
│   ├── phase1_schema.sql     # SQL schema awal (alternatif manual)
│   ├── phase1_seed.sql       # Data seed awal
│   ├── seed_data.sql         # Data seed tambahan
│   ├── customer_notifications.sql  # SQL tabel notifikasi inbox
│   └── revision_courier_code.sql # Revisi kolom courier code
│
├── scripts/
│   ├── dev.js                # Dev server + auto free port 3000
│   ├── test-db.ts            # Test koneksi database
│   ├── test-rbac.ts          # Test role-based access
│   └── create-owner.ts       # Script buat akun owner
│
├── public/
│   ├── images/               # Asset gambar statis (logo, hero, dll)
│   ├── uploads/              # Upload dinamis (foto paket, bukti delivery)
│   ├── manifest.json         # Manifest PWA
│   └── offline HTML assets
│
└── src/                      # Source code utama
```

---

## Folder `src/app/` — Halaman & API (App Router)

Next.js App Router: setiap folder = route URL.

### Portal Customer — `src/app/customer/`

| File / Folder | Route | Kegunaan |
|---------------|-------|----------|
| `page.tsx` | `/customer` | Beranda customer + tracker paket |
| `login/page.tsx` | `/customer/login` | Login customer |
| `register/page.tsx` | `/customer/register` | Registrasi customer |
| `verify-email/page.tsx` | `/customer/verify-email` | Verifikasi email |
| `buat-pesanan/page.tsx` | `/customer/buat-pesanan` | Form buat pengiriman baru |
| `lacak-paket/page.tsx` | `/customer/lacak-paket` | Riwayat / cari paket (pengirim) |
| `pesanan/[id]/page.tsx` | `/customer/pesanan/:id` | Detail pesanan + timeline tracking |
| `inbox/page.tsx` | `/customer/inbox` | Inbox notifikasi penerima paket |
| `profile/page.tsx` | `/customer/profile` | Profil & pengaturan akun |
| `pembayaran/[id]/page.tsx` | `/customer/pembayaran/:id` | Halaman pembayaran |
| `dashboard/*` | `/customer/dashboard/*` | Legacy redirect ke halaman baru |

### Portal Staff — `src/app/staff/`

| Folder | Route | Kegunaan |
|--------|-------|----------|
| `login/page.tsx` | `/staff/login` | Login staff (semua role) |
| `admin/` | `/staff/admin/*` | Dashboard admin cabang |
| `cashier/` | `/staff/cashier/*` | Dashboard kasir |
| `courier/` | `/staff/courier/*` | Dashboard kurir |
| `manager/` | `/staff/manager/*` | Dashboard manager |
| `owner/` | `/staff/owner/*` | Dashboard owner |

**Halaman staff penting:**

| File | Kegunaan |
|------|----------|
| `admin/shipments/page.tsx` | Kelola shipment + assign kurir + konfirmasi tiba |
| `admin/payments/page.tsx` | Laporan pembayaran admin |
| `cashier/tambah-pesanan/page.tsx` | Kasir buat pesanan walk-in |
| `cashier/pesanan/page.tsx` | Daftar pesanan kasir |
| `courier/dashboard/page.tsx` | Beranda kurir (statistik) |
| `courier/shipments/page.tsx` | List pengiriman kurir |

### API — `src/app/api/v1/`

REST API internal. Pola: `route.ts` per endpoint.

| Folder API | Kegunaan |
|------------|----------|
| `auth/` | Login, logout, refresh token, captcha |
| `customer/` | Shipment, payment, notifikasi, profil customer |
| `admin/` | CRUD staff, shipment, payment, branch, vehicle |
| `cashier/` | Order kasir, verifikasi cash, assign kurir pickup |
| `courier/` | Shipment kurir, update status delivery |
| `manager/` | Laporan & analytics manager |
| `owner/` | Analytics owner |
| `public/` | Branch, rates, tracking publik (tanpa login) |
| `upload/` | Upload file customer |
| `staff/upload/` | Upload file staff/kurir |

### Halaman Publik — `src/app/(public)/`, `tracking/`

| File | Kegunaan |
|------|----------|
| `tracking/page.tsx` | Portal lacak paket publik |
| `tracking/[trackingNumber]/page.tsx` | Detail tracking by resi |
| `offline/page.tsx` | Halaman PWA saat offline |
| `layout.tsx` | Layout global aplikasi |
| `globals.css` | Style global + Tailwind |

---

## Folder `src/components/` — Komponen UI

| Folder / File | Kegunaan |
|---------------|----------|
| `ui/` | Komponen dasar (Button, Input, Card, Dialog, dll) — shadcn style |
| `customer/` | Navbar customer, tracker paket |
| `cashier/` | Shell kasir, tabel pesanan, API client kasir |
| `staff/` | Layout staff, halaman dashboard, data table, chart |
| `auth/` | Guard role, captcha, form login |
| `layout/` | Sidebar staff, navbar publik, navigasi menu |
| `public/` | Hero, CTA, rate section, tracking portal |
| `reports/` | Komponen export PDF |
| `status-badge.tsx` | Badge status shipment/payment |
| `pwa-install.tsx` | Prompt install PWA |

**File penting:**

| File | Kegunaan |
|------|----------|
| `staff/staff-pages.tsx` | Semua halaman dashboard staff (admin, kurir, manager) |
| `cashier/cashier-order-table.tsx` | Tabel & modal detail pesanan kasir |
| `layout/navigation.ts` | Definisi menu navigasi per role |
| `customer/customer-navbar-shell.tsx` | Layout navbar customer |

---

## Folder `src/services/` — Business Logic

Lapisan bisnis: validasi aturan, orchestrasi, notifikasi.

| File | Kegunaan |
|------|----------|
| `shipment.service.ts` | Buat shipment, update status, assign kurir, receive cabang tujuan |
| `payment.service.ts` | Pembayaran Midtrans, verifikasi, sync status |
| `notification.service.ts` | Notifikasi inbox customer (penerima paket) |
| `cashier.service.ts` | Logika pesanan kasir (confirm, reject, verify) |
| `user.service.ts` | Manajemen user staff |
| `branch.service.ts` | Manajemen cabang |
| `vehicle.service.ts` | Manajemen kendaraan kurir |
| `tracking.service.ts` | Tracking publik |

---

## Folder `src/repositories/` — Akses Database

Query Prisma langsung ke MySQL. Tidak berisi aturan bisnis.

| File | Kegunaan |
|------|----------|
| `shipment.repository.ts` | CRUD shipment, assign kurir, update status, tracking |
| `payment.repository.ts` | CRUD payment |
| `customer.repository.ts` | CRUD customer |
| `cashier.repository.ts` | Query khusus dashboard kasir |
| `notification.repository.ts` | CRUD notifikasi inbox |
| `user.repository.ts` | CRUD user staff |
| `rate.repository.ts` | Tarif pengiriman antar kota |
| `tracking.repository.ts` | Query tracking history |

---

## Folder `src/validations/` — Skema Validasi (Zod)

Validasi input request API sebelum masuk service.

| File | Kegunaan |
|------|----------|
| `shipment.validation.ts` | Validasi buat shipment, assign kurir, update status |
| `auth.validation.ts` | Validasi login/register |
| `customer.validation.ts` | Validasi profil customer |
| `payment.validation.ts` | Validasi pembayaran |
| `branch.validation.ts` | Validasi cabang |
| `tracking.validation.ts` | Validasi query tracking |

---

## Folder `src/middleware/` — Autentikasi & Otorisasi

| File | Kegunaan |
|------|----------|
| `customer.middleware.ts` | Wajib login sebagai customer |
| `staff.middleware.ts` | Wajib login sebagai staff |
| `role.middleware.ts` | Cek role spesifik (admin, cashier, courier, dll) |

---

## Folder `src/lib/` — Utilitas

| File | Kegunaan |
|------|----------|
| `prisma.ts` | Singleton Prisma Client |
| `api-client.ts` | HTTP client untuk frontend |
| `api-error.ts` | Handler error API terpusat |
| `session.ts` | Manajemen session JWT cookie |
| `midtrans.ts` | Integrasi Midtrans |
| `email.ts` | Kirim email via SMTP |
| `password.ts` | Hash & verify password (bcrypt) |
| `shipment-photos.ts` | Helper foto paket vs bukti delivery |
| `shipment-scope.ts` | Filter shipment per cabang/role |
| `customer-format.ts` | Format currency & tanggal |
| `pdf.ts` | Generator PDF laporan |
| `sanitize.ts` | Sanitasi input XSS |
| `indexeddb.ts` | Offline storage PWA |
| `report-client.ts` | Client fetch data laporan |
| `reports/` | Template export PDF per jenis laporan |

---

## Folder `src/constants/` — Konstanta

| File | Kegunaan |
|------|----------|
| `shipment-status.ts` | Status shipment & aturan transisi |
| `payment.ts` | Metode & status pembayaran |
| `roles.ts` | Definisi role user |

---

## Folder `src/types/` — TypeScript Types

| File | Kegunaan |
|------|----------|
| `customer-portal.ts` | Type Shipment, Branch, Payment, User, dll |
| `auth.ts` | Type AuthUser, JWT payload |
| `report.ts` | Type laporan PDF |
| `api.ts` | Type response API |

---

## Folder `src/hooks/` — Custom React Hooks

| File | Kegunaan |
|------|----------|
| `use-online-status.ts` | Deteksi koneksi online/offline (PWA) |

---

## Folder `src/config/`

| File | Kegunaan |
|------|----------|
| `env.ts` | Validasi variabel environment wajib (production) |

---

## Folder `prisma/`

| File | Kegunaan |
|------|----------|
| `schema.prisma` | Definisi model database (sumber kebenaran ORM) |
| `migrations/` | File SQL migrasi otomatis Prisma |

### Model database utama

| Model | Kegunaan |
|-------|----------|
| `customers` | Akun customer |
| `users` | Akun staff (admin, kasir, kurir, manager, owner) |
| `branches` | Cabang ekspedisi |
| `shipments` | Data pengiriman (+ `courier_id` kurir pengantaran terakhir) |
| `shipment_items` | Detail paket (+ foto saat order) |
| `shipment_trackings` | Histori status & kurir yang menangani |
| `payments` | Data pembayaran |
| `rates` | Tarif per rute kota |
| `customer_notifications` | Inbox notifikasi penerima |
| `vehicles` | Kendaraan kurir |

---

## Folder `database/` — SQL Manual

Digunakan jika setup database tanpa Prisma migrate, atau sebagai referensi schema.

| File | Kegunaan |
|------|----------|
| `phase1_schema.sql` | DDL tabel utama |
| `phase1_seed.sql` | Data awal (cabang, user, rates) |
| `customer_notifications.sql` | Tabel notifikasi inbox |
| `revision_courier_code.sql` | Migrasi courier code |

---

## Folder `public/`

| Path | Kegunaan |
|------|----------|
| `images/` | Gambar statis UI |
| `uploads/` | File upload runtime (foto paket, bukti delivery) |
| `manifest.json` | Konfigurasi PWA |

---

## Folder `scripts/`

| File | Kegunaan |
|------|----------|
| `dev.js` | Jalankan `next dev` + auto kill port 3000 |
| `test-db.ts` | Uji koneksi `DATABASE_URL` |
| `test-rbac.ts` | Uji hak akses role |
| `create-owner.ts` | Buat akun owner via CLI |

---

## Alur File Saat Menambah Fitur Baru

### Contoh: fitur API baru

1. **Validasi** → `src/validations/<fitur>.validation.ts`
2. **Repository** → `src/repositories/<fitur>.repository.ts`
3. **Service** → `src/services/<fitur>.service.ts`
4. **API Route** → `src/app/api/v1/<role>/<fitur>/route.ts`
5. **UI** (jika perlu) → `src/app/<portal>/<fitur>/page.tsx` + `src/components/`

### Contoh: ubah alur shipment

1. `src/constants/shipment-status.ts` — status & transisi
2. `src/services/shipment.service.ts` — aturan bisnis
3. `src/repositories/shipment.repository.ts` — query/update DB
4. `src/components/staff/staff-pages.tsx` — action UI admin/kurir
5. `src/app/customer/pesanan/[id]/page.tsx` — timeline customer

---

## File Konfigurasi Deploy

| File | Kegunaan saat deploy |
|------|----------------------|
| `.env` | Secret & konfigurasi runtime |
| `Dockerfile` | Build image production |
| `docker-compose.yml` | Jalankan app + MySQL |
| `.dockerignore` | Optimasi ukuran image |
| `next.config.ts` | PWA, image domain, tracing root |
| `package.json` | Dependency yang di-install di server/container |

---

## Catatan Penting

- **Jangan commit** file `.env` — berisi secret.
- Upload production disimpan di volume `public/uploads` (Docker volume `uploads_data`).
- `shipment_items.photo` = foto paket saat order.
- `shipments.photo` = foto bukti delivery dari kurir.
- Histori kurir pickup & delivery ada di `shipment_trackings.description` (tanpa kolom DB tambahan).

---

Lihat juga **[README.md](./README.md)** untuk panduan instalasi dan deployment Docker.
