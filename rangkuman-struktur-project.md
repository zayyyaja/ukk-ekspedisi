# 📦 Rangkuman Struktur Project — Ekspedisi Online

> **Stack:** Next.js 15 (App Router) · TypeScript · Prisma ORM · MySQL · Vanilla CSS · TanStack Query

---

## 🎨 STYLING & LAYOUT

### CSS Global & Design System
| File | Fungsi |
|------|--------|
| [`src/app/globals.css`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/globals.css) | **File CSS utama** — semua design token, variabel warna, typography, utility classes, dan styling komponen-komponen seperti `.button`, `.input`, `.card`, `.badge`, `.table`, `.sidebar`, dll. |
| [`next.config.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/next.config.ts) | Konfigurasi Next.js (PWA, image domains, caching strategy) |
| [`components.json`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/components.json) | Konfigurasi shadcn/ui (path alias, style system) |

### Layout Utama (Wrapper per Audience)
| File | Fungsi |
|------|--------|
| [`src/app/layout.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/layout.tsx) | Root layout — font, metadata SEO, PWA, Sonner toast |
| [`src/app/(public)/layout.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/(public)/layout.tsx) | Layout halaman publik (navbar + footer) |
| [`src/app/customer/layout.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/layout.tsx) | Layout portal customer (navbar customer) |
| [`src/app/staff/layout.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/layout.tsx) | Layout dashboard staff (sidebar + topbar) |

---

## 🖥️ FRONTEND — HALAMAN (Pages)

### 🌐 Halaman Publik (tidak perlu login)
| Route / File | Fungsi |
|---|---|
| [`src/app/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/page.tsx) | Redirect ke halaman utama publik |
| [`src/app/login/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/login) | Halaman login umum |
| [`src/app/cabang/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/cabang) | Direktori daftar cabang |
| [`src/app/cek-ongkir/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/cek-ongkir) | Kalkulator tarif pengiriman (cek ongkos kirim) |
| [`src/app/tracking/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/tracking) | Tracking paket publik tanpa login |
| [`src/app/kontak/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/kontak) | Halaman kontak |
| [`src/app/tentang-kami/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/tentang-kami) | Halaman tentang perusahaan |
| [`src/app/offline/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/offline) | Halaman fallback saat offline (PWA) |

### 👤 Portal Customer (butuh login customer)
| Route / File | Fungsi |
|---|---|
| [`src/app/customer/page.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/page.tsx) | Landing page customer setelah login |
| [`src/app/customer/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/dashboard) | Dashboard ringkasan pesanan customer |
| [`src/app/customer/buat-pesanan/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/buat-pesanan) | Form buat pesanan baru (multi-step, upload foto item) |
| [`src/app/customer/pesanan/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/pesanan) | Daftar semua pesanan milik customer |
| [`src/app/customer/pesanan/[id]/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/pesanan) | Detail pesanan + timeline tracking |
| [`src/app/customer/pembayaran/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/pembayaran) | Halaman proses pembayaran (Midtrans) |
| [`src/app/customer/lacak-paket/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/lacak-paket) | Lacak paket dari dalam portal customer |
| [`src/app/customer/profile/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/profile) | Edit profil + upload foto profil |
| [`src/app/customer/login/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/login) | Halaman login khusus customer |
| [`src/app/customer/register/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/register) | Registrasi customer baru |
| [`src/app/customer/verify-email/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/verify-email) | Verifikasi email setelah register |

### 👷 Dashboard Staff — Admin (per cabang, butuh login)
| Route / File | Fungsi |
|---|---|
| [`src/app/staff/admin/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/dashboard) | Dashboard statistik admin cabang |
| [`src/app/staff/admin/shipments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/shipments) | Manajemen semua shipment di cabang |
| [`src/app/staff/admin/branches/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/branches) | Manajemen data cabang |
| [`src/app/staff/admin/customers/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/customers) | Daftar customer |
| [`src/app/staff/admin/staff/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/staff) | Manajemen data staff |
| [`src/app/staff/admin/payments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/payments) | Monitoring pembayaran |
| [`src/app/staff/admin/rates/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/rates) | Manajemen tarif pengiriman |
| [`src/app/staff/admin/vehicles/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/admin/vehicles) | Manajemen kendaraan |

