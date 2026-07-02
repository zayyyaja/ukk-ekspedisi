"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#fff0e5] p-4">
      <section className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-8 shadow-xl shadow-orange-900/5">
        <div className="mb-6 flex items-center gap-3 font-bold text-slate-900 text-lg">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          Ekspedisi Online
        </div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Verifikasi email</h1>
        
        {status === "verifying" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm font-medium text-orange-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>{message}</p>
          </div>
        )}
        {status === "failed" && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {message}
          </div>
        )}
        {status === "success" && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {status === "success" && (
          <Link 
            className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600" 
            href="/customer/login"
          >
            Login sekarang
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
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#fff0e5]">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <p className="text-sm font-semibold tracking-widest text-orange-600 uppercase animate-pulse">
              Memuat verifikasi...
            </p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
