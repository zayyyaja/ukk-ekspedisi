"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="title">Terjadi Kesalahan</h1>
        <p className="subtitle">Aplikasi gagal memuat halaman ini.</p>
        <button className="button primary" onClick={reset} type="button">
          Coba Lagi
        </button>
      </section>
    </main>
  );
}
