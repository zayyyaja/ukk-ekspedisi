"use client";

import { Search, Settings } from "lucide-react";

export function CashierShell({
  children,
  search,
  onSearch,
}: {
  branchName?: string | null;
  children: React.ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
}) {
  return (
    <div className="px-4 py-8 lg:px-10 font-body">
      {onSearch ? (
        /* Kolom Pencarian Bergaya Manifes Kargo */
        <div className="mb-8 flex h-12 w-full max-w-xl items-center gap-3 border-2 border-ink bg-white px-4 text-ink rounded-app shadow-stamp-xs focus-within:-translate-x-px focus-within:-translate-y-px focus-within:shadow-stamp-sm transition-all">
          <Search size={18} className="stroke-[2.5] shrink-0" />
          <input
            className="w-full bg-transparent font-mono text-xs font-bold uppercase tracking-wide text-ink outline-none placeholder:text-steel/40"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="CARI RESI, NAMA PELANGGAN, ATAU ITEM..."
            type="search"
            value={search ?? ""}
          />
        </div>
      ) : null}
      
      {/* Konten Utama */}
      {children}
    </div>
  );
}

export function CashierSettingsHint() {
  return (
    /* Kotak Informasi Hint Bergaya Label Peringatan Mesin Logistik */
    <div className="mt-8 flex items-center gap-3 border-2 border-ink bg-amber-400 p-4 font-mono text-xs font-black uppercase tracking-wide text-ink rounded-app shadow-stamp-xs">
      <Settings size={16} className="stroke-[2.5] animate-[spin_4s_linear_infinite]" />
      <span>
        [SISTEM] DATA DASHBOARD DIPERBARUI OTOMATIS SETIAP 10 DETIK.
      </span>
    </div>
  );
}