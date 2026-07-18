"use client";

import { AlertOctagon } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
      <section className="w-full max-w-md border border-border/40 bg-surface p-6 font-body shadow-xl rounded-2xl animate-scale-in">
        
        {/* Header Konfirmasi */}
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-rose-100 text-rose-600 rounded-full">
            <AlertOctagon size={20} strokeWidth={1.5} />
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
              Konfirmasi Sistem
            </span>
            <h2 className="text-base font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>
        </div>

        {/* Isi Deskripsi Peringatan */}
        <p className="my-5 text-sm font-medium leading-relaxed text-muted bg-slate-50/50 border border-border/40 p-4 rounded-xl">
          {message}
        </p>

        {/* Baris Tombol Aksi */}
        <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-5">
          {/* Tombol Batal */}
          <button 
            className="
              inline-flex h-10 items-center justify-center gap-2 border border-border/40 
              bg-surface text-xs font-semibold tracking-tight text-ink 
              shadow-sm transition-colors rounded-xl cursor-pointer
              hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
            " 
            onClick={onCancel} 
            type="button"
          >
            Batal
          </button>

          {/* Tombol Eksekusi / Konfirmasi */}
          <button 
            className="
              inline-flex h-10 items-center justify-center gap-2 border border-transparent 
              bg-rose-600 text-xs font-semibold tracking-tight text-white 
              shadow-sm transition-colors rounded-xl cursor-pointer
              hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1
            " 
            onClick={onConfirm} 
            type="button"
          >
            Lanjutkan
          </button>
        </div>

      </section>
    </div>
  );
}