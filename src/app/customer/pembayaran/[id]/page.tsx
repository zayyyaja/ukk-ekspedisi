"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreditCard, ArrowRight, ClipboardCheck, AlertTriangle, CheckCircle, ShieldAlert, MapPin, Package } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Shipment } from "@/types/customer-portal";
import { BentoHeader } from "@/components/customer/bento-header";

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
        const shipmentResponse = await apiGet<Shipment>(`/api/v2/customer/shipments/${params.id}`);
        setShipment(shipmentResponse.data);

        if (shipmentResponse.data.payments?.payment_status === "paid") {
          return;
        }

        const paymentResponse = await apiPost<MidtransPayment>(
          `/api/v2/customer/shipments/${params.id}/payments/online`,
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
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>
      <div className="mx-auto max-w-5xl font-body pb-16 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Order Payment</h1>
            <p className="mt-2 text-sm font-medium text-muted">Complete the payment to activate the logistics receipt.</p>
          </div>
          {shipment && (
            <div className="self-start sm:self-center bg-surface/50 backdrop-blur-md border border-border/60 shadow-sm p-1.5 rounded-xl">
              <StatusBadge status={shipment.payments?.payment_status} />
            </div>
          )}
        </header>

        {/* Loading State */}
        {loading && (
          <div className="mb-8 border border-primary/20 bg-primary/5 p-6 shadow-sm rounded-xl flex items-center gap-3">
            <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-sm font-medium text-primary">Menyiapkan pembayaran Midtrans...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive shadow-sm rounded-xl flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {shipment && (
          <div className="grid gap-8 md:grid-cols-12 items-start">
            
            {/* KIRI: Ringkasan Manifes Pesanan (7 Kolom) */}
            <section className="border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl md:col-span-7">
              <div className="mb-8 flex items-center gap-4 border-b border-border/60 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary rounded-xl">
                  <ClipboardCheck size={20} />
                </div>
                <h2 className="text-lg font-semibold text-ink">Order Summary</h2>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between border-b border-border/60 pb-4 gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted mt-1">Logistics Tracking Number</span>
                  <span className="font-semibold text-sm text-ink bg-background/50 px-3 py-1.5 rounded-lg border border-border/60 shadow-sm">
                    {shipment.tracking_number || "Waiting for Payment"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-border/60 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted mt-1">Handover Method</span>
                  <span className="font-semibold text-sm text-ink flex items-center gap-2">
                    <Package size={16} /> Drop Off
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 bg-background/50 p-6 border border-border/60 rounded-2xl my-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Origin Branch</p>
                    <p className="font-semibold text-base text-ink truncate">
                      {shipment.branches_shipments_origin_branch_idTobranches?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Destination City</p>
                    <p className="font-semibold text-base text-ink flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      {shipment.branches_shipments_destination_branch_idTobranches?.city || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center bg-slate-950 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <CreditCard size={64} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-tight text-slate-400 relative z-10">Total Bill:</span>
                  <span className="text-3xl font-semibold tracking-tight text-white relative z-10 drop-shadow-sm">
                    {formatCurrency(shipment.total_price)}
                  </span>
                </div>
              </div>
            </section>

            {/* KANAN: Terminal Otorisasi Token Midtrans (5 Kolom) */}
            <section className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl md:col-span-5 overflow-hidden flex flex-col">
              <div className="bg-background/50 px-8 py-5 border-b border-border/60 flex items-center gap-4">
                <CreditCard size={20} className="text-primary" />
                <h3 className="text-base font-semibold text-ink">Payment Method</h3>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                {shipment.payments?.payment_status === "paid" ? (
                  <div className="border border-green-500/20 bg-green-500/10 p-8 text-center rounded-2xl space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center bg-green-500/20 text-green-700 rounded-full shadow-sm">
                      <CheckCircle size={32} />
                    </div>
                    <p className="text-base font-semibold text-green-800">Payment Complete</p>
                    <p className="text-sm font-medium text-green-700 leading-relaxed">
                      The system has confirmed your payment. Please drop off your cargo at the branch counter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 h-full flex flex-col">
                    <div className="space-y-4 text-xs font-medium text-muted bg-background/50 p-6 border border-border/60 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider font-semibold">Order ID:</span>
                        <span className="font-semibold text-ink break-all ml-4 text-right">{payment?.orderId ?? "-"}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/60 pt-4">
                        <span className="uppercase tracking-wider font-semibold">Snap Token:</span>
                        <span className="font-semibold text-ink truncate max-w-[140px] ml-4 text-right" title={payment?.snapToken ?? undefined}>
                          {payment?.snapToken ?? "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border/60 pt-4">
                        <span className="uppercase tracking-wider font-semibold">Method:</span>
                        <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-lg uppercase tracking-tight text-[10px]">
                          {paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-4 flex-1 flex flex-col justify-end">
                      {payment?.redirectUrl && (
                        <a 
                          href={payment.redirectUrl}
                          className="flex h-14 w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all hover:bg-primary/90 rounded-2xl"
                        >
                          Open Payment Page
                          <ArrowRight size={18} />
                        </a>
                      )}

                      <Link 
                        href={`/customer/pesanan/${params.id}`}
                        className="flex h-14 w-full items-center justify-center border border-border/60 bg-background/50 text-ink font-semibold text-sm transition-all hover:bg-slate-50 rounded-2xl"
                      >
                        View Order Details
                      </Link>
                    </div>

                    <div className="flex gap-3 p-5 rounded-2xl bg-amber-500/10 text-amber-700">
                      <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold leading-relaxed">
                        Do not close or refresh this page while the payment process is ongoing.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}