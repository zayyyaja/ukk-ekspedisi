"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, Package, Search } from "lucide-react";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";

export default function CustomerPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-2xl font-mono select-none py-8">
        
        {/* Kontainer Utama Bergaya Tiket Kontainer Manifes */}
        <div className="border-4 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
          
          {/* Header Status Bar */}
          <div className="border-b-4 border-slate-900 bg-emerald-400 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-900 text-emerald-400 rounded-sm">
              <Check size={20} className="stroke-[3]" />
            </div>
            <div>
              <p className="text-3xs font-black uppercase tracking-[0.2em] text-slate-950">// TRANSACTION_AUTHORIZED</p>
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-950">PESANAN BERHASIL REGRISTRASI</h1>
            </div>
          </div>

          {/* Isi Pesan Konten */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-3xs font-black text-amber-600 uppercase tracking-widest">// NET_CALLBACK_STATUS_OK</p>
              <p className="text-xs font-bold text-slate-700 uppercase leading-relaxed">
                Pembayaran Anda sedang diproses dan diverifikasi secara berkala oleh jaringan Midtrans. 
                Setelah status berubah menjadi <span className="font-black bg-emerald-100 text-emerald-950 px-1">SUKSES</span>, 
                silakan tunjukkan nomor resi kargo ke cashier cabang tujuan untuk validasi fisik muatan paket Anda.
              </p>
            </div>

            {/* Garis Potong Manifes Kargo (Dashed Line Decorator) */}
            <div className="border-t-2 border-dashed border-slate-300 my-4" />

            {/* Tombol Aksi Navigasi */}
            <div className="flex flex-col sm:flex-row gap-4">
              {shipmentId && (
                <Link 
                  href={`/customer/pesanan/${shipmentId}`}
                  className="flex flex-1 h-12 items-center justify-center gap-2 border-2 border-slate-950 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
                >
                  <Package size={14} className="stroke-[2.5]" />
                  LIHAT DETAIL PESANAN
                  <ArrowRight size={12} />
                </Link>
              )}
              
              <Link 
                href="/customer/lacak-paket"
                className="flex flex-1 h-12 items-center justify-center gap-2 border-2 border-slate-900 bg-white font-black text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
              >
                <Search size={14} className="stroke-[2.5]" />
                LIHAT RIWAYAT PAKET
              </Link>
            </div>

          </div>

          {/* Footer Pengaman Mini */}
          <div className="bg-slate-50 px-6 py-2.5 border-t-2 border-slate-900 flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
            <span>SECURE GATEWAY ENCRYPTION</span>
            <span>ID: {shipmentId ? `SHPMNT_${shipmentId}` : "UNKNOWN_ID"}</span>
          </div>

        </div>

      </div>
    </CustomerNavbarShell>
  );
}