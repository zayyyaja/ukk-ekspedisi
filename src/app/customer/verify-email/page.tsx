"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/auth-client";
import { Loader2, Package2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <main className="relative flex min-h-screen items-center justify-center bg-background font-body select-none p-6">
      {/* Neo-Minimalist Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <section className="relative z-10 w-full max-w-md border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] rounded-3xl p-8 text-center">
        
        {/* Header Branding */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary/10 rounded-2xl mb-6">
          <Package2 className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold leading-tight text-ink tracking-tight mb-8">
          Verification Status
        </h1>
        
        {/* STATUS: VERIFYING */}
        {status === "verifying" && (
          <div className="mb-8 flex flex-col items-center justify-center p-6 border border-border/60 bg-slate-50/50 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-ink">{message}</p>
          </div>
        )}

        {/* STATUS: FAILED */}
        {status === "failed" && (
          <div className="mb-8 flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-2xl">
            <ShieldAlert className="h-10 w-10 text-destructive mb-4" />
            <p className="text-base font-semibold text-destructive mb-1">Verification Failed</p>
            <p className="text-sm text-destructive/80 font-medium">{message}</p>
          </div>
        )}

        {/* STATUS: SUCCESS */}
        {status === "success" && (
          <div className="mb-8 flex flex-col items-center justify-center p-6 border border-emerald-500/20 bg-emerald-50 rounded-2xl">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
            <p className="text-base font-semibold text-emerald-600 mb-1">Verification Successful</p>
            <p className="text-sm text-emerald-600/80 font-medium">{message}</p>
          </div>
        )}

        {/* ACTION BUTTON JIKA SUKSES */}
        {status === "success" && (
          <Button asChild size="lg" className="w-full">
            <Link href="/customer/login">
              Continue to Login
            </Link>
          </Button>
        )}

        {/* ACTION BUTTON JIKA GAGAL UNTUK REGISTRASI ULANG */}
        {status === "failed" && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/customer/register">
              Return to Registration
            </Link>
          </Button>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center bg-background font-body select-none px-4">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/5 blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 border border-border/50 bg-surface/80 backdrop-blur-xl p-12 shadow-[0_20px_60px_rgb(0,0,0,0.08)] rounded-3xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted animate-pulse">
              Loading...
            </p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}