### 📦 Dashboard Staff — Cashier
| Route / File | Fungsi |
|---|---|
| [`src/app/staff/cashier/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/dashboard) | Dashboard kasir |
| [`src/app/staff/cashier/pesanan/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/pesanan) | Daftar pesanan di cabang kasir |
| [`src/app/staff/cashier/tambah-pesanan/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/tambah-pesanan) | Buat pesanan manual (walk-in customer) |
| [`src/app/staff/cashier/payments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/payments) | Daftar pembayaran |
| [`src/app/staff/cashier/cash-verification/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/cash-verification) | Verifikasi pembayaran tunai |
| [`src/app/staff/cashier/laporan/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/laporan) | Laporan kasir |
| [`src/app/staff/cashier/reports/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/reports) | Export PDF laporan |

### 🚴 Dashboard Staff — Courier (Kurir)
| Route / File | Fungsi |
|---|---|
| [`src/app/staff/courier/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/courier/dashboard) | Dashboard kurir |
| [`src/app/staff/courier/pickups/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/courier/pickups) | Daftar penjemputan paket yang ditugaskan |
| [`src/app/staff/courier/deliveries/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/courier/deliveries) | Daftar pengiriman + konfirmasi terkirim + upload foto bukti |
| [`src/app/staff/courier/shipments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/courier/shipments) | Semua shipment yang diassign ke kurir |

### 📊 Dashboard Staff — Manager
| Route / File | Fungsi |
|---|---|
| [`src/app/staff/manager/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/dashboard) | Dashboard manager (monitoring multi-cabang) |
| [`src/app/staff/manager/shipments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/shipments) | Monitoring semua shipment |
| [`src/app/staff/manager/branches/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/branches) | Monitoring performa cabang |
| [`src/app/staff/manager/analytics/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/analytics) | Analitik dan grafik |
| [`src/app/staff/manager/payments/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/payments) | Monitoring pembayaran seluruh cabang |
| [`src/app/staff/manager/users/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/manager/users) | Manajemen user staff |

### 👑 Dashboard — Owner
| Route / File | Fungsi |
|---|---|
| [`src/app/staff/owner/dashboard/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/owner/dashboard) | Dashboard owner (laporan bisnis top-level) |
| [`src/app/staff/owner/analytics/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/owner/analytics) | Analitik keseluruhan bisnis |

---

## 🧩 FRONTEND — KOMPONEN

### Layout & Navigasi
| File | Fungsi |
|---|---|
| [`src/components/layout/public-navbar.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/public-navbar.tsx) | Navbar halaman publik (logo, menu, CTA login) |
| [`src/components/layout/public-footer.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/public-footer.tsx) | Footer halaman publik |
| [`src/components/layout/staff-sidebar.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/staff-sidebar.tsx) | Sidebar navigasi dashboard staff (per-role) |
| [`src/components/layout/staff-topbar.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/staff-topbar.tsx) | Topbar dashboard staff (profil, logout) |
| [`src/components/layout/mobile-sidebar.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/mobile-sidebar.tsx) | Sidebar mobile (hamburger menu) |
| [`src/components/layout/navigation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/layout/navigation.ts) | Konfigurasi item menu navigasi per role |

### Halaman Publik
| File | Fungsi |
|---|---|
| [`src/components/public/hero-section.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/public/hero-section.tsx) | Hero banner utama halaman publik |
| [`src/components/public/cta-section.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/public/cta-section.tsx) | Call-to-action section |
| [`src/components/public/rate-section.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/public/rate-section.tsx) | Tampilan tarif pengiriman di halaman publik |
| [`src/components/public/auth-modal.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/public/auth-modal.tsx) | Modal login/register dari navbar publik |
| [`src/components/public/public-shell.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/public/public-shell.tsx) | Wrapper konten halaman publik |

