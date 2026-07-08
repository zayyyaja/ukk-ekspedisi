"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/auth-client";
import { Loader2, Package2, ShieldAlert, ShieldCheck } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email berhasil diverifikasi.");
      })
      .catch((error) => {
        setStatus("failed");
        setMessage(error instanceof Error ? error.message : "Verifikasi gagal.");
      });
  }, [token]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 font-mono select-none p-4">
      {/* Pola Grid Latar Belakang */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

      <section className="relative z-10 w-full max-w-md border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm">
        
        {/* Header Branding */}
        <div className="mb-6 flex items-center gap-2 border-b-2 border-slate-900 pb-4">
          <div className="border-2 border-slate-900 bg-amber-400 p-1 rounded-sm">
            <Package2 size={18} className="text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-3xs font-black uppercase tracking-[0.2em] text-slate-400">ANTERIN // LOGISTIK</div>
            <div className="text-2xs font-black uppercase text-slate-900 tracking-wide">TERMINAL_OTORISASI</div>
          </div>
        </div>

        <h1 className="mb-4 text-lg font-black text-slate-900 uppercase tracking-wide">
          [ STATUS_VERIFIKASI_EMAIL ]
        </h1>
        
        {/* STATUS: VERIFYING */}
        {status === "verifying" && (
          <div className="mb-6 flex items-center gap-3 border-2 border-slate-900 bg-amber-50 p-4 text-3xs font-black uppercase tracking-wider text-amber-950 rounded-sm">
            <Loader2 className="h-4 w-4 animate-spin text-slate-950 stroke-[2.5]" />
            <p>// {message}</p>
          </div>
        )}

        {/* STATUS: FAILED */}
        {status === "failed" && (
          <div className="mb-6 flex items-start gap-3 border-2 border-slate-900 bg-rose-100 p-4 text-3xs font-black uppercase tracking-wider text-rose-950 rounded-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 stroke-[2.5]" />
            <div>
              <p className="text-rose-600">[ LOG_ERROR ]</p>
              <p className="mt-1 normal-case font-bold text-slate-700">{message}</p>
            </div>
          </div>
        )}

        {/* STATUS: SUCCESS */}
        {status === "success" && (
          <div className="mb-6 flex items-start gap-3 border-2 border-slate-900 bg-emerald-50 p-4 text-3xs font-black uppercase tracking-wider text-emerald-950 rounded-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <div>
              <p className="text-emerald-600">[ LOG_SUCCESS ]</p>
              <p className="mt-1 text-slate-900">{message}</p>
            </div>
          </div>
        )}

        {/* ACTION BUTTON JIKA SUKSES */}
        {status === "success" && (
          <Link 
            className="flex h-11 w-full items-center justify-center bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer" 
            href="/customer/login"
          >
            MASUK TERMINAL LOGIN
          </Link>
        )}

        {/* ACTION BUTTON JIKA GAGAL UNTUK REGISTRASI ULANG */}
        {status === "failed" && (
          <Link 
            className="flex h-11 w-full items-center justify-center bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)] hover:-translate-x-[1px] hover:-translate-y-[1px] text-2xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer" 
            href="/customer/register"
          >
            KEMBALI KE REGISTRASI
          </Link>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center bg-slate-50 font-mono select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-sm">
            <Loader2 className="h-8 w-8 animate-spin text-slate-950 stroke-[2.5]" />
            <p className="text-3xs font-black tracking-[0.2em] text-slate-900 uppercase animate-pulse">
              // MEMUAT_MANIFES_OTORISASI...
            </p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}