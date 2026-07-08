"use client";

import { Terminal } from "lucide-react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-4 border-4 border-slate-900 bg-slate-950 p-6 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-center sm:justify-between">
      {/* Sisi Kiri: Informasi Judul & Sub-judul Dokumen */}
      <div className="flex items-start gap-3.5">
        {/* Lencana Sektor Terminal */}
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-slate-800 bg-slate-900 text-amber-400 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] rounded-sm">
          <Terminal size={18} className="stroke-[2.5]" />
        </div>
        <div>
          <span className="block text-[9px] font-black uppercase tracking-widest text-amber-500">
            [ SEKTOR UTAMA SISTEM ]
          </span>
          <h1 className="text-base font-black uppercase tracking-tight text-white sm:text-lg">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-2xs font-bold uppercase tracking-wide text-slate-400 leading-relaxed max-w-xl">
              // {description}
            </p>
          )}
        </div>
      </div>

      {/* Sisi Kanan: Area Tombol Aksi Tambahan (Jika Ada) */}
      {action && (
        <div className="flex shrink-0 items-center border-t-2 border-dashed border-slate-800 pt-4 sm:border-t-0 sm:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}