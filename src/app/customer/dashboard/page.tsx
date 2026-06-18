"use client";

import { CreditCard, PackagePlus, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { apiGet } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import { getDashboard, saveDashboard } from "@/lib/offline-dashboard";
import { saveShipments } from "@/lib/offline-shipments";
import type { Payment, Shipment } from "@/types/customer-portal";

export default function CustomerDashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) {
      getDashboard()
        .then((cached) => {
          if (cached) {
            setShipments(cached.data.shipments);
            setPayments(cached.data.payments);
            setOfflineMode(true);
          } else {
            setError("Belum ada dashboard tersimpan untuk mode offline.");
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    Promise.all([
      apiGet<Shipment[]>("/api/v1/customer/shipments?limit=100"),
      apiGet<Payment[]>("/api/v1/customer/payments?limit=100"),
    ])
      .then(([shipmentResponse, paymentResponse]) => {
        setShipments(shipmentResponse.data);
        setPayments(paymentResponse.data);
        const nextSummary = {
          total: shipmentResponse.data.length,
          pending: shipmentResponse.data.filter((shipment) => shipment.status === "pending").length,
          delivered: shipmentResponse.data.filter((shipment) => shipment.status === "delivered").length,
          unpaid: paymentResponse.data.filter((payment) => payment.payment_status === "pending").length,
        };
        void saveDashboard({
          shipments: shipmentResponse.data,
          payments: paymentResponse.data,
          summary: nextSummary,
        });
        void saveShipments(shipmentResponse.data);
        setOfflineMode(false);
      })
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat data."),
      )
      .finally(() => setLoading(false));
  }, [online]);

  const summary = useMemo(
    () => ({
      total: shipments.length,
      pending: shipments.filter((shipment) => shipment.status === "pending").length,
      delivered: shipments.filter((shipment) => shipment.status === "delivered").length,
      unpaid: payments.filter((payment) => payment.payment_status === "pending").length,
    }),
    [payments, shipments],
  );

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Dashboard customer</h1>
          <p className="subtitle">Ringkasan pengiriman dan pembayaran terbaru.</p>
          {offlineMode && <span className="badge pending">Offline Mode</span>}
        </div>
        <Link className="button primary" href="/customer/dashboard/shipments/create">
          <PackagePlus size={17} />
          Buat shipment
        </Link>
      </div>

      {loading && <div className="panel">Memuat dashboard...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid metrics">
            <article className="metric-card"><span>Total shipment</span><strong>{summary.total}</strong></article>
            <article className="metric-card"><span>Pending</span><strong>{summary.pending}</strong></article>
            <article className="metric-card"><span>Delivered</span><strong>{summary.delivered}</strong></article>
            <article className="metric-card"><span>Unpaid payment</span><strong>{summary.unpaid}</strong></article>
          </div>

          <div className="grid two-col">
            <section className="panel">
              <h2>Recent shipments</h2>
              {shipments.length === 0 ? (
                <p className="muted">Belum ada shipment.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>Resi</th><th>Tujuan</th><th>Status</th><th>Total</th></tr></thead>
                    <tbody>
                      {shipments.slice(0, 5).map((shipment) => (
                        <tr key={shipment.id}>
                          <td><Link href={`/customer/dashboard/shipments/${shipment.id}`}>{shipment.tracking_number}</Link></td>
                          <td>{shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-"}</td>
                          <td><StatusBadge status={shipment.status} /></td>
                          <td>{formatCurrency(shipment.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <h2>Quick action</h2>
              <div className="form-grid">
                <Link className="button secondary" href="/customer/dashboard/shipments/create"><Truck size={17} />Buat Shipment</Link>
                <Link className="button secondary" href="/customer/dashboard/tracking"><Search size={17} />Tracking Resi</Link>
                <Link className="button secondary" href="/customer/dashboard/payments"><CreditCard size={17} />Cek Payment</Link>
              </div>
            </section>
          </div>

          <section className="panel">
            <h2>Payment status</h2>
            {payments.length === 0 ? (
              <p className="muted">Belum ada pembayaran.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Resi</th><th>Metode</th><th>Status</th><th>Tanggal</th></tr></thead>
                  <tbody>
                    {payments.slice(0, 5).map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.shipments?.tracking_number ?? "-"}</td>
                        <td>{payment.payment_method}</td>
                        <td><StatusBadge status={payment.payment_status} /></td>
                        <td>{formatDate(payment.payment_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
