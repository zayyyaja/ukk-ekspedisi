"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { type PublicShipment } from "@/components/public/public-types";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api-client";

const timelineDefaults = [
  "pending",
  "picked_up",
  "in_transit",
  "arrived_at_branch",
  "out_for_delivery",
  "delivered",
];

export function TrackingPortal() {
  const searchParams = useSearchParams();
  const initialResi = searchParams.get("resi") ?? "";
  const [trackingNumber, setTrackingNumber] = useState(initialResi);
  const [shipment, setShipment] = useState<PublicShipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  async function search(resi: string) {
    const value = resi.trim();
    if (!value) {
      return;
    }

    setLoading(true);
    setNotFound(false);
    setError(false);
    setShipment(null);

    apiGet<PublicShipment>(`/api/v1/public/tracking/${encodeURIComponent(value)}`)
      .then((response) => setShipment(response.data))
      .catch((err) => {
        if (err instanceof Error && err.message.toLowerCase().includes("not found")) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (initialResi) {
      void search(initialResi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialResi]);

  return (
    <main className="bg-background px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-blue-600">Tracking Paket</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Lacak perjalanan paket tanpa login.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Masukkan nomor resi untuk melihat status, cabang asal, cabang tujuan,
            dan timeline tracking terbaru.
          </p>
        </section>

        <form
          className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void search(trackingNumber);
          }}
        >
          <label className="sr-only" htmlFor="tracking-number">
            Nomor Resi
          </label>
          <Input
            id="tracking-number"
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Contoh: EXP-DPK-BGR-0001"
            value={trackingNumber}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
            Lacak Paket
          </Button>
        </form>

        {loading ? <LoadingState title="Mencari nomor resi" /> : null}
        {notFound ? (
          <EmptyState
            description="Periksa kembali nomor resi yang Anda masukkan."
            title="Nomor resi tidak ditemukan."
          />
        ) : null}
        {error ? (
          <ErrorState
            description="Tracking belum dapat dimuat. Coba ulang beberapa saat lagi."
            title="Gagal memuat tracking"
          />
        ) : null}
        {shipment ? (
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Resi</p>
                  <h2 className="font-mono text-2xl font-bold text-slate-950">
                    {shipment.tracking_number}
                  </h2>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Cabang Asal</p>
                  <strong>{shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}</strong>
                  <p className="text-sm text-slate-600">
                    {shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-"}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Cabang Tujuan</p>
                  <strong>{shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}</strong>
                  <p className="text-sm text-slate-600">
                    {shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-950">Timeline Tracking</h3>
                <ol className="mt-4 grid gap-3">
                  {(shipment.shipment_trackings?.length
                    ? shipment.shipment_trackings
                    : timelineDefaults.map((status, index) => ({
                        id: status,
                        status,
                        location: index === 0 ? "Sistem" : "-",
                        description: status === shipment.status ? "Status saat ini" : "",
                        tracked_at: "",
                      }))
                  ).map((track) => (
                    <li
                      className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[180px_1fr]"
                      key={track.id}
                    >
                      <StatusBadge status={track.status} />
                      <div>
                        <p className="font-semibold text-slate-950">{track.location}</p>
                        <p className="text-sm text-slate-600">
                          {track.description || "Menunggu update tracking."}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
