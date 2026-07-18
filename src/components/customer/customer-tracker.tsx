"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Download,
  MapPin,
  PackageSearch,
  Search,
  Box,
  Truck
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import type { Shipment } from "@/types/customer-portal";

async function downloadReceipt(shipment: Shipment) {
  const { default: jsPDF } = await import("jspdf");
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
  pdf.text(`Total : ${formatCurrency(shipment.total_price)}`, 14, 88);
  pdf.text(`Tanggal : ${formatDate(shipment.shipment_date)}`, 14, 96);
  pdf.save(`resi-${shipment.tracking_number}.pdf`);
}

function useShipmentPayment() {
  return useMutation({
    mutationFn: async (shipment: Shipment) => {
      const method = shipment.payments?.payment_method;
      const response = await apiPost<{ redirectUrl?: string | null }>(
        `/api/v2/customer/shipments/${shipment.id}/payments/online`,
        {
          paymentMethod: method && method !== "cash" ? method : "qris",
        }
      );
      return response.data;
    },
    onSuccess: ({ redirectUrl }) => {
      if (!redirectUrl) {
        toast.error("Tautan pembayaran belum tersedia.");
        return;
      }
      window.location.assign(redirectUrl);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal memproses pembayaran.");
    },
  });
}

export function CustomerTracker() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const shipments = useQuery({
    queryKey: ["customer-shipments"],
    queryFn: async () => {
      const response = await apiGet<Shipment[]>("/api/v2/customer/shipments?limit=10");
      return response.data;
    },
    refetchInterval: 5000,
  });

  const paymentMutation = useShipmentPayment();

  const filteredShipments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (shipments.data ?? []).filter((shipment) => {
      const matchSearch =
        !keyword ||
        shipment.tracking_number.toLowerCase().includes(keyword) ||
        shipment.shipment_items?.some((item) => item.item_name.toLowerCase().includes(keyword));
      return matchSearch;
    });
  }, [shipments.data, search]);

  const displayedShipments = filteredShipments.slice(0, 5);

  return (
    <section className="font-body w-full">
      {/* Loading Skeleton */}
      {shipments.isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
             <div key={item} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {/* Komponen Kosong */}
      {!shipments.isLoading && displayedShipments.length === 0 && (
        <div className="flex min-h-[160px] flex-col items-center justify-center border border-border border-dashed bg-surface/50 shadow-sm rounded-xl p-6">
          <PackageSearch size={24} className="text-muted" />
          <h3 className="mt-4 text-sm font-semibold text-ink">Tidak Ada Paket</h3>
          <p className="mt-1 text-xs font-medium text-muted max-w-xs text-center">
            Kami tidak dapat menemukan paket yang sesuai dengan pencarian Anda.
          </p>
        </div>
      )}

      {/* List Manifes (Ultra Compact Enterprise Design) */}
      {!shipments.isLoading && displayedShipments.length > 0 && (
        <div className="flex flex-col gap-3">
          {displayedShipments.map((shipment, index) => {
            const paymentStatus = shipment.payments?.payment_status;
            const canPay = paymentStatus === "pending" || paymentStatus === "failed";

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
                style={{ animationDelay: `${index * 50}ms` }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/40 bg-surface px-4 py-3 shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl cursor-pointer animate-in slide-in-from-bottom-2 fade-in"
              >
                
                {/* Left: Icon & Core Identity */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Box size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="truncate text-sm font-semibold text-ink">
                      {shipment.shipment_items?.[0]?.item_name ?? "Tanpa Nama"}
                    </h3>
                    <p className="truncate text-[11px] font-medium text-muted mt-0.5">
                      {shipment.tracking_number}
                    </p>
                  </div>
                </div>

                {/* Center: Route & Timeline (Hidden on very small screens) */}
                <div className="hidden md:flex items-center gap-6 flex-1 min-w-0 px-4">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Destination</span>
                    <p className="truncate text-xs font-medium text-ink mt-0.5">
                      {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-border/40 hidden lg:block" />
                  <div className="hidden lg:flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Date</span>
                    <p className="truncate text-xs font-medium text-ink mt-0.5">
                      {formatDate(shipment.shipment_date)}
                    </p>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={shipment.status} />
                    {canPay && <StatusBadge status={paymentStatus} />}
                  </div>

                  <div className="flex items-center gap-2">
                    {canPay ? (
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 rounded-lg"
                        disabled={paymentMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          paymentMutation.mutate(shipment);
                        }}
                      >
                        {paymentStatus === "failed" ? "Retry" : "Pay"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-muted hover:text-ink hover:bg-slate-100 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/customer/pesanan/${shipment.id}`);
                        }}
                      >
                        <ArrowRight size={16} />
                      </Button>
                    )}
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}