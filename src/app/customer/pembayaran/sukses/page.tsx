"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, Package, Search } from "lucide-react";
import { BentoHeader } from "@/components/customer/bento-header";


export default function CustomerPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  return (
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>
      <div className="mx-auto max-w-2xl font-body py-12 px-4 sm:px-6">

        {/* Kontainer Utama Bergaya Neo Minimalist */}
        <div className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden relative">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/10 blur-[80px] pointer-events-none" />

          {/* Header Status Bar */}
          <div className="border-b border-border/60 bg-green-500/5 px-10 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-green-500 text-white rounded-2xl shadow-sm">
              <Check size={32} className="stroke-[3]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-green-700">Order Created Successfully</h1>
              <p className="mt-2 text-sm font-medium text-green-600/80">Payment is in verification process</p>
            </div>
          </div>

          {/* Isi Pesan Konten */}
          <div className="p-10 space-y-10 relative z-10">
            <div className="space-y-4">
              <p className="text-base text-muted leading-relaxed">
                Your payment is being processed and verified by the system.
                Once the status changes to <span className="font-bold text-green-700 bg-green-500/10 px-2 py-1 rounded-md tracking-tight">SUCCESS</span>,
                please show the receipt number to the destination branch officer to hand over your package.
              </p>
            </div>

            {/* Garis Pembatas */}
            <div className="border-t border-border/60" />

            {/* Tombol Aksi Navigasi */}
            <div className="flex flex-col sm:flex-row gap-4">
              {shipmentId && (
                <Link
                  href={`/customer/pesanan/${shipmentId}`}
                  className="flex flex-1 h-14 items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all hover:bg-primary/90 rounded-2xl"
                >
                  <Package size={20} />
                  Order Details
                  <ArrowRight size={18} />
                </Link>
              )}

              <Link
                href="/customer/lacak-resi"
                className="flex flex-1 h-14 items-center justify-center gap-2 border border-border/60 bg-background/50 text-ink font-semibold text-sm transition-all hover:bg-slate-50 rounded-2xl"
              >
                <Search size={20} />
                Order List
              </Link>
            </div>

          </div>

          {/* Footer Info */}
          <div className="bg-background/80 backdrop-blur-md px-10 py-5 border-t border-border/60 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted relative z-10">
            <span>Secure Transaction</span>
            <span>ID: {shipmentId ? `SHPMNT_${shipmentId}` : "UNKNOWN"}</span>
          </div>

        </div>

      </div>
    </div>
  );
}