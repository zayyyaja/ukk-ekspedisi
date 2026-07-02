# Task List - Phase System Update V3

- [x] Core Database Rules & Transitions Updates
  - [x] Update `src/lib/shipment-scope.ts` visibility status scopes
  - [x] Update `src/services/shipment.service.ts` validations & workflow sequence
  - [x] Standardize tracking log details in `src/services/shipment.service.ts`
  - [x] Update `src/repositories/cashier.repository.ts` confirm log description
  - [x] Add payment status checks to `src/services/cashier.service.ts`
  - [x] Update `getCashierReports` in `src/services/cashier.service.ts` to support daily & monthly charts
- [x] Staff Portal UI Updates
  - [x] Add QueryClientProvider to `src/components/staff/staff-layout-client.tsx`
  - [x] Redefine `useApiData` using TanStack Query in `src/components/staff/staff-pages.tsx`
  - [x] Add specific role action buttons inside `ShipmentsPage` in `src/components/staff/staff-pages.tsx`
  - [x] Update `src/app/staff/cashier/laporan/page.tsx` with daily/monthly chart views and PDF report contents
- [x] Customer Portal UI Updates
  - [x] Update customer navbar labels in `src/components/customer/customer-navbar-shell.tsx`
  - [x] Add query polling and billing info / payment action buttons in `src/app/customer/lacak-paket/page.tsx`
  - [x] Update timeline and billing buttons in `src/app/customer/pesanan/[id]/page.tsx`
- [x] Verification and Walkthrough
  - [x] Run typescript builds to verify correctness
  - [x] Document final walkthrough

## Final Walkthrough

1. Customer membuat pesanan dan menyelesaikan pembayaran.
2. Kasir cabang asal memvalidasi resi; paket berubah dari `pending` menjadi `picked_up`.
3. Admin cabang asal memilih **Konfirmasi Keberangkatan**; paket berubah menjadi `in_transit` dan otomatis terlihat di admin cabang tujuan.
4. Admin cabang tujuan memasukkan nomor resi melalui **Konfirmasi Kedatangan**; paket berubah menjadi `arrived_at_branch`.
5. Admin cabang tujuan memilih **Assign Courier** untuk menugaskan kurir dari cabang yang sama.
6. Kurir memilih **Mulai Pengiriman**, lalu **Konfirmasi Terkirim** saat paket sampai; status berakhir sebagai `delivered`.
7. Portal pelanggan dan staf memperbarui data setiap 4 detik, sedangkan timeline pelanggan mengikuti log tracking aktual.
8. Aplikasi dijalankan di port `3000` melalui `npm run dev` atau `npm run start`.
