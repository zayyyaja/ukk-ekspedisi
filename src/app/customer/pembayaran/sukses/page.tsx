"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";

export default function CustomerPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  return (
    <CustomerNavbarShell>
      <section className="content">
        <div className="mx-auto grid max-w-2xl gap-5 rounded-[28px] border border-emerald-100 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-600">
            ✓
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Pesanan Berhasil</h1>
            <p className="mt-2 text-slate-500">
              Pembayaran sedang diproses oleh Midtrans. Setelah status sukses, tunjukkan nomor resi ke cashier cabang untuk verifikasi paket.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {shipmentId ? (
              <Link className="button primary" href={`/customer/pesanan/${shipmentId}`}>
                Lihat Detail Pesanan
              </Link>
            ) : null}
            <Link className="button secondary" href="/customer/lacak-paket">
              Lihat Riwayat Paket
            </Link>
          </div>
        </div>
      </section>
    </CustomerNavbarShell>
  );
}
