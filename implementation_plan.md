# Implementation Plan - Phase System Update V3: Branch Integrated Logistics

Implement system update based on current database structures, avoiding any new tables or columns. Integrate branch workflows (Cashier confirm, Origin departure, Destination arrival, Courier delivery) and visibility, tracking logs, payment actions, reports, and realtime updates.

## Proposed Changes

We will modify existing repository, service, helper, and page components to implement the new logistics rules, visibility boundaries, and actions.

---

### [Component 1] Core Logic & Database Rules

#### [MODIFY] [shipment-scope.ts](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/lib/shipment-scope.ts)
- Update visibility rules:
  - Cabang Asal: shows status `pending`, `picked_up`, `in_transit`, and `cancelled` for origin branch.
  - Cabang Tujuan: shows status `in_transit`, `arrived_at_branch`, `out_for_delivery`, and `delivered` for destination branch.
- Update `isShipmentVisibleToBranch` and `branchOperationalScope` helper functions to match these status lists.

#### [MODIFY] [shipment.service.ts](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/shipment.service.ts)
- In `assertTransitionAllowed`:
  - Enforce status progression sequence strictly (remove same-city shortcut to `out_for_delivery`): `picked_up` -> `in_transit` -> `arrived_at_branch` -> `out_for_delivery` -> `delivered`.
- In `assertRoleCanUpdateStatus`:
  - Ensure Admin Origin Branch can only transition `picked_up` to `in_transit`.
  - Ensure Admin Destination Branch can only transition `in_transit` to `arrived_at_branch`.
  - Ensure Courier can only transition `arrived_at_branch` to `out_for_delivery`, and `out_for_delivery` to `delivered`.
- In `buildTrackingDetails`:
  - Standardize status transition tracking locations and descriptions:
    - `in_transit`: location = Origin Branch name, description = `Paket diberangkatkan menuju ${destinationBranchName}.`
    - `arrived_at_branch`: location = Destination Branch name, description = `Paket telah tiba di ${destinationBranchName}.`
    - `out_for_delivery`: location = Destination Branch City, description = `Paket sedang diantar kurir.`
    - `delivered`: location = Alamat Penerima (from customer receiver address), description = `Paket berhasil diterima customer.`
- In `updateShipmentStatus`:
  - Pass the receiver address to `buildTrackingDetails` to log location correctly for `delivered`.
- In `receiveShipmentAtDestination`:
  - Log `location` as the destination branch name and `description` as `Paket telah tiba di ${destinationBranch.name}.`

#### [MODIFY] [cashier.service.ts](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/services/cashier.service.ts)
- In `getCashierReports`:
  - Calculate daily revenue list (`chartDaily` or `chart`) and monthly revenue list (`chartMonthly`) by grouping transactions.
- In `verifyCashierOrderByResi` & `confirmCashierOrder`:
  - Validate that payment status is `paid` before confirming the package. Throw descriptive error if not paid.

#### [MODIFY] [cashier.repository.ts](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/repositories/cashier.repository.ts)
- In `confirmCashierPackage`:
  - Change shipment tracking description to `"Paket telah diterima oleh petugas."` and location to cashier branch name.

---

### [Component 2] Staff Portal UI

#### [MODIFY] [staff-layout-client.tsx](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/staff-layout-client.tsx)
- Wrap layout in TanStack Query `QueryClientProvider` with `refetchInterval: 4000` to enable automatic realtime updates across all staff dashboards.

#### [MODIFY] [staff-pages.tsx](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/staff/staff-pages.tsx)
- Re-implement `useApiData` using TanStack Query `useQuery` with `refetchInterval` for real-time dashboard state.
- In `ShipmentsPage` action column, render specific workflow action buttons based on the user's role and shipment status:
  - Origin Admin -> `Konfirmasi Keberangkatan` (for `picked_up`)
  - Destination Admin -> `Konfirmasi Kedatangan` (for `in_transit`) & `Assign Courier` (for `arrived_at_branch`)
  - Courier -> `Mulai Pengiriman` (for `arrived_at_branch`) & `Konfirmasi Terkirim` (for `out_for_delivery`)

#### [MODIFY] [laporan/page.tsx](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/staff/cashier/laporan/page.tsx)
- Display Daily and Monthly revenue charts using Tab view or side-by-side components.
- Standardize the jsPDF report to include the total income, number of transactions, daily chart summaries, and monthly chart summaries.

---

### [Component 3] Customer Portal UI

#### [MODIFY] [page.tsx (Lacak Paket)](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/lacak-paket/page.tsx)
- Enable TanStack Query background refetch polling (`refetchInterval: 4000`) for real-time tracking list.
- Display "Total Pesanan" and "Total Transaksi" (total value of paid orders formatted as currency) in the dashboard summary.
- Add payment action buttons: "Bayar Sekarang" for pending payments, "Coba Bayar Lagi" for failed payments, and "Download Resi" for paid payments.

#### [MODIFY] [page.tsx (Detail Pesanan)](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/app/customer/pesanan/%5Bid%5D/page.tsx)
- Enable background refetch polling (`refetchInterval: 4000`) for real-time status.
- Render the `TrackingTimeline` by listing chronological records mapped *directly* from `shipment.shipment_trackings` (instead of mapping hardcoded status steps).
- Align button layouts to display "Bayar Sekarang", "Coba Bayar Lagi", and "Download Resi" exactly as requested.

#### [MODIFY] [customer-navbar-shell.tsx](file:///c:/Users/PC%20BAZMA%206/Documents/Iqbal-XII/SaaS/TASK/Ekspedisi/src/components/customer/customer-navbar-shell.tsx)
- Update navigation menu labels to display "Cari Paket" and "Profil" exactly.

---

## Verification Plan

### Automated Verification
- Run Next.js build command to ensure no typescript/eslint compile errors:
  `npm run build`

### Manual Verification
1. Register/Login as Customer:
   - Create a shipment, check the billing status ("Bayar Sekarang").
   - Click "Bayar Sekarang", simulate payment to "paid".
   - Check that "Download Resi" button is visible and active.
2. Login as Cashier:
   - Verify that shipments only show up on cashier list when payment is `paid`.
   - Confirm the package with the correct tracking number. Check that status moves to `picked_up` and creates a tracking log.
3. Login as Admin:
   - Verify that `picked_up` shipment is visible to origin branch admin.
   - Perform "Konfirmasi Keberangkatan" (Origin Admin). Check status changes to `in_transit` and log created.
   - Verify that shipment now appears on destination branch admin's dashboard.
   - Perform "Konfirmasi Kedatangan" (Destination Admin). Check status changes to `arrived_at_branch` and log created.
   - Assign Courier (Destination Admin).
4. Login as Courier:
   - Verify assigned shipments are visible.
   - Perform "Mulai Pengiriman" (Courier). Check status changes to `out_for_delivery` and log created.
   - Perform "Konfirmasi Terkirim" (Courier). Check status changes to `delivered` and log created.
5. Verification of Customer Timeline:
   - Check that the customer can view the entire chronological timeline matching the tracking records in real-time.
6. Verification of Reports:
   - Access the reports page, verify that both Daily and Monthly charts render properly.
   - Export PDF and verify metrics.
