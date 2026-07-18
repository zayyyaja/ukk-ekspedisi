"use client";

import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="title">404</h1>
        <p className="subtitle">Halaman Tidak Ditemukan</p>
        <button
          className="button primary"
          onClick={() => router.back()}
          type="button"
        >
          Kembali
        </button>
      </section>
    </main>
  );
}
