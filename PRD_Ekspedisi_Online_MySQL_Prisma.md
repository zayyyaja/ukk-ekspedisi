# PRD Sistem Informasi Ekspedisi Online (Revisi MySQL + Prisma)

## 1. Informasi Umum

### Nama Sistem
Sistem Informasi Ekspedisi Online

### Tujuan
Membangun platform ekspedisi online yang mendukung pengiriman antar cabang, pelacakan paket, pembayaran online melalui Midtrans, manajemen cabang, kurir, kasir, dan dashboard manajemen.

---

## 2. Tech Stack

### Frontend
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js Route Handlers
- Server Actions

### Database
- MySQL 8+

### ORM
- Prisma ORM

### Authentication
- JWT Authentication
- HttpOnly Cookie

### Storage
- Cloudinary

### Payment Gateway
- Midtrans

### Deployment
- Vercel
- Railway (MySQL)

---

## 3. Role System

### Customer
- Register
- Verifikasi Email
- Login
- Buat Shipment
- Tracking Paket
- Riwayat Pengiriman

### Admin
- Kelola Cabang
- Kelola Staff
- Kelola Shipment
- Kelola Tracking
- Kelola Vehicle
- Kelola Rate
- Assign Courier

### Cashier
- Verifikasi pembayaran cash
- Monitoring pembayaran Midtrans
- Laporan pembayaran cabang

### Courier
- Pickup paket
- Delivery paket
- Upload proof delivery

### Manager
- Monitoring seluruh cabang
- Monitoring seluruh shipment
- Monitoring seluruh pendapatan
- Analitik dan laporan

---

## 4. Authentication Architecture

### Customer Login
/customer/login

Tabel:
customers

Customer wajib verifikasi email.

### Staff Login
/staff/login

Tabel:
users

Staff dibuat oleh admin.
Tidak dapat registrasi sendiri.

---

## 5. Database Utama

Referensi utama database mengikuti PDM Sistem Informasi Ekspedisi Online pada file PDF `SMK TI BAZMA - Tugas Praktek-1.pdf`. Struktur berikut menjadi baseline tabel MySQL dan model Prisma. Field tambahan boleh ditambahkan selama tidak mengurangi fungsi dari PDM.

### 5.1 Tabel Referensi dari PDM PDF

#### branches
Menyimpan data cabang ekspedisi.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(255) | Nama cabang |
| city | VARCHAR(255) | Kota cabang |
| address | VARCHAR(255) | Alamat cabang |
| phone | VARCHAR(255) | Nomor telepon cabang |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### users
Menyimpan akun staff internal: admin, cashier, courier, manager.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(255) | Nama staff |
| email | VARCHAR(255) | Email login staff |
| email_verified_at | TIMESTAMP NULL | Waktu verifikasi email |
| password | VARCHAR(255) | Password terenkripsi |
| role | ENUM('admin','cashier','courier','manager') | Role staff |
| branch_id | BIGINT UNSIGNED NULL | Relasi ke branches untuk cashier/courier |
| remember_token | VARCHAR(100) NULL | Token remember me |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### customers
Menyimpan akun customer/pelanggan.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(50) | Nama customer |
| email | VARCHAR(255) | Email login customer |
| email_verified_at | TIMESTAMP NULL | Waktu verifikasi email |
| password | VARCHAR(255) | Password terenkripsi |
| address | TEXT | Alamat customer |
| city | VARCHAR(255) | Kota customer |
| phone | VARCHAR(15) | Nomor telepon customer |
| photo | VARCHAR(255) NULL | Foto profil customer |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### rates
Menyimpan tarif pengiriman berdasarkan kota asal dan tujuan.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| origin_city | VARCHAR(255) | Kota asal |
| destination_city | VARCHAR(255) | Kota tujuan |
| price_per_kg | DECIMAL(15,2) | Tarif per kilogram |
| estimated_days | INT | Estimasi hari pengiriman |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### vehicles
Menyimpan armada kurir.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| plate_number | VARCHAR(255) | Nomor kendaraan |
| type | ENUM('motor','mobil','truck') | Jenis kendaraan |
| courier_id | BIGINT UNSIGNED | Relasi ke users dengan role courier |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### shipments
Menyimpan transaksi pengiriman utama.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| tracking_number | VARCHAR(255) | Nomor resi unik |
| sender_id | BIGINT UNSIGNED | Relasi ke customers sebagai pengirim |
| receiver_id | BIGINT UNSIGNED | Relasi ke customers atau data penerima |
| origin_branch_id | BIGINT UNSIGNED | Relasi ke branches asal |
| destination_branch_id | BIGINT UNSIGNED | Relasi ke branches tujuan |
| courier_id | BIGINT UNSIGNED NULL | Relasi ke users dengan role courier |
| rate_id | BIGINT UNSIGNED | Relasi ke rates |
| handover_method | ENUM('drop_off','pickup') | Metode serah paket |
| total_weight | DECIMAL(10,2) | Total berat paket |
| total_price | DECIMAL(15,2) | Total biaya pengiriman |
| status | ENUM('pending','picked_up','in_transit','arrived_at_branch','out_for_delivery','delivered','cancelled') | Status pengiriman |
| shipment_date | DATE | Tanggal shipment dibuat |
| photo | VARCHAR(255) NULL | Proof of delivery dari courier |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### shipment_items
Menyimpan detail barang dalam satu shipment.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| shipment_id | BIGINT UNSIGNED | Relasi ke shipments |
| item_name | VARCHAR(255) | Nama barang |
| quantity | INT | Jumlah barang |
| weight | DECIMAL(10,2) | Berat barang |
| photo | VARCHAR(255) NULL | Foto kondisi awal barang |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### payments
Menyimpan pembayaran shipment.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| shipment_id | BIGINT UNSIGNED | Relasi ke shipments |
| amount | DECIMAL(15,2) | Nominal pembayaran |
| payment_method | ENUM('cash','qris','gopay','shopeepay','bca_va','bni_va','bri_va','mandiri_va') | Metode pembayaran |
| payment_status | ENUM('pending','paid','failed') | Status pembayaran |
| payment_date | DATE NULL | Tanggal pembayaran |
| midtrans_order_id | VARCHAR(255) NULL | Order ID Midtrans |
| midtrans_transaction_id | VARCHAR(255) NULL | Transaction ID Midtrans |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

