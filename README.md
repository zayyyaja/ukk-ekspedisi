# Ekspedisi Online

Aplikasi web manajemen ekspedisi/logistik berbasis **Next.js** dengan portal customer, dashboard staff (admin, kasir, kurir, manager, owner), pembayaran Midtrans, tracking pengiriman, dan notifikasi inbox customer.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| UI | React 19, Tailwind CSS 4, Radix UI, Lucide Icons |
| State / Data Fetching | TanStack React Query, TanStack Table |
| Form & Validasi | React Hook Form, Zod |
| ORM / Database | Prisma 6 + MySQL 8 |
| Autentikasi | JWT (jose) + HTTP-only session cookie |
| Pembayaran | Midtrans |
| Email | Nodemailer (SMTP) |
| Captcha | Cloudflare Turnstile |
| PDF Report | jsPDF + jspdf-autotable |
| PWA | next-pwa |
| Upload File | Local storage (`public/uploads`) |

---

## Prasyarat

### Development (lokal)

- **Node.js** 20 LTS atau lebih baru
- **npm** 10+
- **MySQL** 8.x (lokal atau remote)
- **Git**

### Production / Docker

- **Docker** 24+
- **Docker Compose** v2+

---

## Package yang Perlu Di-install

Semua dependency utama sudah tercantum di `package.json`. Saat deploy, cukup jalankan:

```bash
npm ci
```

### Dependencies utama (production)

| Package | Kegunaan |
|---------|----------|
| `next` | Framework fullstack React |
| `react`, `react-dom` | UI library |
| `@prisma/client`, `prisma` | ORM database MySQL |
| `zod` | Validasi request & env |
| `jose` | JWT token |
| `bcryptjs` | Hash password |
| `midtrans-client` | Gateway pembayaran |
| `nodemailer` | Kirim email verifikasi |
| `@tanstack/react-query` | Data fetching client |
| `@tanstack/react-table` | Tabel data staff |
| `tailwindcss` | Styling |
| `next-pwa` | Progressive Web App |
| `jspdf`, `jspdf-autotable` | Export laporan PDF |
| `recharts` | Grafik dashboard |
| `sonner` | Toast notification |
| `lucide-react` | Icon |

### Dev dependencies

| Package | Kegunaan |
|---------|----------|
| `typescript` | Type checking |
| `tsx` | Jalankan script TypeScript |
| `@types/*` | Type definitions |

---

## Setup Lokal (Tanpa Docker)

### 1. Clone & install

```bash
git clone <repository-url>
cd Ekspedisi-Online
npm install
```

### 2. Konfigurasi environment

Salin file contoh environment:

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai sesuai environment Anda.

#### Variabel wajib

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string MySQL, contoh: `mysql://user:pass@localhost:3306/ekspedisi_online` |
| `JWT_ACCESS_SECRET` | Secret token akses (min. 32 karakter random) |
| `JWT_REFRESH_SECRET` | Secret token refresh |
| `JWT_EMAIL_VERIFICATION_SECRET` | Secret verifikasi email |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans |
| `TURNSTILE_SECRET_KEY` | Secret key Cloudflare Turnstile |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key Turnstile (client) |

#### Variabel opsional

| Variabel | Deskripsi |
|----------|-----------|
| `APP_URL` | URL aplikasi, default `http://localhost:3000` |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk production Midtrans |
| `SMTP_*`, `EMAIL_FROM` | Konfigurasi email SMTP |

### 3. Setup database

Buat database MySQL:

```sql
CREATE DATABASE danish_ekspedisi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema & seed (pilih salah satu):

**Opsi A — Prisma migrate**

```bash
npx prisma migrate deploy
npx prisma generate
```

**Opsi B — SQL manual**

```bash
mysql -u root -p ekspedisi_online < database/phase1_schema.sql
mysql -u root -p ekspedisi_online < database/phase1_seed.sql
mysql -u root -p ekspedisi_online < database/customer_notifications.sql
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Jalankan development server

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:3000**

> Script `npm run dev` otomatis membebaskan port 3000 jika masih digunakan proses sebelumnya.

### 6. Perintah lain

