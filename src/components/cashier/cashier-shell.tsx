"use client";

import { Search, Settings, Plus, Barcode } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/staff/page-header";

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
      <div className="-mt-4 mb-2">
        <PageHeader />
      </div>
      {onSearch ? (
        /* Search Column */
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Search Column */}
          <div className="flex h-12 w-full max-w-xl items-center gap-3 rounded-2xl border border-border/40 bg-surface px-4 text-ink shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <Search size={18} className="shrink-0 text-primary/70" />
            <input
              className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Cari resi, nama pelanggan, atau item..."
              type="search"
              value={search ?? ""}
            />
          </div>
          
          {/* QUICK ACTIONS */}
          <div className="flex items-center gap-3">
            <Link href="/staff/cashier/tambah-pesanan" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Plus size={18} />
              Pesanan baru
            </Link>
          </div>
        </div>
  
      ) : null}
      
      {/* Main Content */}
      {children}
    </div>
  );
}

export function CashierSettingsHint() {
  return (
    /* Info Hint */
    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-xl p-4 text-xs font-medium text-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary/10 text-primary rounded-full">
        <Settings size={16} className="animate-[spin_4s_linear_infinite]" />
      </div>
      <span>
        Data dashboard diperbarui otomatis setiap 10 detik.
      </span>
    </div>
  );
}