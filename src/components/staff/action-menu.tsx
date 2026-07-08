"use client";

import { Layers } from "lucide-react";

export function ActionMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-2.5 font-mono sm:flex-row sm:items-center">
      {/* Label Indikator Panel Aksi (Gaya Stempel Militer Kargo) */}
      <div className="flex h-9 items-center gap-2 border-2 border-slate-900 bg-slate-950 px-3 text-2xs font-black uppercase tracking-wider text-amber-400 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm shrink-0 md:inline-flex">
        <Layers size={12} className="stroke-[2.5]" />
        <span>[ DEK OPSI ]</span>
      </div>

      {/* Kontainer Tombol-Tombol Anak (Children) */}
      <div className="flex flex-1 flex-wrap items-center gap-2 border-2 border-dashed border-slate-900/30 p-1.5 rounded-sm bg-slate-50/50">
        {children}
      </div>
    </div>
  );
}