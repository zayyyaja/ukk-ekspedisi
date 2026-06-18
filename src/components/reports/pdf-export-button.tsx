"use client";

import { Download } from "lucide-react";
import { useState } from "react";

type PdfExportButtonProps = {
  label: string;
  onExport: () => Promise<void> | void;
  loading?: boolean;
};

export function PdfExportButton({ label, onExport, loading = false }: PdfExportButtonProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setError("");
    setBusy(true);
    try {
      await onExport();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal membuat file PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-grid">
      <button
        className="button primary"
        disabled={loading || busy}
        onClick={handleClick}
        type="button"
      >
        <Download size={17} />
        {loading || busy ? "Membuat PDF..." : label}
      </button>
      {error && <div className="alert error">{error}</div>}
    </div>
  );
}
