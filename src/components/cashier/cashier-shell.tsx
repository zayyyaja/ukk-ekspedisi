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
    <div className="px-4 py-8 lg:px-10">
      {onSearch ? (
        <div className="mb-6 flex h-12 w-full max-w-xl items-center gap-3 rounded-2xl bg-slate-100 px-4 text-slate-500">
          <Search size={20} />
          <input
            className="w-full bg-transparent text-sm outline-none"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Cari resi, nama pelanggan, atau paket..."
            type="search"
            value={search ?? ""}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function CashierSettingsHint() {
  return (
    <div className="mt-8 flex items-center gap-3 rounded-lg bg-orange-50 p-4 text-orange-700">
      <Settings size={18} />
      Data dashboard diperbarui otomatis setiap 10 detik.
    </div>
  );
}
