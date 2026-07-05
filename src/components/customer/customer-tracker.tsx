"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import {
  ArrowRight,
  CalendarDays,
  Download,
  MapPin,
  PackageSearch,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import { getShipmentCoverPhoto } from "@/lib/shipment-photos";
import type { Shipment } from "@/types/customer-portal";

function downloadReceipt(shipment: Shipment) {
  const payment = shipment.payments;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Resi Pengiriman Ekspedisi Online", 14, 18);
  pdf.setFontSize(11);
  pdf.text(`Nomor Resi : ${shipment.tracking_number}`, 14, 32);
  pdf.text(
    `Nama Paket : ${shipment.shipment_items?.[0]?.item_name ?? "-"}`,
    14,
    40
  );
  pdf.text(
    `Cabang Asal : ${shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}`,
    14,
    48
  );
  pdf.text(
    `Cabang Tujuan : ${shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}`,
    14,
    56
  );
  pdf.text(`Status Pengiriman : ${shipment.status}`, 14, 64);
  pdf.text(`Metode Pembayaran : ${payment?.payment_method ?? "-"}`, 14, 72);
  pdf.text(`Status Pembayaran : ${payment?.payment_status ?? "-"}`, 14, 80);
  pdf.text(`Total Pembayaran : ${formatCurrency(shipment.total_price)}`, 14, 88);
  pdf.text(`Tanggal : ${formatDate(shipment.shipment_date)}`, 14, 96);
  pdf.save(`resi-${shipment.tracking_number}.pdf`);
}

function useShipmentPayment() {
  return useMutation({
    mutationFn: async (shipment: Shipment) => {
      const method = shipment.payments?.payment_method;
      const response = await apiPost<{ redirectUrl?: string | null }>(
        `/api/v1/customer/shipments/${shipment.id}/payments/online`,
        {
          paymentMethod: method && method !== "cash" ? method : "qris",
        }
      );
      return response.data;
    },
    onSuccess: ({ redirectUrl }) => {
      if (!redirectUrl) {
        toast.error("Link pembayaran belum tersedia.");
        return;
      }
      window.location.assign(redirectUrl);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Pembayaran gagal.");
    },
  });
}

export function CustomerTracker() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const shipments = useQuery({
    queryKey: ["customer-shipments"],
    queryFn: async () => {
      const response = await apiGet<Shipment[]>(
        "/api/v1/customer/shipments?limit=10"
      );
      return response.data;
    },
    refetchInterval: 5000,
  });

  const paymentMutation = useShipmentPayment();

  const filteredShipments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (shipments.data ?? []).filter((shipment) => {
      const matchStatus = !status || shipment.status === status;
      const matchSearch =
        !keyword ||
        shipment.tracking_number.toLowerCase().includes(keyword) ||
        shipment.shipment_items?.some((item) =>
          item.item_name.toLowerCase().includes(keyword)
        );
      return matchStatus && matchSearch;
    });
  }, [shipments.data, search, status]);

  const displayedShipments = filteredShipments.slice(0, 6);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="animate-fade-in mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              Riwayat Pengiriman
            </p>
            <h2 className="mt-3 font-space text-4xl font-bold leading-tight text-slate-900">
              Paket Terbaru Anda
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Pantau seluruh proses pengiriman, lakukan pembayaran, dan unduh resi
              kapan saja secara real-time.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="animate-slide-up mb-10 grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor resi atau nama paket..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived_at_branch">Arrived At Branch</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Loading */}
        {shipments.isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/8] animate-pulse bg-slate-200" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 animate-pulse rounded bg-slate-200" />
                    <div className="h-10 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-12 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!shipments.isLoading && displayedShipments.length === 0 && (
          <div className="animate-scale-in grid min-h-[350px] place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                <PackageSearch size={36} className="text-orange-500" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Belum Ada Pengiriman
              </h3>
              <p className="mt-2 max-w-sm text-slate-500">
                Pengiriman yang sesuai dengan pencarian tidak ditemukan.
              </p>
            </div>
          </div>
        )}

        {/* Shipment Grid */}
        {!shipments.isLoading && displayedShipments.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {displayedShipments.map((shipment, index) => {
              const paymentStatus = shipment.payments?.payment_status;
              const canPay =
                paymentStatus === "pending" || paymentStatus === "failed";

              return (
                <article
                  key={shipment.id}
                  onClick={() => router.push(`/customer/pesanan/${shipment.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/customer/pesanan/${shipment.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="animate-card-in group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/8] overflow-hidden bg-orange-50">
                    <img
                      src={getShipmentCoverPhoto(shipment)}
                      alt="Foto paket"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                    <div className="absolute bottom-5 left-5">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600 backdrop-blur">
                        {shipment.tracking_number}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div>
                      <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
                        {shipment.shipment_items?.[0]?.item_name ??
                          "Paket Ekspedisi"}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Nomor Resi
                      </p>
                      <p className="font-mono font-semibold text-orange-600">
                        {shipment.tracking_number}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Tanggal
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDate(shipment.shipment_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Tujuan
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-1">
                            {shipment.branches_shipments_destination_branch_idTobranches?.name ??
                              "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Status Pembayaran
                        </span>
                        <StatusBadge status={paymentStatus} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Status Pengiriman
                        </span>
                        <StatusBadge status={shipment.status} />
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Total Harga
                      </p>
                      <h4 className="mt-2 text-3xl font-black text-orange-600">
                        {formatCurrency(shipment.total_price)}
                      </h4>
                    </div>

                    {/* Action Buttons - Vertical Layout */}
                    <div className="mt-auto pt-6">
                      <div className="flex flex-col gap-3">
                        {canPay ? (
                          <>
                            {/* BELUM PAID: Lihat Detail di atas (outline) */}
                            <Button
                              variant="outline"
                              className="w-full border-orange-500 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/customer/pesanan/${shipment.id}`);
                              }}
                            >
                              Lihat Detail
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            {/* BELUM PAID: Bayar Sekarang di bawah (filled orange) */}
                            <Button
                              className="w-full bg-orange-500 text-white hover:bg-orange-600"
                              disabled={paymentMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                paymentMutation.mutate(shipment);
                              }}
                            >
                              {paymentStatus === "failed"
                                ? "Coba Bayar Lagi"
                                : "Bayar Sekarang"}
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* SUDAH PAID: Download Struk di atas (outline orange, bg putih) */}
                            {paymentStatus === "paid" && (
                              <Button
                                variant="outline"
                                className="w-full border-orange-500 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadReceipt(shipment);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Struk
                              </Button>
                            )}

                            {/* SUDAH PAID: Lihat Detail di bawah (filled orange) */}
                            <Button
                              className="w-full border border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/customer/pesanan/${shipment.id}`);
                              }}
                            >
                              Lihat Detail
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filteredShipments.length > 6 && (
          <div className="mt-12 flex justify-center">
            <Button
              asChild
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Link href="/customer/lacak-paket">
                Lihat Semua Paket
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
