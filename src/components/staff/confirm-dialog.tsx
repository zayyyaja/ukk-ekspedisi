"use client";

import { AlertOctagon, X, Check } from "lucide-react";

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
      {/* Kotak Dialog Utama Gaya Neo-Brutalist / Kotak Kargo */}
      <section className="w-full max-w-md border-4 border-slate-900 bg-amber-400 p-6 font-mono shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-md animate-scale-in">
        
        {/* Header Protokol Konfirmasi */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-900 text-amber-400">
            <AlertOctagon size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-800">
              PROTOKOL OTORISASI
            </span>
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-900">
              {title}
            </h2>
          </div>
        </div>

        {/* Isi Deskripsi Peringatan */}
        <p className="my-5 text-2xs font-bold uppercase leading-relaxed tracking-wide text-slate-800 bg-amber-500/20 border-2 border-dashed border-amber-600/30 p-3 rounded-sm">
          {message}
        </p>

        {/* Baris Tombol Aksi Kaku */}
        <div className="grid grid-cols-2 gap-3 border-t-2 border-slate-900 pt-4">
          {/* Tombol Batal / Interupsi */}
          <button 
            className="
              inline-flex h-11 items-center justify-center gap-1.5 border-2 border-slate-900 
              bg-white text-2xs font-black uppercase tracking-wider text-slate-900 
              shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer
              hover:-translate-x-pxver:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
            " 
            onClick={onCancel} 
            type="button"
          >
            <X size={14} className="stroke-[2.5]" />
            BATAL
          </button>

          {/* Tombol Eksekusi / Konfirmasi */}
          <button 
            className="
              inline-flex h-11 items-center justify-center gap-1.5 border-2 border-slate-900 
              bg-red-500 text-2xs font-black uppercase tracking-wider text-white 
              shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer
              hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
            " 
            onClick={onConfirm} 
            type="button"
          >
            <Check size={14} className="stroke-[2.5]" />
            YA, LANJUTKAN
          </button>
        </div>

      </section>
    </div>
  );
}