"use client";

import type { CashierFilters } from "@/components/cashier/cashier-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { labels as statusLabels } from "@/components/status-badge";

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
      <Select value={filters.period || "custom"} onValueChange={(val) => patch({ period: val })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari Ini</SelectItem>
          <SelectItem value="yesterday">Kemarin</SelectItem>
          <SelectItem value="7d">7 Hari Terakhir</SelectItem>
          <SelectItem value="30d">30 Hari Terakhir</SelectItem>
          <SelectItem value="month">Bulan Ini</SelectItem>
          <SelectItem value="custom">Rentang khusus</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Metode Pembayaran */}
      <Select value={filters.paymentMethod || "all"} onValueChange={(val) => patch({ paymentMethod: val === "all" ? "" : val })}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Semua Metode Pembayaran" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Metode Pembayaran</SelectItem>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="qris">QRIS</SelectItem>
          <SelectItem value="gopay">GoPay</SelectItem>
          <SelectItem value="shopeepay">ShopeePay</SelectItem>
          <SelectItem value="bca_va">BCA VA</SelectItem>
          <SelectItem value="bni_va">BNI VA</SelectItem>
          <SelectItem value="bri_va">BRI VA</SelectItem>
          <SelectItem value="mandiri_va">Mandiri VA</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Kondisional untuk Tampilan Tabel */}
      {table ? (
        <>
          {/* Filter Status Manifes Paket */}
          <Select value={filters.shipmentStatus || "all"} onValueChange={(val) => patch({ shipmentStatus: val === "all" ? "" : val })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status Paket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status Paket</SelectItem>
              <SelectItem value="pending">{statusLabels["pending"]}</SelectItem>
              <SelectItem value="picked_up">{statusLabels["picked_up"]}</SelectItem>
              <SelectItem value="in_transit">{statusLabels["in_transit"]}</SelectItem>
              <SelectItem value="arrived_at_branch">{statusLabels["arrived_at_branch"]}</SelectItem>
              <SelectItem value="delivered">{statusLabels["delivered"]}</SelectItem>
              <SelectItem value="cancelled">{statusLabels["cancelled"]}</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Status Transaksi Keuangan */}
          <Select value={filters.paymentStatus || "all"} onValueChange={(val) => patch({ paymentStatus: val === "all" ? "" : val })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status Bayar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status Bayar</SelectItem>
              <SelectItem value="paid">{statusLabels["paid"]}</SelectItem>
              <SelectItem value="pending">{statusLabels["pending"]}</SelectItem>
              <SelectItem value="failed">{statusLabels["failed"]}</SelectItem>
            </SelectContent>
          </Select>
        </>
      ) : null}

      {/* Input Kalender Rentang Tanggal Kustom (Custom Range) */}
      {filters.period === "custom" ? (
        <>
          <input 
            className="h-11 rounded-2xl border border-border/60 bg-background/50 px-4 text-xs font-semibold text-ink shadow-sm outline-none transition-all focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary" 
            onChange={(event) => patch({ fromDate: event.target.value })} 
            type="date" 
            value={filters.fromDate} 
          />
          <input 
            className="h-11 rounded-2xl border border-border/60 bg-background/50 px-4 text-xs font-semibold text-ink shadow-sm outline-none transition-all focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary" 
            onChange={(event) => patch({ toDate: event.target.value })} 
            type="date" 
            value={filters.toDate} 
          />
        </>
      ) : null}
    </div>
  );
}