### Customer
| File | Fungsi |
|---|---|
| [`src/components/customer/customer-navbar-shell.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/customer/customer-navbar-shell.tsx) | Navbar + shell portal customer |
| [`src/components/customer/customer-tracker.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/customer/customer-tracker.tsx) | Komponen tracking paket interaktif |
| [`src/components/customer/customer-query-provider.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/customer/customer-query-provider.tsx) | Provider TanStack Query untuk customer |

### Kasir (Cashier)
| File | Fungsi |
|---|---|
| [`src/components/cashier/cashier-order-table.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/cashier/cashier-order-table.tsx) | Tabel pesanan kasir (create, assign kurir, dll) |
| [`src/components/cashier/cashier-filters.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/cashier/cashier-filters.tsx) | Filter bar untuk tabel pesanan kasir |
| [`src/components/cashier/cashier-shell.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/cashier/cashier-shell.tsx) | Layout shell khusus kasir |
| [`src/components/cashier/cashier-api.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/cashier/cashier-api.ts) | Fungsi fetch API khusus modul kasir |
| [`src/components/cashier/cashier-types.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/cashier/cashier-types.ts) | TypeScript types untuk modul kasir |

### Staff (Admin/Courier/Manager — berbagi komponen)
| File | Fungsi |
|---|---|
| [`src/components/staff/staff-pages.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/staff-pages.tsx) | **File terbesar (54KB)** — semua halaman staff (dashboard, shipments, payments, branches, users, dll) dalam satu file |
| [`src/components/staff/data-table.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/data-table.tsx) | Komponen tabel data reusable untuk staff |
| [`src/components/staff/action-menu.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/action-menu.tsx) | Menu aksi dropdown per baris tabel |
| [`src/components/staff/confirm-dialog.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/confirm-dialog.tsx) | Dialog konfirmasi aksi berbahaya |
| [`src/components/staff/filter-bar.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/filter-bar.tsx) | Bar filter status di tabel |
| [`src/components/staff/page-header.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/page-header.tsx) | Header setiap halaman staff |
| [`src/components/staff/stat-card.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/stat-card.tsx) | Card statistik dashboard |
| [`src/components/staff/dashboard-chart.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/dashboard-chart.tsx) | Grafik/chart dashboard |
| [`src/components/staff/staff-layout-client.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/staff-layout-client.tsx) | Client layout wrapper untuk staff (sidebar toggle) |

### Auth Guards
| File | Fungsi |
|---|---|
| [`src/components/auth/customer-guard.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/auth/customer-guard.tsx) | Guard: redirect jika bukan customer |
| [`src/components/auth/staff-guard.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/auth/staff-guard.tsx) | Guard: redirect jika bukan staff |
| [`src/components/auth/role-guard.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/auth/role-guard.tsx) | Guard: validasi role spesifik |
| [`src/components/auth/system-captcha.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/auth/system-captcha.tsx) | Captcha fallback (math captcha) |
| [`src/components/auth/turnstile-captcha.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/auth/turnstile-captcha.tsx) | Cloudflare Turnstile CAPTCHA |

### Komponen Shared (Reusable)
| File | Fungsi |
|---|---|
| [`src/components/shared/data-table.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/data-table.tsx) | Tabel data generik |
| [`src/components/shared/stat-card.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/stat-card.tsx) | Card statistik generik |
| [`src/components/shared/page-header.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/page-header.tsx) | Header halaman generik |
| [`src/components/shared/empty-state.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/empty-state.tsx) | State kosong (no data) |
| [`src/components/shared/error-state.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/error-state.tsx) | State error fetch |
| [`src/components/shared/loading-state.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/loading-state.tsx) | State loading |
| [`src/components/shared/status-badge.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/status-badge.tsx) | Badge warna status shipment/payment |
| [`src/components/shared/confirm-dialog.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/shared/confirm-dialog.tsx) | Dialog konfirmasi generik |
| [`src/components/status-badge.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/status-badge.tsx) | Badge status alternatif |
| [`src/components/offline-banner.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/offline-banner.tsx) | Banner notifikasi offline (PWA) |
| [`src/components/pwa-install.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/pwa-install.tsx) | Prompt install PWA |
| [`src/components/sync-status.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII\SaaS\TASK\Ekspedisi\src\components\sync-status.tsx) | Status sinkronisasi data offline |

