"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Memuat data",
  rows = 3,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <div className="w-full border-4 border-slate-900 bg-slate-50 p-6 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
      <div className="space-y-5">
        
        {/* Status Loading dengan Spinner Kasar */}
        <div className="flex items-center gap-2.5 border-b-2 border-dashed border-slate-900 pb-3 text-xs font-black uppercase tracking-wider text-slate-900">
          <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
          <span>[ FETCHING ] {title.toUpperCase()}...</span>
        </div>
        
        {/* Baris Pembacaan Log (Skeleton Kustom Brutalist) */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 border-2 border-slate-900 bg-white p-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm animate-pulse"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Indikator Blok Kecil Depan */}
              <div className="h-3 w-6 bg-slate-900 shrink-0" />
              
              {/* Garis Baris Data Tiruan */}
              <div className="h-2 w-full bg-slate-200" />
              
              {/* Variasi Panjang Ujung Baris Biar Realistis */}
              <div className={`h-2 bg-slate-200 hidden sm:block`} style={{ width: `${(index % 3 + 1) * 20}%` }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}