"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Data tidak dapat dimuat saat ini.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="w-full border-4 border-slate-900 bg-red-50 p-8 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
      <div className="mx-auto flex min-h-55 max-w-md flex-col items-center justify-center text-center">
        
        {/* Lencana Indikator Gagal / Error Brutalist */}
        <div className="flex h-14 w-14 items-center justify-center border-2 border-slate-900 bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm animate-bounce">
          <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
        </div>

        {/* Blok Informasi Kerusakan Data */}
        <div className="mt-5 space-y-1.5">
          <h3 className="text-sm font-black uppercase tracking-wider text-red-900">
            [ ANOMALI SISTEM ] {title.toUpperCase()}
          </h3>
          <p className="text-2xs font-bold uppercase tracking-wide text-red-700/80 max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tombol Eksekusi Mitigasi / Reload */}
        {actionLabel && onAction ? (
          <div className="mt-6 w-full border-t-2 border-dashed border-slate-900/20 pt-5">
            <button
              onClick={onAction}
              type="button"
              className="
                inline-flex h-11 items-center justify-center gap-2 border-2 border-slate-900 
                bg-white px-5 text-2xs font-black uppercase tracking-wider text-slate-900 
                shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer
                hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
                active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
              "
            >
              <RefreshCw size={13} className="stroke-[2.5]" />
              {actionLabel.toUpperCase()}
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}