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
    <main className="min-h-screen bg-paper py-16 text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 space-y-10">
        
        {/* Header Portal - Desain Khas Manifes Dokumen Logistik */}
        <header className="max-w-3xl border-l-4 border-ink pl-5 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-steel">
            REAL-TIME TRACKING SYSTEM // danishEkspedisi
          </span>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
            Lacak Posisi Paket Real-Time
          </h1>
          <p className="font-body text-sm leading-relaxed text-steel">
            Masukkan kode resi manifes unik Anda untuk memantau status distribusi, lokasi transit, dan riwayat perjalanan kargo secara transparan.
          </p>
        </header>

        {/* Section Kontainer Pencarian & Hasil */}
        <section className="space-y-6">
          
          {/* Form Pencarian Resi - Gaya Komponen Neo-Brutalist Tebal */}
          <form
            className="grid gap-4 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              void searchTracking();
            }}
          >
            {/* Input Wrapper dengan Efek Fokus Angkat */}
            <div className="relative h-14 w-full border-2 border-ink bg-paper rounded-app shadow-stamp-sm focus-within:shadow-stamp focus-within:-translate-x-px focus-within:-translate-y-px transition-all">
              <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink stroke-[2.5]" />
              <input
                className="w-full h-full bg-transparent pl-12 pr-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none placeholder:text-steel/50"
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="CONTOH: ANTR-2026-0001"
                value={trackingNumber}
              />
            </div>
            
            {/* Tombol Cari - Cetakan Stamp Aksen Cargo Amber */}
            <button 
              className="h-14 px-8 border-2 border-ink bg-cargo-amber font-display text-xs font-black uppercase tracking-wider text-ink shadow-stamp-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm rounded-app disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2" 
              disabled={loading} 
              type="submit"
            >
              <Search className="h-4 w-4 stroke-[2.5]" />
              {loading ? "Mencari..." : "Cari resi"}
            </button>
          </form>

          {/* Alert Error Sistem */}
          {error && (
            <div className="border-2 border-dashed border-red-600 bg-red-50 p-4 font-mono text-xs font-bold uppercase tracking-wide text-red-700 rounded-app">
              [MANIFEST ERROR]: {error}
            </div>
          )}

          {/* Tampilan Hasil Pencarian Resi */}
          {shipment && (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              
              {/* Kartu Informasi Utama Paket */}
              <article className="border-2 border-ink bg-paper p-6 rounded-app shadow-stamp-sm flex flex-col justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-steel">
                    NOMOR RESI MANIFEST
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-ink">
                    {shipment.tracking_number}
                  </h2>
                  <div className="mt-4 flex">
                    <StatusBadge status={shipment.status} />
                  </div>
                  
                  {/* Daftar Rincian Cabang & Tanggal */}
                  <dl className="mt-6 grid gap-4 border-t-2 border-ink border-dashed pt-5 text-xs">
                    <div>
                      <dt className="font-mono text-[10px] font-black uppercase text-steel tracking-wider">
                        Hub Cabang Asal
                      </dt>
                      <dd className="mt-1 font-body font-bold text-ink uppercase">
                        {shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] font-black uppercase text-steel tracking-wider">
                        Hub Cabang Tujuan
                      </dt>
                      <dd className="mt-1 font-body font-bold text-ink uppercase">
                        {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] font-black uppercase text-steel tracking-wider">
                        Tanggal Registrasi Pengiriman
                      </dt>
                      <dd className="mt-1 font-mono font-bold text-ink">
                        {shipment.shipment_date ? formatDate(shipment.shipment_date) : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 border-t border-ink/10 pt-3 text-right font-mono text-[9px] text-steel/60 uppercase tracking-widest">
                  SECURE HUB VERIFIED
                </div>
              </article>

              {/* Kartu Timeline Riwayat Perjalanan Paket */}
              <article className="border-2 border-ink bg-paper p-6 rounded-app shadow-stamp-sm">
                <h2 className="font-display text-base font-black uppercase tracking-tight text-ink border-b-2 border-ink pb-3 mb-6">
                  TIMELINE LOGISTIK DISPATCH
                </h2>
                
                {/* Jalur Linier Linimasa Paket */}
                <ol className="relative border-l-2 border-ink pl-6 ml-2 space-y-6">
                  {(shipment.shipment_trackings ?? []).map((tracking) => (
                    <li key={tracking.id} className="relative">
                      {/* Node Node Penanda Geometris Pengganti Bullet Lingkaran */}
                      <div className="absolute -left-7.75 top-1 w-3 h-3 border-2 border-ink bg-cargo-amber rounded-2px shadow-stamp-xs" />
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <StatusBadge status={tracking.status} />
                          <span className="font-mono text-[10px] font-bold text-steel">
                            {formatDate(tracking.tracked_at)}
                          </span>
                        </div>
                        <p className="font-display text-xs font-black uppercase text-ink tracking-tight">
                          {tracking.location}
                        </p>
                        {tracking.description && (
                          <p className="font-body text-xs text-steel leading-relaxed">
                            {tracking.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* State Jika Timeline Masih Kosong */}
                {(shipment.shipment_trackings ?? []).length === 0 && (
                  <p className="font-body text-xs text-steel italic border-2 border-dashed border-ink/20 p-4 text-center bg-ink/1 rounded-app">
                    Belum ada riwayat manifes tracking yang tercatat untuk paket ini.
                  </p>
                )}
              </article>

            </div>
          )}
        </section>
      </div>
    </main>
  );
}