"use client";

import { Download, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

type PdfExportButtonProps = {
  label: string;
  onExport: () => Promise<void> | void;
  loading?: boolean;
};

export function PdfExportButton({ label, onExport, loading = false }: PdfExportButtonProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isProcessing = loading || busy;

  async function handleClick() {
    setError("");
    setBusy(true);
    try {
      await onExport();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal menerbitkan manifes PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col w-full gap-3 font-mono">
      {/* Tombol Utama Gaya Neo-Brutalist / Industrial Kargo */}
      <button
        disabled={isProcessing}
        onClick={handleClick}
        type="button"
        className="
          relative flex h-12 w-full items-center justify-center gap-2.5 
          border-2 border-slate-900 bg-emerald-400 px-5 text-xs font-black 
          uppercase tracking-wider text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] 
          transition-all rounded-sm cursor-pointer
          hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]
          active:translate-x-0.75 active:translate-y-0.75 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
          disabled:pointer-events-none disabled:opacity-60 disabled:bg-slate-200 disabled:shadow-none
        "
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin stroke-[2.5]" />
            <span>[ COMPILING MANIFEST... ]</span>
          </>
        ) : (
          <>
            <Download size={16} className="stroke-[2.5]" />
            <span>{label.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Tampilan Alert Error Stempel Militer/Industrial */}
      {error && (
        <div className="
          flex items-start gap-2.5 border-2 border-slate-900 bg-red-100 p-3 
          text-2xs font-bold uppercase tracking-wide text-red-700 rounded-sm shadow-none
        ">
          <AlertTriangle size={15} className="shrink-0 stroke-[2.5] text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-black block text-red-900 mb-0.5">[ STATUS REJECTED ]</span>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}