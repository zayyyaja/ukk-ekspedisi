"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import type { Shipment } from "@/types/customer-portal";

const onlineMethods = ["qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "mandiri_va"];

export default function CustomerShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiGet<Shipment>(`/api/v1/customer/shipments/${params.id}`)
      .then((response) => {
        setShipment(response.data);
        const method = response.data.payments?.payment_method;
        if (method && method !== "cash") {
          setPaymentMethod(method);
        }
      })
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat detail."),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handlePay() {
    setPaying(true);
    setError("");
    setMessage("");
    try {
      const response = await apiPost<{ redirectUrl?: string | null; snapToken?: string | null }>(
        `/api/v1/customer/shipments/${params.id}/payments/online`,
        { paymentMethod },
      );
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
        return;
      }
      setMessage("Menunggu konfirmasi pembayaran.");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Gagal membuat pembayaran.");
    } finally {
      setPaying(false);
    }
  }

  const payment = shipment?.payments;
  const canPay = payment && payment.payment_status === "pending" && payment.payment_method !== "cash";

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Detail shipment</h1>
          <p className="subtitle">{shipment?.tracking_number ?? "Memuat nomor resi..."}</p>
        </div>
        {shipment && <StatusBadge status={shipment.status} />}
      </div>

      {loading && <div className="panel">Memuat detail shipment...</div>}
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {shipment && (
        <>
          <div className="grid metrics">
            <article className="metric-card"><span>Total weight</span><strong>{shipment.total_weight} kg</strong></article>
            <article className="metric-card"><span>Total price</span><strong>{formatCurrency(shipment.total_price)}</strong></article>
            <article className="metric-card"><span>Handover</span><strong>{shipment.handover_method}</strong></article>
            <article className="metric-card"><span>Shipment date</span><strong style={{ fontSize: 18 }}>{formatDate(shipment.shipment_date)}</strong></article>
          </div>

          <div className="grid two-col">
            <section className="panel">
              <h2>Route & customer</h2>
              <p><strong>Origin:</strong> {shipment.branches_shipments_origin_branch_idTobranches?.name} - {shipment.branches_shipments_origin_branch_idTobranches?.city}</p>
              <p><strong>Destination:</strong> {shipment.branches_shipments_destination_branch_idTobranches?.name} - {shipment.branches_shipments_destination_branch_idTobranches?.city}</p>
              <p><strong>Sender:</strong> {shipment.customers_shipments_sender_idTocustomers?.name} ({shipment.customers_shipments_sender_idTocustomers?.city})</p>
              <p><strong>Receiver:</strong> {shipment.customers_shipments_receiver_idTocustomers?.name} ({shipment.customers_shipments_receiver_idTocustomers?.city})</p>
            </section>

            <section className="panel">
              <h2>Payment</h2>
              <p><strong>Method:</strong> {payment?.payment_method ?? "-"}</p>
              <p><strong>Status:</strong> <StatusBadge status={payment?.payment_status} /></p>
              <p><strong>Amount:</strong> {formatCurrency(payment?.amount)}</p>
              <p><strong>Payment date:</strong> {formatDate(payment?.payment_date)}</p>
              {canPay && (
                <div className="form-grid">
                  <select className="select" onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}>
                    {onlineMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                  <button className="button primary" disabled={paying} onClick={handlePay} type="button">
                    {paying ? "Membuat pembayaran..." : "Bayar sekarang"}
                  </button>
                </div>
              )}
              {payment?.payment_method === "cash" && <p className="muted">Silakan datang ke cabang untuk pembayaran cash.</p>}
              {payment?.payment_status === "paid" && shipment.handover_method === "drop_off" && <p className="muted">Tunjukkan nomor resi ke admin cabang.</p>}
              {shipment.handover_method === "pickup" && <p className="muted">Kurir akan mengambil paket setelah dijadwalkan admin.</p>}
            </section>
          </div>

          <section className="panel">
            <h2>Items</h2>
            {shipment.shipment_items?.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Weight</th><th>Photo</th></tr></thead>
                  <tbody>
                    {shipment.shipment_items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.item_name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.weight} kg</td>
                        <td>{item.photo ? <a href={item.photo} target="_blank">Lihat foto</a> : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="muted">Belum ada item.</p>}
          </section>

          <section className="panel">
            <h2>Tracking timeline</h2>
            {shipment.shipment_trackings?.length ? (
              <ul className="timeline">
                {shipment.shipment_trackings.map((tracking) => (
                  <li key={tracking.id}>
                    <div>
                      <StatusBadge status={tracking.status} />
                      <p><strong>{tracking.location}</strong></p>
                      <p className="muted">{tracking.description}</p>
                      <p className="muted">{formatDate(tracking.tracked_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">Tracking belum tersedia.</p>}
          </section>
        </>
      )}
    </section>
  );
}