```bash
npm run build      # Build production
npm run start      # Jalankan production build
npm run lint       # TypeScript check (tsc --noEmit)
npm run db:pull    # Pull schema dari database
npm run db:test    # Test koneksi database
```

---

## Deployment dengan Docker (Step by Step)

### Langkah 1 — Siapkan server

Pastikan server (VPS/VM) sudah terinstall:

```bash
docker --version
docker compose version
```

### Langkah 2 — Clone project ke server

```bash
git clone <repository-url>
cd Ekspedisi-Online
```

### Langkah 3 — Buat file environment

```bash
cp .env.example .env
```

Edit `.env` untuk production:

```env
NODE_ENV=production
APP_URL=https://domain-anda.com
DATABASE_URL=mysql://ekspedisi:ekspedisi_secret@db:3306/ekspedisi_online
JWT_ACCESS_SECRET=<random-secret-panjang>
JWT_REFRESH_SECRET=<random-secret-panjang>
JWT_EMAIL_VERIFICATION_SECRET=<random-secret-panjang>
MIDTRANS_SERVER_KEY=<production-server-key>
MIDTRANS_CLIENT_KEY=<production-client-key>
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>
TURNSTILE_SECRET_KEY=<secret-key>
```

> Di Docker Compose, host database adalah `db` (nama service), bukan `localhost`.

### Langkah 4 — Build & jalankan container

```bash
docker compose up -d --build
```

Perintah ini akan:

1. Menjalankan container **MySQL 8.4** (`ekspedisi-mysql`)
2. Build image aplikasi Next.js (`ekspedisi-app`)
3. Menjalankan aplikasi di port **3000**
4. Menyimpan data MySQL & upload file ke Docker volume

### Langkah 5 — Cek status container

```bash
docker compose ps
docker compose logs -f app
```

### Langkah 6 — Inisialisasi database

Setelah MySQL siap, jalankan migrasi/schema:

```bash
# Opsi A: Prisma migrate
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma generate

# Opsi B: Import SQL manual ke container MySQL
docker compose exec -T db mysql -uekspedisi -pekspedisi_secret ekspedisi_online < database/phase1_schema.sql
docker compose exec -T db mysql -uekspedisi -pekspedisi_secret ekspedisi_online < database/phase1_seed.sql
```

### Langkah 7 — Akses aplikasi

Buka browser:

```
http://<IP-server>:3000
```

Untuk production dengan domain & HTTPS, gunakan reverse proxy (Nginx / Caddy) di depan container.

### Langkah 8 — Update deployment (setelah ada perubahan code)

```bash
git pull
docker compose up -d --build
```

### Langkah 9 — Stop & hapus container

```bash
docker compose down          # stop container
docker compose down -v       # stop + hapus volume (HATI-HATI: data hilang)
```

---

## Reverse Proxy (Opsional — Production)

Contoh Nginx di depan Docker:

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Struktur Role & Portal

| Role | URL Portal |
|------|------------|
| Customer | `/customer` |
| Admin Cabang | `/staff/admin` |
| Kasir | `/staff/cashier` |
| Kurir | `/staff/courier` |
| Manager | `/staff/manager` |
| Owner | `/staff/owner` |

---

## Alur Status Pengiriman

```
pending → picked_up → in_transit → arrived_at_branch → out_for_delivery → delivered
```

Histori kurir (pickup & delivery) disimpan di tabel `shipment_trackings`. Kolom `shipments.courier_id` hanya menyimpan kurir pengantaran terakhir ke penerima.

---

## Upload File

- Foto paket customer/kasir: disimpan di `public/uploads/` (volume Docker: `uploads_data`)
- Foto bukti delivery kurir: disimpan di `shipments.photo`
- Foto paket saat order: disimpan di `shipment_items.photo`

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Port 3000 sudah dipakai | Jalankan `npm run dev` (auto kill port) atau ubah port di `docker-compose.yml` |
| Prisma tidak connect DB | Pastikan `DATABASE_URL` benar dan MySQL sudah running |
| Error 422 validasi | Cek format input (contoh: courier code harus 5 digit angka) |
| Upload gagal | Pastikan folder `public/uploads` writable |
| Midtrans gagal | Cek `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` dan `APP_URL` |

---

## Lisensi

ISC
