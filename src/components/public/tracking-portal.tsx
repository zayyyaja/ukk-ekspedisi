"use client";

import { PackageSearch, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/customer-format";
import type { PublicShipment } from "@/components/public/public-types";

export function TrackingPortal() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("resi") ?? "");
  const [shipment, setShipment] = useState<PublicShipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const resi = searchParams.get("resi");
    if (resi) {
      void searchTracking(resi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function searchTracking(value = trackingNumber) {
    const normalized = value.trim();
    if (!normalized) {
      setError("Masukkan nomor resi terlebih dahulu.");
      setShipment(null);
      return;
    }

    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const response = await apiGet<PublicShipment>(`/api/v1/public/tracking/${encodeURIComponent(normalized)}`);
      setShipment(response.data);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Resi tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section-spacing">
      <div className="page-container space-y-8">
        <header className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-wide text-orange-600">Tracking paket</span>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Lacak posisi paket secara real time</h1>
          <p className="mt-3 text-base text-slate-600">
            Masukkan nomor resi untuk melihat status pengiriman dan riwayat perjalanan paket.
          </p>
        </header>

        <section className="panel space-y-5">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void searchTracking();
            }}
          >
            <div className="relative">
              <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-12 uppercase"
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Contoh: ANTR-2026-0001"
                value={trackingNumber}
              />
            </div>
            <button className="button primary" disabled={loading} type="submit">
              <Search className="h-4 w-4" />
              {loading ? "Mencari..." : "Cari resi"}
            </button>
          </form>

          {error && <div className="alert error">{error}</div>}

          {shipment && (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <article className="card-surface p-5">
                <p className="text-sm font-semibold text-slate-500">Nomor resi</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{shipment.tracking_number}</h2>
                <div className="mt-4">
                  <StatusBadge status={shipment.status} />
                </div>
                <dl className="mt-5 grid gap-4 text-sm">
                  <div>
                    <dt className="font-bold text-slate-950">Cabang asal</dt>
                    <dd className="text-slate-600">
                      {shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-950">Cabang tujuan</dt>
                    <dd className="text-slate-600">
                      {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-950">Tanggal pengiriman</dt>
                    <dd className="text-slate-600">{shipment.shipment_date ? formatDate(shipment.shipment_date) : "-"}</dd>
                  </div>
                </dl>
              </article>

              <article className="card-surface p-5">
                <h2 className="text-lg font-bold text-slate-950">Timeline</h2>
                <ol className="timeline mt-5">
                  {(shipment.shipment_trackings ?? []).map((tracking) => (
                    <li key={tracking.id}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={tracking.status} />
                          <span className="text-sm font-semibold text-slate-500">{formatDate(tracking.tracked_at)}</span>
                        </div>
                        <p className="mt-2 font-bold text-slate-950">{tracking.location}</p>
                        {tracking.description && <p className="text-sm text-slate-600">{tracking.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
                {(shipment.shipment_trackings ?? []).length === 0 && (
                  <p className="mt-4 text-sm text-slate-600">Belum ada riwayat tracking untuk paket ini.</p>
                )}
              </article>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
