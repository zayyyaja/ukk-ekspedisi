"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export function FilterBar({
  search,
  onSearch,
  children,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-4 border-4 border-slate-900 bg-amber-50/50 p-5 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md md:flex-row md:items-center">
      
      {/* Input Pencarian Utama Gaya Neo-Brutalist */}
      {onSearch && (
        <div className="relative flex flex-1 items-center">
          <div className="absolute left-3.5 text-slate-900 pointer-events-none">
            <Search size={16} className="stroke-[2.5]" />
          </div>
          <input
            className="
              h-12 w-full border-2 border-slate-900 bg-white pl-11 pr-4 
              text-xs font-black uppercase tracking-wider text-slate-900 
              shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all 
              placeholder:text-slate-400 focus:-translate-x-px 
              focus:-translate-y-px focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] 
              focus:outline-none rounded-sm
            "
            onChange={(event) => onSearch(event.target.value)}
            placeholder="[ CARI DATA MANIFES / RESI ]"
            value={search ?? ""}
          />
        </div>
      )}

      {/* Kontainer untuk Children Filter Tambahan (Jika ada) */}
      {children && (
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/20 pt-4 md:border-t-0 md:pt-0">
          {children}
        </div>
      )}
    </section>
  );
}