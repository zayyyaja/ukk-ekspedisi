"use client";

import type { CashierFilters } from "@/components/cashier/cashier-types";

export function CashierFiltersBar({
  filters,
  onChange,
  table = false,
}: {
  filters: CashierFilters;
  onChange: (filters: CashierFilters) => void;
  table?: boolean;
}) {
  function patch(next: Partial<CashierFilters>) {
    onChange({ ...filters, ...next, page: next.page ?? 1 });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter Periode Waktu */}
      <select 
        className="h-12 border-2 border-ink bg-paper px-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all cursor-pointer focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
        onChange={(event) => patch({ period: event.target.value })} 
        value={filters.period}
      >
        <option value="today">Hari Ini</option>
        <option value="yesterday">Kemarin</option>
        <option value="7d">7 Hari Terakhir</option>
        <option value="30d">30 Hari Terakhir</option>
        <option value="month">Bulan Ini</option>
        <option value="custom">Custom Range</option>
      </select>

      {/* Filter Metode Pembayaran */}
      <select 
        className="h-12 border-2 border-ink bg-paper px-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all cursor-pointer focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
        onChange={(event) => patch({ paymentMethod: event.target.value })} 
        value={filters.paymentMethod}
      >
        <option value="">Semua Metode Pembayaran</option>
        <option value="cash">Cash</option>
        <option value="qris">QRIS</option>
        <option value="gopay">GoPay</option>
        <option value="shopeepay">ShopeePay</option>
        <option value="bca_va">BCA VA</option>
        <option value="bni_va">BNI VA</option>
        <option value="bri_va">BRI VA</option>
        <option value="mandiri_va">Mandiri VA</option>
      </select>

      {/* Filter Kondisional untuk Tampilan Tabel */}
      {table ? (
        <>
          {/* Filter Status Manifes Paket */}
          <select 
            className="h-12 border-2 border-ink bg-paper px-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all cursor-pointer focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
            onChange={(event) => patch({ shipmentStatus: event.target.value })} 
            value={filters.shipmentStatus}
          >
            <option value="">Semua Status Paket</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived_at_branch">Arrived At Branch</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Filter Status Transaksi Keuangan */}
          <select 
            className="h-12 border-2 border-ink bg-paper px-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all cursor-pointer focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
            onChange={(event) => patch({ paymentStatus: event.target.value })} 
            value={filters.paymentStatus}
          >
            <option value="">Semua Status Bayar</option>
            <option value="paid">Pembayaran Berhasil</option>
            <option value="pending">Pembayaran Pending</option>
            <option value="failed">Pembayaran Gagal</option>
          </select>
        </>
      ) : null}

      {/* Input Kalender Rentang Tanggal Kustom (Custom Range) */}
      {filters.period === "custom" ? (
        <>
          <input 
            className="h-12 border-2 border-ink bg-paper px-4 font-mono text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
            onChange={(event) => patch({ fromDate: event.target.value })} 
            type="date" 
            value={filters.fromDate} 
          />
          <input 
            className="h-12 border-2 border-ink bg-paper px-4 font-mono text-xs font-bold uppercase tracking-wider text-ink outline-none rounded-app shadow-stamp-sm transition-all focus:shadow-stamp focus:-translate-x-px focus:-translate-y-px" 
            onChange={(event) => patch({ toDate: event.target.value })} 
            type="date" 
            value={filters.toDate} 
          />
        </>
      ) : null}
    </div>
  );
}