### UI Primitives (shadcn-based)
| File | Fungsi |
|---|---|
| [`src/components/ui/button.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/button.tsx) | Komponen Button |
| [`src/components/ui/input.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/input.tsx) | Komponen Input |
| [`src/components/ui/card.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/card.tsx) | Komponen Card |
| [`src/components/ui/dialog.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/dialog.tsx) | Komponen Modal/Dialog |
| [`src/components/ui/table.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/table.tsx) | Komponen Tabel |
| [`src/components/ui/select.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/select.tsx) | Komponen Dropdown Select |
| [`src/components/ui/tabs.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/tabs.tsx) | Komponen Tabs |
| [`src/components/ui/badge.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/badge.tsx) | Komponen Badge |
| [`src/components/ui/sheet.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/sheet.tsx) | Komponen Sheet/Drawer |
| [`src/components/ui/sonner.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/sonner.tsx) | Toast notifications |
| [`src/components/ui/skeleton.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/skeleton.tsx) | Loading skeleton |
| [`src/components/ui/full-page-loader.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/full-page-loader.tsx) | Full-page loading spinner |
| [`src/components/ui/dropdown-menu.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/ui/dropdown-menu.tsx) | Komponen Dropdown Menu |

### Reports
| File | Fungsi |
|---|---|
| [`src/components/reports/pdf-export-button.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/reports/pdf-export-button.tsx) | Tombol export laporan ke PDF |
| [`src/components/reports/report-filter.tsx`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/reports/report-filter.tsx) | Filter tanggal/cabang untuk laporan |

---

## ⚙️ BACKEND — API Routes

> Semua di bawah `src/app/api/v1/` — menggunakan Next.js Route Handlers

### 🔐 Auth
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/auth/me` | `GET` | Ambil data user yang login |
| `/api/v1/auth/logout` | `POST` | Logout, hapus cookie |
| `/api/v1/auth/refresh` | `POST` | Refresh JWT access token |
| `/api/v1/auth/captcha` | `GET` | Generate CAPTCHA |
| `/api/v1/customer/auth` | `POST` | Login/register customer |
| `/api/v1/staff/auth` | `POST` | Login staff |

### 📦 Shipments
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/customer/shipments` | `GET/POST` | Daftar & buat pesanan (customer) |
| `/api/v1/customer/shipments/[id]` | `GET` | Detail pesanan customer |
| `/api/v1/admin/shipments` | `GET` | Daftar shipment (admin/manager) |
| `/api/v1/admin/shipments/[id]` | `GET` | Detail shipment staff |
| `/api/v1/admin/shipments/[id]/status` | `PATCH` | Update status (admin) |
| `/api/v1/admin/shipments/[id]/assign-courier` | `PATCH` | Assign kurir ke shipment |
| `/api/v1/admin/shipments/receive` | `POST` | Konfirmasi paket tiba di cabang |
| `/api/v1/courier/shipments` | `GET` | Daftar shipment milik kurir |
| `/api/v1/courier/shipments/[id]/status` | `PATCH` | Update status oleh kurir |

### 💳 Payments
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/customer/payments` | `GET` | Status pembayaran customer |
| `/api/v1/admin/payments` | `GET` | Monitoring pembayaran (admin) |
| `/api/v1/cashier/payments` | `GET` | Monitoring pembayaran kasir |
| `/api/v1/manager/payments` | `GET` | Monitoring pembayaran manager |
| `/api/v1/owner/payments` | `GET` | Monitoring pembayaran owner |
| `/api/v1/webhooks/midtrans` | `POST` | Callback webhook Midtrans |

### 👤 Users & Customers
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/customer/profile` | `GET/PATCH` | Profil customer |
| `/api/v1/admin/users` | `GET/POST/PATCH/DELETE` | CRUD user staff |
| `/api/v1/admin/customers` | `GET` | Daftar customer |

