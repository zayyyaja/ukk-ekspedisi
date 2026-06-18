"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/auth-client";

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
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Ekspedisi Online</div>
        <h1 className="title">Verifikasi email</h1>
        <div className={`alert ${status === "failed" ? "error" : "success"}`}>
          {message}
        </div>
        {status === "success" && (
          <Link className="button primary" href="/customer/login">
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
        <main className="auth-shell">
          <section className="auth-card">Memuat verifikasi...</section>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
