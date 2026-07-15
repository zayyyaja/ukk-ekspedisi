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
  pdf.text("DANISH EKSPEDISI - MANIFES RESI RESMI", 14, 18);
  pdf.setFontSize(11);
  pdf.text(`Nomor Resi / SKU : ${shipment.tracking_number}`, 14, 32);
  pdf.text(
    `Deskripsi Muatan : ${shipment.shipment_items?.[0]?.item_name ?? "-"}`,
    14,
    40
  );
  pdf.text(
    `Hub Asal / Origin : ${shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}`,
    14,
    48
  );
  pdf.text(
    `Hub Tujuan / Destination : ${shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}`,
    14,
    56
  );
  pdf.text(`Status Logistik : ${shipment.status}`, 14, 64);
  pdf.text(`Metode Kliring : ${payment?.payment_method ?? "-"}`, 14, 72);
  pdf.text(`Status Transaksi : ${payment?.payment_status ?? "-"}`, 14, 80);
  pdf.text(`Beban Biaya Total : ${formatCurrency(shipment.total_price)}`, 14, 88);
  pdf.text(`Tanggal Registrasi : ${formatDate(shipment.shipment_date)}`, 14, 96);
  pdf.save(`manifes-${shipment.tracking_number}.pdf`);
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
        toast.error("[REJECTED] Tautan gerbang kliring belum diterbitkan.");
        return;
      }
      window.location.assign(redirectUrl);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "[ERROR] Autentikasi transaksi gagal.");
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
        "/api/v2/customer/shipments?limit=10"
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
    <section className="bg-paper py-16 font-body">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        
        {/* Header Seksi */}
        <div className="mb-12 flex flex-col gap-4 border-b-4 border-ink pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-block border-2 border-ink bg-amber-400 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-ink rounded-sm shadow-stamp-xs mb-4">
              LOGISTIK MANIFES / MONITOR UTAMA
            </span>
            <h2 className="font-mono text-3xl font-black tracking-tight text-ink uppercase sm:text-4xl">
              DAFTAR MUATAN AKTIF ANDA
            </h2>
            <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wide text-steel/60">
              Pantau pergerakan armada, eksekusi validasi administrasi, dan unduh lembar manifes resmi secara real-time.
            </p>
          </div>
        </div>

        {/* Input Kontrol Filter & Pencarian */}
        <div className="mb-10 grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-4 text-ink stroke-[2.5]"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="INPUT NOMOR RESI ATAU DESKRIPSI MUATAN..."
              className="h-13 w-full border-2 border-ink bg-white pl-12 pr-4 font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all placeholder:text-steel/40 focus:-translate-x-px focus:-translate-y-px focus:shadow-stamp-sm focus:outline-none rounded-app"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-13 border-2 border-ink bg-amber-400 px-4 font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all focus:-translate-x-px focus:-translate-y-px focus:shadow-stamp-sm focus:outline-none rounded-app cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px' }}
          >
            <option value="">[ SEMUA STATUS FLIGHT ]</option>
            <option value="pending">PENDING / ANTRIAN</option>
            <option value="picked_up">PICKED UP / JEMPUT</option>
            <option value="in_transit">IN TRANSIT / DI JALAN</option>
            <option value="arrived_at_branch">ARRIVED / TIBA DI HUB</option>
            <option value="delivered">DELIVERED / DITERIMA</option>
            <option value="cancelled">CANCELLED / BATAL</option>
          </select>
        </div>

        {/* Loading Skeleton Industrial */}
        {shipments.isLoading && (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden border-2 border-ink bg-white shadow-stamp-xs rounded-app"
              >
                <div className="aspect-16/7 animate-pulse border-b-2 border-ink bg-slate-200" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-12 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Komponen Kosong */}
        {!shipments.isLoading && displayedShipments.length === 0 && (
          <div className="grid min-h-87.5 place-items-center border-2 border-ink bg-white shadow-stamp-xs rounded-app p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-ink bg-red-400 text-ink rounded-full shadow-stamp-xs">
                <PackageSearch size={28} className="stroke-[2.5]" />
              </div>
              <h3 className="mt-6 font-mono text-sm font-black uppercase tracking-wider text-ink">
                [ NIHIL ] TIDAK ADA DATA MANIFES
              </h3>
              <p className="mt-2 font-mono text-2xs font-bold uppercase tracking-wide text-steel/50 max-w-xs mx-auto">
                Sistem tidak mendeteksi rekaman pengiriman yang cocok dengan parameter input.
              </p>
            </div>
          </div>
        )}

        {/* Grid List Manifes */}
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
                  className="group flex flex-col overflow-hidden border-2 border-ink bg-white shadow-stamp-xs transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-app cursor-pointer"
                >
                  {/* Bagian Cover Foto */}
                  <div className="relative aspect-16/7 overflow-hidden border-b-2 border-ink bg-slate-100">
                    <img
                      src={getShipmentCoverPhoto(shipment)}
                      alt="Muatan kargo"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="border-2 border-ink bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-ink rounded-sm shadow-stamp-xs">
                        ID: {shipment.tracking_number}
                      </span>
                    </div>
                  </div>

                  {/* Informasi Data Konten */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="border-b-2 border-dashed border-ink pb-4">
                      <h3 className="line-clamp-1 font-mono text-base font-black uppercase tracking-wide text-ink">
                        {shipment.shipment_items?.[0]?.item_name ?? "MUATAN LOGISTIK TANPA NAMA"}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 font-mono text-2xs font-bold text-steel/50 uppercase">
                        <span>NOMOR RESI MANIFES //</span>
                        <span className="text-ink font-black underline">{shipment.tracking_number}</span>
                      </div>
                    </div>

                    {/* Meta Alur Rute */}
                    <div className="mt-4 grid grid-cols-2 gap-4 border-b-2 border-dashed border-ink pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-slate-100 text-ink rounded-sm shadow-none">
                          <CalendarDays size={14} className="stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] font-bold uppercase text-steel/50">REGISTRASI</p>
                          <p className="truncate font-mono text-2xs font-black uppercase text-ink">
                            {formatDate(shipment.shipment_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-slate-100 text-ink rounded-sm shadow-none">
                          <MapPin size={14} className="stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] font-bold uppercase text-steel/50">TERMINAL TUJUAN</p>
                          <p className="truncate font-mono text-2xs font-black uppercase text-ink">
                            {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "BELUM DISET"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Logistik & Kliring Pembayaran */}
                    <div className="mt-4 space-y-2 border-2 border-ink bg-slate-50 p-3 rounded-sm shadow-none">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xs font-black uppercase text-steel/60">STATUS FINANSIAL:</span>
                        <StatusBadge status={paymentStatus} />
                      </div>
                      <div className="flex items-center justify-between border-t border-ink/10 pt-2">
                        <span className="font-mono text-2xs font-black uppercase text-steel/60">STATUS LOGISTIK:</span>
                        <StatusBadge status={shipment.status} />
                      </div>
                    </div>

                    {/* Total Anggaran Biaya */}
                    <div className="mt-4 flex items-center justify-between bg-ink p-3 text-white rounded-sm">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider text-white/60">TOTAL BEBAN BIAYA</span>
                      <span className="font-mono text-lg font-black tracking-wide text-amber-400">
                        {formatCurrency(shipment.total_price)}
                      </span>
                    </div>

                    {/* Tombol Aksi - Layout Tegak Lurus */}
                    <div className="mt-5 pt-2">
                      <div className="flex flex-col gap-2.5">
                        {canPay ? (
                          <>
                            <Button
                              variant="outline"
                              className="w-full border-2 border-ink bg-white font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm rounded-app cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/customer/pesanan/${shipment.id}`);
                              }}
                            >
                              PERIKSA RINCIAN
                              <ArrowRight className="ml-2 h-3.5 w-3.5 stroke-[2.5]" />
                            </Button>

                            <Button
                              className="w-full border-2 border-ink bg-amber-400 font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm disabled:opacity-50 rounded-app cursor-pointer"
                              disabled={paymentMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                paymentMutation.mutate(shipment);
                              }}
                            >
                              {paymentStatus === "failed" ? "PROSES ULANG RE-KLIRING" : "SETOR PEMBAYARAN SEKARANG"}
                            </Button>
                          </>
                        ) : (
                          <>
                            {paymentStatus === "paid" && (
                              <Button
                                variant="outline"
                                className="w-full border-2 border-ink bg-emerald-400 font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm rounded-app cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadReceipt(shipment);
                                }}
                              >
                                <Download className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />
                                UNDUH DOKUMEN RESI
                              </Button>
                            )}

                            <Button
                              className="w-full border-2 border-ink bg-ink font-mono text-xs font-black uppercase tracking-wider text-white shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm rounded-app cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/customer/pesanan/${shipment.id}`);
                              }}
                            >
                              PERIKSA RINCIAN
                              <ArrowRight className="ml-2 h-3.5 w-3.5 stroke-[2.5]" />
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

        {/* Tombol Tampilkan Semua Manifes */}
        {filteredShipments.length > 6 && (
          <div className="mt-12 flex justify-center border-t-2 border-ink pt-8">
            <Button
              asChild
              variant="outline"
              className="border-2 border-ink bg-white font-mono text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm rounded-app cursor-pointer"
            >
              <Link href="/customer/lacak-paket">
                BUKA ARSIP SEMUA MANIFES
                <ArrowRight className="ml-2 h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}