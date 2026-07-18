"use client";

import { AlertOctagon, RefreshCw, Terminal } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="m-0 bg-background font-body text-ink antialiased">
        <main className="flex min-h-screen w-screen items-center justify-center p-4 sm:p-6">
          <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
            
            <div className="mb-5 flex items-center gap-4 border-b border-red-200 pb-5 text-red-900">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm border border-red-100">
                <AlertOctagon size={24} />
              </div>
              <div>
                <span className="block text-xs font-semibold tracking-tight text-red-700">
                  SYSTEM ERROR
                </span>
                <h1 className="text-lg font-bold tracking-tight">
                  Terjadi Kesalahan!
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-red-800/80 leading-relaxed">
                Aplikasi gagal memuat halaman ini secara sempurna. Proses render atau pengambilan data mengalami interupsi mendadak.
              </p>

              <div className="rounded-xl border border-red-200 bg-white p-4 text-xs text-red-900 shadow-sm">
                <div className="mb-2 flex items-center gap-1.5 font-semibold text-red-700">
                  <Terminal size={14} />
                  <span>RUNTIME_RENDER_FAILED</span>
                </div>
                <div className="break-all font-mono text-[11px] text-red-800/70">
                  ID: {error?.digest ?? "NO_DIGEST_DETECTED"}
                </div>
                {error?.message && (
                  <div className="mt-1.5 truncate font-mono text-[11px] text-red-800/70">
                    // {error.message}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                className="
                  inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 
                  bg-white text-sm font-semibold text-red-900 
                  shadow-sm transition-colors cursor-pointer 
                  hover:bg-red-50 active:bg-red-100
                "
                onClick={reset}
                type="button"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>

          </section>
        </main>
      </body>
    </html>
  );
}