"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreditCard, ArrowRight, ClipboardCheck, AlertTriangle, CheckCircle, ShieldAlert, MapPin, Package } from "lucide-react";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Shipment } from "@/types/customer-portal";

type MidtransPayment = {
  paymentId: number;
  snapToken?: string | null;
  redirectUrl?: string | null;
  orderId: string;
};

export default function CustomerPaymentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const requested = useRef(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [payment, setPayment] = useState<MidtransPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const paymentMethod = searchParams.get("method") || "qris";

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    async function preparePayment() {
      try {
        const shipmentResponse = await apiGet<Shipment>(`/api/v1/customer/shipments/${params.id}`);
        setShipment(shipmentResponse.data);

        if (shipmentResponse.data.payments?.payment_status === "paid") {
          return;
        }

        const paymentResponse = await apiPost<MidtransPayment>(
          `/api/v1/customer/shipments/${params.id}/payments/online`,
          { paymentMethod },
        );
        setPayment(paymentResponse.data);
      } catch (currentError) {
        setError(currentError instanceof Error ? currentError.message : "Gagal menyiapkan pembayaran.");
      } finally {
        setLoading(false);
      }
    }

    void preparePayment();
  }, [params.id, paymentMethod]);

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-5xl font-mono select-none pb-12">
        {/* Header Section */}
        <header className="mb-8 border-b-4 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xs font-black uppercase tracking-[0.2em] text-amber-600">// GATEWAY_VERIFICATION</p>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-wide text-slate-900">PEMBAYARAN PESANAN</h1>
            <p className="mt-1 text-xs font-bold text-slate-500">Selesaikan otorisasi finansial Midtrans untuk mengaktifkan resi kargo.</p>
          </div>
          {shipment && (
            <div className="self-start sm:self-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] p-1 bg-white rounded-sm">
              <StatusBadge status={shipment.payments?.payment_status} />
            </div>
          )}
        </header>

        {/* Loading State */}
        {loading && (
          <div className="mb-8 border-4 border-slate-900 bg-amber-50 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm flex items-center gap-3">
            <div className="h-5 w-5 animate-spin border-3 border-slate-950 border-t-transparent rounded-full" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-950">[ NET_REQUEST ]: MENYIAPKAN GATEWAY MIDTRANS...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 border-4 border-slate-900 bg-rose-100 p-4 text-xs font-black uppercase tracking-wider text-rose-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>[ SYSTEM_CRITICAL ]: {error}</span>
          </div>
        )}

        {shipment && (
          <div className="grid gap-8 md:grid-cols-12 items-start">
            
            {/* KIRI: Ringkasan Manifes Pesanan (7 Kolom) */}
            <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm md:col-span-7">
              <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-900 text-white rounded-sm">
                  <ClipboardCheck size={16} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">RINGKASAN_MANIFES</h2>
              </div>

              <div className="space-y-4 text-2xs font-bold uppercase tracking-wide">
                <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 pb-2 gap-1">
                  <span className="text-slate-400">NOMOR RESI LOGISTIK</span>
                  <span className="font-black text-slate-900 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-xs">
                    {shipment.tracking_number || "[ MENUNGGU_PEMBAYARAN ]"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">METODE PENYERAHAN</span>
                  <span className="font-black text-slate-900 flex items-center gap-1">
                    <Package size={12} /> DROP OFF
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 bg-slate-50 p-3 border-2 border-slate-900 rounded-sm my-2">
                  <div className="space-y-1">
                    <p className="text-3xs font-black text-slate-400">// CABANG ASAL (ORIGIN)</p>
                    <p className="font-black text-slate-900 text-3xs truncate">
                      {shipment.branches_shipments_origin_branch_idTobranches?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xs font-black text-slate-400">// KOTA TUJUAN (DESTINATION)</p>
                    <p className="font-black text-slate-900 text-3xs flex items-center gap-1">
                      <MapPin size={10} className="text-amber-500" />
                      {shipment.branches_shipments_destination_branch_idTobranches?.city || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-baseline bg-slate-900 text-white p-4 border-2 border-slate-900 rounded-sm">
                  <span className="text-3xs font-black text-amber-400 tracking-widest">AGREGAT BILLING:</span>
                  <span className="text-xl font-black text-white tracking-tight">
                    {formatCurrency(shipment.total_price)}
                  </span>
                </div>
              </div>
            </section>

            {/* KANAN: Terminal Otorisasi Token Midtrans (5 Kolom) */}
            <section className="border-4 border-slate-900 bg-white shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm md:col-span-5 overflow-hidden">
              <div className="bg-slate-900 px-5 py-3 text-white flex items-center gap-2">
                <CreditCard size={14} className="text-amber-400" />
                <h3 className="text-3xs font-black uppercase tracking-widest">// MIDTRANS_CONSOLE</h3>
              </div>

              <div className="p-5">
                {shipment.payments?.payment_status === "paid" ? (
                  <div className="border-2 border-emerald-900 bg-emerald-50 p-4 text-center rounded-sm space-y-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center border-2 border-emerald-900 bg-emerald-400 text-emerald-950 rounded-full">
                      <CheckCircle size={20} className="stroke-[2.5]" />
                    </div>
                    <p className="text-2xs font-black uppercase text-emerald-950 tracking-wider">PEMBAYARAN DIVERIFIKASI</p>
                    <p className="text-3xs font-bold text-emerald-700 uppercase leading-normal">
                      Sistem telah mengonfirmasi dana masuk. Silakan serahkan muatan barang Anda ke loket cabang.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 text-3xs font-bold uppercase text-slate-600 bg-slate-50 p-3 border-2 border-slate-200 rounded-sm">
                      <div className="flex justify-between">
                        <span>ORDER ID:</span>
                        <span className="font-black text-slate-900 break-all">{payment?.orderId ?? "-"}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                        <span>SNAP TOKEN:</span>
                        <span className="font-black text-slate-900 truncate max-w-[160px]" title={payment?.snapToken ?? undefined}>
                          {payment?.snapToken ?? "-"}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                        <span>METODE PILIHAN:</span>
                        <span className="font-black bg-amber-400 text-slate-950 px-1 py-0.5 rounded-xs tracking-widest">
                          {paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      {payment?.redirectUrl && (
                        <a 
                          href={payment.redirectUrl}
                          className="flex h-11 w-full items-center justify-center gap-2 border-2 border-slate-950 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
                        >
                          BUKA GERBANG MIDTRANS
                          <ArrowRight size={14} className="stroke-[2.5]" />
                        </a>
                      )}

                      <Link 
                        href={`/customer/pesanan/${params.id}`}
                        className="flex h-11 w-full items-center justify-center border-2 border-slate-900 bg-white font-black text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
                      >
                        MANIFES DETAIL
                      </Link>
                    </div>

                    <div className="flex gap-2 border border-slate-200 p-2.5 rounded-xs bg-amber-50/30">
                      <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold uppercase text-slate-500 leading-normal">
                        Sistem mendeteksi enkripsi otomatis. Jangan menutup halaman atau menyegarkan browser saat proses transfer token berlangsung.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </CustomerNavbarShell>
  );
}