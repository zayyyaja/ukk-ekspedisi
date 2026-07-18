"use client";

import { Layers } from "lucide-react";

export function ActionMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-3 font-body sm:flex-row sm:items-center">
      {/* Label Indikator Panel Aksi */}
      <div className="hidden h-9 items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted shrink-0 md:inline-flex">
        <Layers size={14} strokeWidth={1.5} />
        <span>Tindakan</span>
      </div>

      {/* Kontainer Tombol-Tombol Anak (Children) */}
      <div className="flex flex-1 flex-wrap items-center gap-2 border border-border/40 p-1.5 rounded-xl bg-surface/90 backdrop-blur-md shadow-sm">
        {children}
      </div>
    </div>
  );
}