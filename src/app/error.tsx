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
      <body className="m-0 bg-slate-100 font-mono text-slate-900 antialiased select-none">
        <main className="flex min-h-screen w-screen items-center justify-center p-4 sm:p-6">
          {/* Kartu Komando Utama Kerusakan Sistem */}
          <section className="w-full max-w-lg border-4 border-slate-900 bg-rose-100 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-md sm:p-8">
            
            {/* Header Alarm Bahaya */}
            <div className="mb-5 flex items-center gap-3.5 border-b-4 border-slate-900 pb-4 text-rose-950">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-slate-900 bg-white text-rose-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm animate-bounce">
                <AlertOctagon className="stroke-3" size={24} />
              </div>
              <div>
                <span className="block text-[10px] font-black tracking-widest text-rose-700 uppercase">
                  [ CRITICAL SYSTEM FATAL_ERR ]
                </span>
                <h1 className="text-base font-black uppercase tracking-tight sm:text-lg">
                  Terjadi Kesalahan!
                </h1>
              </div>
            </div>

            {/* Deskripsi & Manifes Log Kesalahan */}
            <div className="space-y-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-rose-950/90 leading-relaxed">
                Aplikasi atau transmisi pipa data kargo gagal memuat sub-halaman ini secara sempurna. Enkripsi atau manifes komponen mengalami interupsi mendadak.
              </p>

              {/* Box Log Teknikal Otomatis (Jika ada kode Digest Error dari Next.js) */}
              <div className="border-2 border-slate-900 bg-white p-3 font-mono text-3xs font-black uppercase text-slate-800 rounded-sm">
                <div className="text-rose-600 mb-1 flex items-center gap-1">
                  <Terminal size={10} className="stroke-[2.5]" />
                  <span>CORE_LOG: RUNTIME_RENDER_FAILED</span>
                </div>
                <div className="break-all font-mono tracking-wide text-slate-600">
                  ID_DIGEST: {error?.digest ?? "NO_DIGEST_HASH_DETECTED"}
                </div>
                {error?.message && (
                  <div className="mt-1 truncate text-slate-500">// MSG: {error.message}</div>
                )}
              </div>
            </div>

            {/* Tombol Evakuasi - Muat Ulang Pipeline */}
            <div className="mt-6">
              <button
                className="
                  inline-flex h-12 w-full items-center justify-center gap-2.5 border-2 border-slate-900 
                  bg-amber-400 text-2xs font-black uppercase tracking-wider text-slate-950 
                  shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer 
                  hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] 
                  active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
                "
                onClick={reset}
                type="button"
              >
                <RefreshCw size={14} className="stroke-3 animate-spin-[spin_3s_linear_infinite]" />
                MUAT ULANG PIPELINE DATA (COBA LAGI)
              </button>
            </div>

          </section>
        </main>
      </body>
    </html>
  );
}