#### shipment_trackings
Menyimpan histori tracking per shipment.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | BIGINT UNSIGNED | Primary key |
| shipment_id | BIGINT UNSIGNED | Relasi ke shipments |
| location | VARCHAR(255) | Lokasi paket |
| description | TEXT | Catatan tracking |
| status | ENUM('picked_up','in_transit','arrived_at_branch','out_for_delivery','delivered') | Status tracking |
| tracked_at | TIMESTAMP | Waktu tracking |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

### 5.2 Tabel Tambahan Aplikasi

Tabel berikut tidak terlihat pada PDM PDF, tetapi dibutuhkan oleh requirement aplikasi modern, autentikasi, verifikasi, reset password, landing page dinamis, dan audit.

| Tabel | Fungsi |
| --- | --- |
| email_verifications | Token verifikasi email customer dan staff |
| password_resets | Token reset password |
| landing_contents | Konten dinamis landing page |
| audit_logs | Riwayat aktivitas admin/staff penting |
| notifications | Notifikasi customer/staff terkait shipment dan pembayaran |

### 5.3 Relasi Utama

- branches 1..n users
- branches 1..n shipments sebagai origin_branch
- branches 1..n shipments sebagai destination_branch
- customers 1..n shipments sebagai sender
- customers 1..n shipments sebagai receiver atau data penerima
- users 1..n shipments sebagai courier
- users 1..n vehicles sebagai courier
- rates 1..n shipments
- shipments 1..n shipment_items
- shipments 1..n payments
- shipments 1..n shipment_trackings

---

## 6. Workflow Shipment

### Drop Off

Customer Buat Shipment
→ Upload Foto Barang
→ Hitung Ongkir
→ Pembayaran
→ Generate Resi
→ Pending
→ Customer Datang Ke Cabang
→ Admin Input Resi
→ Picked Up
→ In Transit
→ Arrived At Branch
→ Out For Delivery
→ Delivered

### Pickup

Customer Buat Shipment
→ Upload Foto Barang
→ Pembayaran Online
→ Generate Resi
→ Pending
→ Admin Assign Courier
→ Courier Pickup
→ Picked Up
→ In Transit
→ Arrived At Branch
→ Out For Delivery
→ Delivered

---

## 7. Status Shipment

- pending
- picked_up
- in_transit
- arrived_at_branch
- out_for_delivery
- delivered
- cancelled

---

## 8. Payment

### Online
- QRIS
- GoPay
- ShopeePay
- BCA VA
- BNI VA
- BRI VA
- Mandiri VA

Semua menggunakan Midtrans.

### Cash

Hanya untuk Drop Off.

Cashier melakukan verifikasi pembayaran sebelum resi diterbitkan.

---

## 9. Dashboard Manager

- Total Shipment
- Total Customer
- Total Pendapatan
- Total Cabang
- Total Courier

### Analitik

- Shipment Per Bulan
- Pendapatan Per Bulan
- Pendapatan Per Cabang
- Courier Performance
- Delivery Success Rate

---

## 10. Prisma ORM Requirement

Gunakan Prisma ORM untuk seluruh operasi database.

Model utama:

- Branch
- User
- Customer
- Rate
- Vehicle
- Shipment
- ShipmentItem
- Payment
- ShipmentTracking

Semua migration menggunakan:

```bash
npx prisma migrate dev
npx prisma migrate deploy
```

---

# MASTER PROMPT AGENT AI (REVISI MYSQL + PRISMA)

Bangun aplikasi sesuai PRD ini menggunakan:

- Next.js 15
- MySQL
- Prisma ORM
- JWT Authentication
- Midtrans
- Cloudinary

Kerjakan bertahap:

PHASE 1 Database Design

Output:
- `docs/PHASE_1_Database_Design.md`
- `database/phase1_schema.sql`
- `database/phase1_seed.sql`

PHASE 2 Prisma Schema

PHASE 3 Authentication

Output:
- `docs/PHASE_3_Authentication.md`
- `database/phase3_auth_sessions.sql`

PHASE 4 API Design

Output:
- `docs/PHASE_4_API_Design.md`

PHASE 5 Information Architecture

Output:
- `docs/PHASE_5_Information_Architecture.md`

PHASE 6 Dashboard Development

PHASE 7 Landing Page

PHASE 8 Testing

PHASE 9 Deployment

Jangan melanjutkan phase berikutnya sebelum phase sebelumnya selesai.