### 🏢 Branches & Rates
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/admin/branches` | `GET/POST/PATCH/DELETE` | CRUD cabang |
| `/api/v1/admin/rates` | `GET/POST/PATCH/DELETE` | CRUD tarif |
| `/api/v1/public/branches` | `GET` | Daftar cabang (publik) |
| `/api/v1/public/rates` | `GET` | Daftar tarif (publik) |
| `/api/v1/public/tracking` | `GET` | Tracking publik by nomor resi |

### 📊 Dashboard & Analytics
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/admin/dashboard` | `GET` | Statistik dashboard admin |
| `/api/v1/cashier/dashboard` | `GET` | Statistik dashboard kasir |
| `/api/v1/manager/dashboard` | `GET` | Statistik dashboard manager |
| `/api/v1/owner/dashboard` | `GET` | Statistik dashboard owner |

### 🗂️ Reports & Lainnya
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/v1/cashier/reports` | `GET` | Data laporan untuk kasir |
| `/api/v1/cashier/orders` | `GET/POST` | Buat pesanan dari kasir |
| `/api/v1/admin/trackings` | `GET` | Data tracking history |
| `/api/v1/admin/vehicles` | `GET/POST/PATCH/DELETE` | CRUD kendaraan |
| `/api/v1/upload` | `POST` | Upload foto (customer) |
| `/api/v1/staff/upload` | `POST` | Upload foto (staff/kurir) |

---

## 🛠️ BACKEND — Layer Services, Repositories & Lib

### Services (Business Logic)
| File | Fungsi |
|---|---|
| [`src/services/shipment.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/shipment.service.ts) | Logika bisnis shipment (create, status update, validasi transisi) |
| [`src/services/auth.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/auth.service.ts) | Login, register, JWT, refresh token |
| [`src/services/payment.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/payment.service.ts) | Integrasi Midtrans, webhook handler |
| [`src/services/cashier.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/cashier.service.ts) | Logika bisnis kasir |
| [`src/services/customer.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/customer.service.ts) | Manajemen data customer |
| [`src/services/user.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/user.service.ts) | CRUD user staff |
| [`src/services/branch.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/branch.service.ts) | CRUD cabang |
| [`src/services/rate.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/rate.service.ts) | CRUD tarif |
| [`src/services/tracking.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/tracking.service.ts) | Logika tracking publik |
| [`src/services/dashboard.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/dashboard.service.ts) | Statistik untuk dashboard |
| [`src/services/vehicle.service.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/vehicle.service.ts) | CRUD kendaraan |

### Repositories (Database Queries)
| File | Fungsi |
|---|---|
| [`src/repositories/shipment.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/shipment.repository.ts) | Query Prisma untuk shipments |
| [`src/repositories/auth.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/auth.repository.ts) | Query login/session |
| [`src/repositories/payment.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/payment.repository.ts) | Query pembayaran |
| [`src/repositories/cashier.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/cashier.repository.ts) | Query kasir |
| [`src/repositories/user.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/user.repository.ts) | Query user/staff |
| [`src/repositories/branch.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/branch.repository.ts) | Query cabang |
| [`src/repositories/dashboard.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/dashboard.repository.ts) | Query statistik dashboard |
| [`src/repositories/tracking.repository.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/tracking.repository.ts) | Query tracking history |

