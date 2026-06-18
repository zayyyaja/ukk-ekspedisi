"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { apiGet } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import { getCachedShipments, saveShipments } from "@/lib/offline-shipments";
import type { Shipment } from "@/types/customer-portal";

export default function CustomerShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineSavedAt, setOfflineSavedAt] = useState("");
  const online = useOnlineStatus();

  useEffect(() => {
    setLoading(true);
    setError("");
    if (!online) {
      getCachedShipments()
        .then((cached) => {
          if (cached) {
            setShipments(cached.data);
            setOfflineSavedAt(cached.savedAt);
          } else {
            setError("Belum ada shipment tersimpan untuk mode offline.");
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    apiGet<Shipment[]>(`/api/v1/customer/shipments?limit=100${status ? `&status=${status}` : ""}`)
      .then((response) => {
        setShipments(response.data);
        setOfflineSavedAt(new Date().toISOString());
        void saveShipments(response.data);
      })
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat shipment."),
      )
      .finally(() => setLoading(false));
  }, [online, status]);

  const filtered = useMemo(
    () =>
      shipments.filter((shipment) =>
        shipment.tracking_number.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, shipments],
  );

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Riwayat shipment</h1>
          <p className="subtitle">Daftar semua paket sebagai pengirim atau penerima.</p>
          {offlineSavedAt && !online && (
            <p className="muted">Data terakhir disimpan pada: {formatDate(offlineSavedAt)}</p>
          )}
        </div>
        <Link className="button primary" href="/customer/dashboard/shipments/create">
          Buat shipment
        </Link>
      </div>

      <section className="panel">
        <div className="grid" style={{ gridTemplateColumns: "1fr 220px" }}>
          <input
            className="input"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor resi"
            value={search}
          />
          <select className="select" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">Semua status</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked up</option>
            <option value="in_transit">In transit</option>
            <option value="arrived_at_branch">Arrived at branch</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      {loading && <div className="panel">Memuat shipment...</div>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && filtered.length === 0 && <div className="panel">Belum ada shipment.</div>}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Weight</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.tracking_number}</td>
                  <td>{shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-"}</td>
                  <td>{shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-"}</td>
                  <td>{shipment.total_weight} kg</td>
                  <td>{formatCurrency(shipment.total_price)}</td>
                  <td><StatusBadge status={shipment.status} /></td>
                  <td><StatusBadge status={shipment.payments?.payment_status} /></td>
                  <td>{formatDate(shipment.shipment_date)}</td>
                  <td><Link className="button secondary" href={`/customer/dashboard/shipments/${shipment.id}`}>Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
