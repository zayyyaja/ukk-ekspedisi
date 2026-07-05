# Plan Lanjutan — Ekspedisi Online

> **Status:** Disimpan untuk dikerjakan nanti. Jangan eksekusi otomatis tanpa konfirmasi user.

Dibuat: 5 Juli 2026  
Konteks: Setelah cleanup file mati & dependensi tidak terpakai (cloudinary, idb, offline chain, shared duplikat).

---

## Sudah selesai (referensi)

- [x] Hapus dokumentasi lama (`task.md`, `implementation_plan.md`, `rangkuman-struktur-project.md`, README di layer src)
- [x] Hapus log dev (`.next-dev-*.log`)
- [x] Hapus kode mati: cloudinary, IndexedDB/offline chain, PWA UI mati, turnstile-captcha UI, shared components duplikat
- [x] Hapus npm: `cloudinary`, `idb`
- [x] Fix `/staff/cashier/reports` → redirect ke `/staff/cashier/laporan`
- [x] Hapus `CashierDashboardPage` duplikat di `staff-pages.tsx`
- [x] Update `README.md` & `.env.example` (hapus Cloudinary)
- [x] Verifikasi: `npm run lint` + `npm run build` lulus

---

## Plan 1 — Navigasi admin (prioritas: sedang)

**Masalah:** Halaman admin berikut ada & berfungsi, tapi tidak muncul di sidebar.

| Route | Komponen |
|-------|----------|
| `/staff/admin/customers` | `CustomersPage` |
| `/staff/admin/branches` | `BranchesPage` |
| `/staff/admin/rates` | `RatesPage` |

**Tindakan:**
1. Tambah item menu di `src/components/layout/navigation.ts` (role `admin`)
2. Pilih icon Lucide yang sesuai (mis. `UsersRound`, `Building2`, `Route`)
3. Uji akses & RBAC guard tetap jalan

**Risiko:** Rendah — hanya expose URL yang sudah ada.

---

## Plan 2 — Rapikan menu customer (prioritas: rendah)

**Masalah:** Di `customerMenu`, ada 3 item berbeda yang mengarah ke URL sama `/customer/lacak-paket`:
- Riwayat Shipment
- Tracking
- Payments

**Tindakan (pilih salah satu):**
- **Opsi A:** Gabung jadi satu item "Riwayat & Lacak"
- **Opsi B:** Pisahkan route: `/customer/pembayaran` untuk Payments, `/customer/lacak-paket` untuk riwayat
- **Opsi C:** Biarkan jika sengaja untuk UX mobile (tab virtual)

**Risiko:** Rendah — perubahan UI/nav saja.

---

## Plan 3 — Cashier: halaman tanpa nav (prioritas: rendah)

**Halaman aktif tapi tidak di sidebar cashier:**

| Route | Fungsi |
|-------|--------|
| `/staff/cashier/payments` | Daftar pembayaran (`PaymentsPage`) |
| `/staff/cashier/cash-verification` | Verifikasi cash (`CashVerificationPage`) |

**Tindakan (pilih salah satu):**
- Tambah ke `staffMenus.cashier` di `navigation.ts`, atau
- Redirect ke halaman yang sudah ada di nav jika fungsinya overlap

**Risiko:** Rendah.

---

## Plan 4 — Dokumentasi Turnstile vs svg-captcha (prioritas: rendah)

**Masalah:** `README.md` masih menyebut Cloudflare Turnstile & env `TURNSTILE_*`, tetapi komponen `turnstile-captcha.tsx` sudah dihapus. Captcha aktif di API pakai `svg-captcha`.

**Tindakan:**
1. Audit `src/app/api/v1/auth/captcha` & form login/register — captcha mana yang dipakai?
2. Update README + `.env.example`: hapus Turnstile jika tidak dipakai, atau restore komponen Turnstile jika ingin dipakai lagi

**Risiko:** Sedang — pastikan tidak break login.

---

## Plan 5 — File opsional manual (prioritas: sangat rendah)

| File | Catatan |
|------|---------|
| `ekspedisi_backup.sql` | Backup DB, bukan runtime — hapus jika tidak perlu |
| `.agents/skills/` | Hanya untuk Cursor Agent, tidak mempengaruhi build app |

**Tindakan:** Hapus manual setelah konfirmasi user.

---

## Plan 6 — Redirect legacy (JANGAN hapus tanpa alasan)

Tetap pertahankan untuk bookmark/URL lama:

- `/customer/dashboard/*`
- `/staff/courier/pickups`, `/deliveries`
- `/staff/cashier/reports` (sudah redirect ke laporan)
- `/offline` (PWA fallback via `next-pwa`)
- `/login` (hub customer/staff)

---

## Plan 7 — API tanpa halaman UI (pertahankan)

- `/api/v1/admin/trackings` + `tracking.service.ts`
- Backend tetap ada; UI admin tracking bisa ditambah di plan terpisah jika dibutuhkan

---

## Urutan rekomendasi saat eksekusi nanti

1. Plan 1 — Nav admin (impact UX terbesar, risiko kecil)
2. Plan 4 — Audit captcha + update docs
3. Plan 2 — Menu customer
4. Plan 3 — Menu cashier
5. Plan 5 — Cleanup manual opsional

---

## Checklist verifikasi setiap plan

```bash
npm run lint
npm run build
# Manual smoke test: login customer, staff admin/cashier/courier, buat pesanan, lacak, inbox
```
