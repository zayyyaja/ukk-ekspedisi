"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { apiGet } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import type { Payment } from "@/types/customer-portal";

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Payment[]>("/api/v1/customer/payments?limit=100")
      .then((response) => setPayments(response.data))
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat pembayaran."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <p className="subtitle">Status pembayaran shipment customer.</p>
        </div>
      </div>
      {loading && <div className="panel">Memuat pembayaran...</div>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && payments.length === 0 && <div className="panel">Belum ada pembayaran.</div>}
      {!loading && !error && payments.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Tracking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.shipments?.tracking_number ?? "-"}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.payment_method}</td>
                  <td><StatusBadge status={payment.payment_status} /></td>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td>{payment.shipments?.id ? <Link className="button secondary" href={`/customer/dashboard/shipments/${payment.shipments.id}`}>Detail</Link> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
