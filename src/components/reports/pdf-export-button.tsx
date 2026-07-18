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
    <div className="flex w-full flex-col gap-2">
      {/* Primary Action Button */}
      <button
        disabled={isProcessing}
        onClick={handleClick}
        type="button"
        className="
          inline-flex h-10 w-full items-center justify-center gap-2 
          rounded-xl bg-primary px-4 text-sm font-medium tracking-tight text-primary-foreground 
          shadow-sm transition-all duration-200 cursor-pointer border border-transparent
          hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
          disabled:pointer-events-none disabled:opacity-50
        "
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            <span>Menyusun Dokumen...</span>
          </>
        ) : (
          <>
            <Download size={16} strokeWidth={2} />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Error Alert */}
      {error && (
        <div className="
          flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 
          text-sm font-medium text-rose-600 shadow-sm
        ">
          <AlertTriangle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <div className="flex-1 leading-snug">
            <span className="mb-0.5 block font-semibold text-rose-700">Gagal Mengunduh</span>
            <span className="text-rose-600/90 text-[11px]">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}