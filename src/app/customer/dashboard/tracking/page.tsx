"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/customer-format";
import { getCachedTracking, saveTracking } from "@/lib/offline-tracking";
import type { Shipment } from "@/types/customer-portal";

export default function CustomerTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offlineSavedAt, setOfflineSavedAt] = useState("");
  const online = useOnlineStatus();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setShipment(null);
    try {
      if (!online) {
        const cached = await getCachedTracking();
        if (!cached) {
          setError("Belum ada data tracking tersimpan.");
          return;
        }
        setShipment(cached.data);
        setOfflineSavedAt(cached.savedAt);
        return;
      }
      const response = await apiGet<Shipment>(`/api/v1/public/tracking/${trackingNumber}`);
      setShipment(response.data);
      setOfflineSavedAt(new Date().toISOString());
      await saveTracking(response.data);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Tracking tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Tracking resi</h1>
          <p className="subtitle">Cari posisi paket dari nomor resi.</p>
          {offlineSavedAt && !online && (
            <p className="muted">Tracking terakhir tersimpan: {formatDate(offlineSavedAt)}</p>
          )}
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Tracking number</label>
          <input className="input" onChange={(event) => setTrackingNumber(event.target.value)} value={trackingNumber} />
        </div>
        <button className="button primary" disabled={loading || !trackingNumber} type="submit">
          {loading ? "Mencari..." : "Cari tracking"}
        </button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {shipment && (
        <section className="panel">
          <h2>{shipment.tracking_number}</h2>
          <p><StatusBadge status={shipment.status} /></p>
          <p>{shipment.branches_shipments_origin_branch_idTobranches?.city} ke {shipment.branches_shipments_destination_branch_idTobranches?.city}</p>
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
          ) : <p className="muted">Timeline belum tersedia.</p>}
        </section>
      )}
    </section>
  );
}