### Lib / Utilities
| File | Fungsi |
|---|---|
| [`src/lib/prisma.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/prisma.ts) | Singleton instance Prisma Client |
| [`src/lib/session.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/session.ts) | Manajemen JWT, cookie session |
| [`src/lib/api-client.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/api-client.ts) | Fetch wrapper (`apiGet`, `apiPost`, `apiPatch`, `apiDelete`) |
| [`src/lib/response.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/response.ts) | Helper response API (successResponse, errorResponse) |
| [`src/lib/api-error.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/api-error.ts) | Handler error API (`handleApiError`) |
| [`src/lib/errors.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/errors.ts) | Custom error class (NotFoundError, ForbiddenError, dll) |
| [`src/lib/midtrans.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/midtrans.ts) | Integrasi Midtrans payment gateway |
| [`src/lib/cloudinary.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/cloudinary.ts) | Upload/delete gambar ke Cloudinary |
| [`src/lib/email.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/email.ts) | Kirim email (SMTP/Nodemailer) |
| [`src/lib/pdf.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/pdf.ts) | Generate laporan PDF (jsPDF) |
| [`src/lib/validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/validation.ts) | Wrapper validasi Zod |
| [`src/lib/rate-limit.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/rate-limit.ts) | Rate limiting untuk endpoint sensitif |
| [`src/lib/auth-client.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/auth-client.ts) | Fetch helper untuk auth dari client |
| [`src/lib/customer-format.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/customer-format.ts) | Format currency, tanggal, dll |
| [`src/lib/shipment-scope.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/shipment-scope.ts) | Filter visibilitas shipment per role |
| [`src/lib/indexeddb.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/indexeddb.ts) | Operasi IndexedDB untuk data offline |
| [`src/lib/offline-*.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib) | Loader data offline dari IndexedDB (dashboard, shipments, tracking, profile) |
| [`src/lib/report-client.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/report-client.ts) | Fetch data laporan untuk ekspor PDF |

### Middleware & Guards
| File | Fungsi |
|---|---|
| [`src/middleware.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/middleware.ts) | Next.js middleware — proteksi route berdasarkan session cookie |
| [`src/middleware/auth.middleware.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/middleware/auth.middleware.ts) | Verifikasi JWT di API route |
| [`src/middleware/role.middleware.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/middleware/role.middleware.ts) | Cek role user di API route (`requireRole`) |
| [`src/middleware/staff.middleware.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/middleware/staff.middleware.ts) | Cek apakah user adalah staff (`requireStaff`) |
| [`src/middleware/customer.middleware.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/middleware/customer.middleware.ts) | Cek apakah user adalah customer (`requireCustomer`) |

### Validations (Zod Schemas)
| File | Fungsi |
|---|---|
| [`src/validations/shipment.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/shipment.validation.ts) | Schema validasi shipment (create, update status, assign kurir) |
| [`src/validations/auth.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/auth.validation.ts) | Schema login/register |
| [`src/validations/payment.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/payment.validation.ts) | Schema pembayaran |
| [`src/validations/user.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/user.validation.ts) | Schema user CRUD |
| [`src/validations/branch.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/branch.validation.ts) | Schema cabang |
| [`src/validations/rate.validation.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/validations/rate.validation.ts) | Schema tarif |

### Constants & Types
| File | Fungsi |
|---|---|
| [`src/constants/roles.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/constants/roles.ts) | Daftar role (customer, admin, cashier, courier, manager, owner) |
| [`src/constants/shipment-status.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/constants/shipment-status.ts) | Status shipment & aturan transisi status |
| [`src/constants/payment.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/constants/payment.ts) | Konstanta metode pembayaran |
| [`src/types/auth.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/types/auth.ts) | TypeScript type AuthUser, AuthRole |
| [`src/types/api.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/types/api.ts) | Type ApiSuccessResponse, ApiErrorResponse |
| [`src/types/customer-portal.ts`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/types/customer-portal.ts) | Types untuk portal customer |

### Database
| File | Fungsi |
|---|---|
| [`prisma/schema.prisma`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/prisma) | Schema database Prisma (tabel, relasi, enum) |
| [`database/`](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/database) | Folder seed/migration SQL |

---

## 🗺️ Alur Data (Request Flow)

```
Browser/Client
    │
    ▼
Next.js Middleware (src/middleware.ts)
    │ → Cek cookie session, redirect jika tidak auth
    ▼
Page Component (src/app/**/page.tsx)
    │ → Render UI, panggil API dari client
    ▼
API Route Handler (src/app/api/v1/**/route.ts)
    │ → Auth middleware → Role check → Validasi Zod
    ▼
Service Layer (src/services/*.service.ts)
    │ → Business logic, otorisasi, transformasi data
    ▼
Repository Layer (src/repositories/*.repository.ts)
    │ → Query Prisma ORM
    ▼
Database MySQL (via Prisma)
```
