import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1 className="title">404</h1>
        <p className="subtitle">Halaman Tidak Ditemukan</p>
        <Link className="button primary" href="/">
          Kembali
        </Link>
      </section>
    </main>
  );
}
