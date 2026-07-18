"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import {
  ArrowRight,
  CalendarDays,
  Download,
  Funnel,
  MapPin,
  PackageSearch,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { BentoHeader } from "@/components/customer/bento-header";

import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import { getShipmentCoverPhoto } from "@/lib/shipment-photos";

import type { Shipment } from "@/types/customer-portal";

function downloadReceipt(shipment: Shipment) {
  const payment = shipment.payments;

  const document = new jsPDF();

  document.setFontSize(18);
  document.text(
    "Resi Pengiriman Ekspedisi Online",
    14,
    18,
  );

  document.setFontSize(11);

  document.text(
    `Nomor Resi : ${shipment.tracking_number}`,
    14,
    32,
  );

  document.text(
    `Nama Paket : ${shipment.shipment_items?.[0]?.item_name ?? "-"}`,
    14,
    40,
  );

  document.text(
    `Cabang Asal : ${shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"}`,
    14,
    48,
  );

  document.text(
    `Cabang Tujuan : ${shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}`,
    14,
    56,
  );

  document.text(
    `Status Pengiriman : ${shipment.status}`,
    14,
    64,
  );

  document.text(
    `Metode Pembayaran : ${payment?.payment_method ?? "-"}`,
    14,
    72,
  );

  document.text(
    `Status Pembayaran : ${payment?.payment_status ?? "-"}`,
    14,
    80,
  );

  document.text(
    `Total : ${formatCurrency(shipment.total_price)}`,
    14,
    88,
  );

  document.text(
    `Tanggal : ${formatDate(shipment.shipment_date)}`,
    14,
    96,
  );

  document.save(`resi-${shipment.tracking_number}.pdf`);
}

