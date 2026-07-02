"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      <section className="content">
        <div className="page-head">
          <div>
            <h1>Pembayaran Pesanan</h1>
            <p className="subtitle">Selesaikan pembayaran Midtrans sebelum menyerahkan paket ke cabang.</p>
          </div>
          {shipment ? <StatusBadge status={shipment.payments?.payment_status} /> : null}
        </div>

        {loading ? <div className="panel">Menyiapkan kode pembayaran Midtrans...</div> : null}
        {error ? <div className="alert error">{error}</div> : null}

        {shipment ? (
          <div className="grid two-col">
            <section className="panel">
              <h2>Ringkasan Pesanan</h2>
              <p><strong>No Resi:</strong> {shipment.tracking_number}</p>
              <p><strong>Total:</strong> {formatCurrency(shipment.total_price)}</p>
              <p><strong>Metode Paket:</strong> Drop off</p>
              <p><strong>Cabang Asal:</strong> {shipment.branches_shipments_origin_branch_idTobranches?.name}</p>
              <p><strong>Tujuan:</strong> {shipment.branches_shipments_destination_branch_idTobranches?.city}</p>
            </section>

            <section className="panel">
              <h2>Kode Pembayaran Midtrans</h2>
              {shipment.payments?.payment_status === "paid" ? (
                <div className="alert success">Pembayaran sudah berhasil.</div>
              ) : (
                <>
                  <p><strong>Order ID:</strong> {payment?.orderId ?? "-"}</p>
                  <p><strong>Snap Token:</strong> {payment?.snapToken ?? "-"}</p>
                  <p><strong>Metode:</strong> {paymentMethod}</p>
                  <div className="mt-5 grid gap-3">
                    {payment?.redirectUrl ? (
                      <a className="button primary" href={payment.redirectUrl}>
                        Buka Pembayaran Midtrans
                      </a>
                    ) : null}
                    <Link className="button secondary" href={`/customer/pesanan/${params.id}`}>
                      Lihat Detail Pesanan
                    </Link>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </CustomerNavbarShell>
  );
}
