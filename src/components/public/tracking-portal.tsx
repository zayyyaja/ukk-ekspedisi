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
      const response = await apiGet<PublicShipment>(`/api/v2/public/tracking/${encodeURIComponent(normalized)}`);
      setShipment(response.data);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Resi tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface py-24 text-ink font-body">
      <div className="page-container space-y-12">
        
        {/* Header Portal */}
        <header className="max-w-2xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-primary rounded-full">
            Global Tracking System
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Track your shipment.
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Enter your tracking number for real-time updates on your cargo's location, transit history, and estimated arrival.
          </p>
        </header>

        {/* Section Kontainer Pencarian & Hasil */}
        <section className="space-y-10 max-w-4xl mx-auto w-full">
          
          {/* Form Pencarian Resi */}
          <form
            className="flex flex-col sm:flex-row gap-4 w-full"
            onSubmit={(event) => {
              event.preventDefault();
              void searchTracking();
            }}
          >
            {/* Input Wrapper */}
            <div className="relative h-16 w-full flex-1 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
              <PackageSearch className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
              <input
                className="h-full w-full bg-transparent pl-16 pr-6 text-base font-medium uppercase tracking-wider text-ink outline-none placeholder:text-muted placeholder:normal-case placeholder:font-normal"
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="e.g. ANTR-2026-0001"
                value={trackingNumber}
              />
            </div>
            
            {/* Tombol Cari */}
            <button 
              className="inline-flex h-16 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-sm font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98] hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shrink-0"
              disabled={loading} 
              type="submit"
            >
              <Search className="h-5 w-5" />
              {loading ? "Searching..." : "Track Package"}
            </button>
          </form>

          {/* Alert Error Sistem */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm font-semibold text-red-800 shadow-sm">
              {error}
            </div>
          )}

          {/* Tampilan Hasil Pencarian Resi */}
          {shipment && (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              
              {/* Kartu Informasi Utama Paket */}
              <article className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tight">
                    Tracking Number
                  </p>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink uppercase">
                    {shipment.tracking_number}
                  </h2>
                  <div className="mt-6 flex">
                    <StatusBadge status={shipment.status} />
                  </div>
                  
                  {/* Daftar Rincian Cabang & Tanggal */}
                  <dl className="mt-10 grid gap-6 border-t border-border/50 pt-8 text-sm">
                    <div>
                      <dt className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Origin Hub
                      </dt>
                      <dd className="mt-1.5 font-semibold text-ink text-base">
                        {shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Destination Hub
                      </dt>
                      <dd className="mt-1.5 font-semibold text-ink text-base">
                        {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Shipment Date
                      </dt>
                      <dd className="mt-1.5 font-semibold text-ink text-base">
                        {shipment.shipment_date ? formatDate(shipment.shipment_date) : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>

              {/* Kartu Timeline Riwayat Perjalanan Paket */}
              <article className="rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="mb-8 border-b border-border/50 pb-4 text-sm font-semibold tracking-tight uppercase text-muted">
                  Transit History
                </h2>
                
                {/* Jalur Linier Linimasa Paket */}
                <ol className="relative ml-4 space-y-8 border-l-2 border-primary/20 pl-8">
                  {(shipment.shipment_trackings ?? []).map((tracking) => (
                    <li key={tracking.id} className="relative">
                      {/* Node Node Penanda */}
                      <div className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-[3px] border-surface bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={tracking.status} />
                          <span className="text-[11px] font-bold text-muted uppercase tracking-tight">
                            {formatDate(tracking.tracked_at)}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-ink">
                          {tracking.location}
                        </p>
                        {tracking.description && (
                          <p className="text-sm text-muted leading-relaxed">
                            {tracking.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* State Jika Timeline Masih Kosong */}
                {(shipment.shipment_trackings ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-slate-50/50 p-8 text-center text-sm font-medium text-muted">
                    Transit history is currently empty.
                  </div>
                )}
              </article>

            </div>
          )}
        </section>
      </div>
    </main>
  );
}