function ShipmentCard({
  shipment,
  paymentLoading,
  onPay,
  onDownload,
  variant = "shipments",
}: {
  shipment: Shipment;
  paymentLoading: boolean;
  onPay: () => void;
  onDownload: () => void;
  variant?: "shipments" | "payments";
}) {
  const paymentStatus = shipment.payments?.payment_status;
  const canPay = paymentStatus === "pending" || paymentStatus === "failed";

  return (
    <Link
      href={`/customer/pesanan/${shipment.id}`}
      className="group flex flex-col sm:flex-row items-center gap-4 p-4 overflow-hidden border border-border/50 bg-surface/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl cursor-pointer w-full"
    >
      {/* Cover Gambar */}
      <div className="relative w-full sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={getShipmentCoverPhoto(shipment)}
          alt="Foto paket"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent sm:hidden" />
        <div className="absolute bottom-2 left-2 sm:hidden">
          <span className="bg-surface/90 backdrop-blur-md px-2 py-1 text-[10px] font-semibold text-ink rounded-lg shadow-sm">
            {shipment.tracking_number}
          </span>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="flex flex-1 w-full flex-col sm:flex-row justify-between sm:items-center gap-4">
        {/* Detail (Kiri-tengah) */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 text-base font-bold text-ink tracking-tight">
              {shipment.shipment_items?.[0]?.item_name ?? "Tanpa Nama"}
            </h3>
            <span className="bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-ink rounded-md border border-border/50 shrink-0">
              {shipment.tracking_number}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-muted/70" />
              <span>{formatDate(shipment.shipment_date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-muted/70" />
              <span>{shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-1">
            <StatusBadge status={paymentStatus} />
            {variant === "shipments" && <StatusBadge status={shipment.status} />}
          </div>
        </div>

        {/* Harga & Aksi (Kanan) */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-2">
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider hidden sm:block">Total</span>
            <span className="text-lg font-bold text-ink">
              {formatCurrency(shipment.total_price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canPay ? (
              <Button
                variant="accent"
                className="h-9 px-4 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 rounded-xl"
                disabled={paymentLoading}
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation(); onPay();
                }}
              >
                {paymentStatus === "failed" ? "Retry" : "Pay"}
              </Button>
            ) : null}

            {paymentStatus === "paid" && (
              <Button
                variant="outline"
                className="h-9 px-3 border border-border/60 bg-surface text-xs font-semibold text-ink hover:bg-slate-50 transition-all rounded-xl shadow-sm"
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation(); onDownload();
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Receipt
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CustomerOrderList({
  title = "Tracking & Shipments",
  description = "Monitor your active shipments, track courier positions, and review your historical deliveries.",
  defaultPaymentStatus = "",
  variant = "shipments",
}: {
  title?: string;
  description?: string;
  defaultPaymentStatus?: string;
  variant?: "shipments" | "payments";
}) {
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState(defaultPaymentStatus || "all");
  const [search, setSearch] = useState("");

  const shipments = useQuery({
    queryKey: ["customer-shipments"],
    queryFn: async () => {
      const response = await apiGet<Shipment[]>(
        "/api/v2/customer/shipments?limit=100",
      );
      return response.data;
    },
  });

  const payment = useMutation({
    mutationFn: async (shipment: Shipment) => {
      const method = shipment.payments?.payment_method;
      const response = await apiPost<{
        redirectUrl?: string | null;
      }>(
        `/api/v2/customer/shipments/${shipment.id}/payments/online`,
        {
          paymentMethod: method && method !== "cash" ? method : "qris",
        },
      );
      return response.data;
    },
    onSuccess(data) {
      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      toast.error("Link pembayaran Midtrans belum tersedia.");
    },
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Pembayaran gagal dibuka.",
      );
    },
  });

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (shipments.data ?? []).filter((shipment) => {
      if (status && status !== "all" && shipment.status !== status) {
        return false;
      }
      if (paymentStatus && paymentStatus !== "all" && shipment.payments?.payment_status !== paymentStatus) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        shipment.tracking_number.toLowerCase().includes(keyword) ||
        shipment.shipment_items?.some((item) =>
          item.item_name.toLowerCase().includes(keyword),
        )
      );
    });
  }, [shipments.data, status, paymentStatus, search]);

  const totalOrders = shipments.data?.length ?? 0;
  const processingOrders =
    shipments.data?.filter(
      (shipment) =>
        shipment.status !== "delivered" && shipment.status !== "cancelled",
    ).length ?? 0;
  const completedOrders =
    shipments.data?.filter((shipment) => shipment.status === "delivered").length ??
    0;
  
  const pendingPayments =
    shipments.data?.filter((shipment) => shipment.payments?.payment_status === "pending").length ?? 0;
  const paidPayments =
    shipments.data?.filter((shipment) => shipment.payments?.payment_status === "paid").length ?? 0;

  const paidTransactionTotal = (shipments.data ?? [])
    .filter((shipment) => shipment.payments?.payment_status === "paid")
    .reduce((total, shipment) => total + Number(shipment.total_price), 0);

  return (
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>
      <section className="space-y-8 font-body select-none">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-muted leading-relaxed">
              {description}
            </p>
          </div>

          {variant === "shipments" && (
            <form 
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const resi = formData.get("tracking") as string;
                if (resi) {
                  window.location.href = `/customer/lacak-resi?tracking=${resi}`;
                }
              }}
            >
              <input 
                name="tracking"
                placeholder="Masukkan nomor resi..."
                className="h-12 w-48 sm:w-64 rounded-2xl border border-border/60 bg-surface px-4 text-sm font-medium outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                required
              />
              <Button
                type="submit"
                variant="accent"
                className="inline-flex h-12 items-center justify-center gap-2 px-6 font-medium text-sm shadow-sm rounded-2xl transition-all whitespace-nowrap"
              >
                <Search size={18} />
                Lacak Resi
              </Button>
            </form>
          )}
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {variant === "shipments" ? (
            <>
              <Summary label="Total Paket" value={totalOrders} />
              <Summary label="Dalam Perjalanan" value={processingOrders} />
              <Summary label="Tiba di Tujuan" value={completedOrders} />
              <Summary
                label="Total Transaksi"
                value={formatCurrency(paidTransactionTotal)}
              />
            </>
          ) : (
            <>
              <Summary label="Total Tagihan" value={totalOrders} />
              <Summary label="Menunggu Pembayaran" value={pendingPayments} />
              <Summary label="Pembayaran Berhasil" value={paidPayments} />
              <Summary
                label="Total Pengeluaran"
                value={formatCurrency(paidTransactionTotal)}
              />
            </>
          )}
        </div>

        {/* Panel Filter Navigasi */}
        <div className="border border-border/50 bg-surface/80 backdrop-blur-xl p-4 shadow-sm rounded-3xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px_240px]">
            <label className="relative flex">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                className="h-10 w-full border border-border/60 bg-background/50 pl-10 pr-4 text-sm font-medium transition-all placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-xl"
                placeholder="Cari resi atau nama paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            {variant === "shipments" && (
              <div className="relative flex">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 w-full rounded-xl bg-background/50 border border-border/60 font-medium">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    <SelectItem value="pending">Menunggu konfirmasi</SelectItem>
                    <SelectItem value="picked_up">Dijemput</SelectItem>
                    <SelectItem value="in_transit">Dalam proses</SelectItem>
                    <SelectItem value="arrived_at_branch">Tiba di cabang</SelectItem>
                    <SelectItem value="delivered">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative flex">
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-10 w-full rounded-xl bg-background/50 border border-border/60 font-medium">
                  <SelectValue placeholder="Semua tagihan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua tagihan</SelectItem>
                  <SelectItem value="pending">Menunggu pembayaran</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="failed">Pembayaran gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {shipments.isLoading ? <OrderSkeleton /> : null}

        {shipments.isError ? (
          <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive rounded-xl">
            Kesalahan memuat paket: {shipments.error instanceof Error ? shipments.error.message : "Gagal memuat"}
          </div>
        ) : null}

        {/* Kondisi Empty State */}
        {!shipments.isLoading && filtered.length === 0 ? (
          <div className="grid min-h-[300px] place-items-center border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-sm rounded-3xl">
            <div className="text-center max-w-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-primary/10 text-primary rounded-full">
                <PackageSearch size={28} />
              </div>
              <h3 className="mt-6 text-base font-semibold text-ink">
                Tidak ada pengiriman
              </h3>
              <p className="mt-2 text-sm font-medium text-muted leading-relaxed">
                Belum ada pengiriman yang sesuai dengan pencarian Anda.
              </p>
              <Link
                href="/customer/buat-pesanan"
                className="btn-primary mt-6 px-6 h-12"
              >
                <Plus size={18} />
                New Shipment
              </Link>
            </div>
          </div>
        ) : null}

        {/* List Pesanan */}
        <div className="flex flex-col gap-4">
          {filtered.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              paymentLoading={payment.isPending}
              onPay={() => payment.mutate(shipment)}
              onDownload={() => downloadReceipt(shipment)}
              variant={variant}
            />
          ))}
        </div>
      </section>
    </div>
  );
}


function Summary({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article className="border border-border/50 bg-surface/80 backdrop-blur-xl p-6 shadow-sm rounded-3xl transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </h2>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row items-center gap-4 p-4 overflow-hidden border border-border/50 bg-surface/80 rounded-3xl animate-pulse"
        >
          <div className="w-full sm:w-28 sm:h-28 bg-slate-100 rounded-2xl shrink-0" />
          <div className="flex flex-1 w-full flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-3 w-full max-w-sm">
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-100" />
                <div className="h-6 w-20 rounded bg-slate-100" />
              </div>
            </div>
            <div className="space-y-3 w-32 sm:items-end flex flex-col">
              <div className="h-4 w-16 rounded bg-slate-100" />
              <div className="h-6 w-full rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}