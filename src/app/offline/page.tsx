import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <WifiOff size={42} />
        <h1 className="title">Anda sedang offline</h1>
        <p className="subtitle">
          Beberapa fitur masih dapat digunakan menggunakan data terakhir yang
          tersimpan.
        </p>
        <div className="form-grid">
          <Link className="button primary" href="/">
            Coba Lagi
          </Link>
          <Link className="button secondary" href="/customer/dashboard">
            Buka dashboard terakhir
          </Link>
        </div>
      </section>
    </main>
  );
}
