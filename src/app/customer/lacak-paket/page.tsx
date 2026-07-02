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

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

import { apiGet, apiPost } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";
import {
  formatCurrency,
  formatDate,
} from "@/lib/customer-format";

import type { CurrentUser, Shipment } from "@/types/customer-portal";

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
  currentUserId,
}: {
  shipment: Shipment;
  paymentLoading: boolean;
  onPay: () => void;
  onDownload: () => void;
  currentUserId?: string | number;
}) {
  const paymentStatus = shipment.payments?.payment_status;
  const isReceiverInbox = String(shipment.customers_shipments_receiver_idTocustomers?.id ?? "") === String(currentUserId ?? "") &&
    String(shipment.customers_shipments_sender_idTocustomers?.id ?? "") !== String(currentUserId ?? "");
  const canPay = !isReceiverInbox && (paymentStatus === "pending" || paymentStatus === "failed");

  return (
    <Link
      href={`/customer/pesanan/${shipment.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      {/* Cover */}
      <div className="relative aspect-[16/8] overflow-hidden bg-orange-50">
        <img
          src="/images/package-card.jpg"
          alt="Shipment"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        <div className="absolute bottom-5 left-5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600 backdrop-blur">
            {isReceiverInbox ? "Inbox Penerima" : shipment.tracking_number}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title */}
        <div>
          <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
            {shipment.shipment_items?.[0]?.item_name ?? "Paket Ekspedisi"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nomor Resi
          </p>

          <p className="font-mono font-semibold text-orange-600">
            {shipment.tracking_number}
          </p>
          {isReceiverInbox && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
              Shipment diterima dari pengirim
            </p>
          )}
        </div>

        {/* Information */}
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
                {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
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

        {/* Price */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Total Harga
          </p>

          <h4 className="mt-2 text-3xl font-black text-orange-600">
            {formatCurrency(shipment.total_price)}
          </h4>
        </div>

        {/* Action */}
        <div className="mt-auto pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            {canPay ? (
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={paymentLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPay();
                }}
                type="button"
              >
                {paymentStatus === "failed" ? "Coba Bayar Lagi" : "Bayar Sekarang"}
              </Button>
            ) : (
              <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
                Lihat Detail
                <ArrowRight className="h-4 w-4" />
              </span>
            )}

            {paymentStatus === "paid" && (
              <Button
                variant="outline"
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload();
                }}
                type="button"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CustomerOrderListPage() {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const currentUser = useQuery({
    queryKey: ["customer-current-user"],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data as CurrentUser;
    },
  });

  const shipments = useQuery({
    queryKey: ["customer-shipments"],
    queryFn: async () => {
      const response = await apiGet<Shipment[]>(
        "/api/v1/customer/shipments?limit=100",
      );
      return response.data;
    },
    refetchInterval: 4000,
  });

  const payment = useMutation({
    mutationFn: async (shipment: Shipment) => {
      const method = shipment.payments?.payment_method;
      const response = await apiPost<{
        redirectUrl?: string | null;
      }>(
        `/api/v1/customer/shipments/${shipment.id}/payments/online`,
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
      if (status && shipment.status !== status) {
        return false;
      }
      if (paymentStatus && shipment.payments?.payment_status !== paymentStatus) {
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
  const paidTransactionTotal = (shipments.data ?? [])
    .filter((shipment) => shipment.payments?.payment_status === "paid")
    .reduce((total, shipment) => total + Number(shipment.total_price), 0);

  return (
    <CustomerNavbarShell>
      <section className="space-y-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-orange-600">
              Pengiriman Anda
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Cari Paket
            </h1>
            <p className="mt-3 max-w-2xl text-slate-500">
              Pantau seluruh pengiriman paket, status pembayaran, serta perjalanan
              paket Anda secara realtime.
            </p>
          </div>

          <Link
            href="/customer/buat-pesanan"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={18} />
            Buat Pesanan
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Summary label="Total Pesanan" value={totalOrders} />
          <Summary label="Sedang Diproses" value={processingOrders} />
          <Summary label="Selesai" value={completedOrders} />
          <Summary
            label="Total Transaksi"
            value={formatCurrency(paidTransactionTotal)}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Cari nomor resi atau nama paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="relative">
              <Funnel
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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

            <select
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">Semua Pembayaran</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {shipments.isLoading ? <OrderSkeleton /> : null}

        {shipments.isError ? (
          <div className="alert error">
            {shipments.error instanceof Error
              ? shipments.error.message
              : "Gagal memuat data."}
          </div>
        ) : null}

        {!shipments.isLoading && filtered.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10">
            <div className="text-center">
              <PackageSearch
                size={42}
                className="mx-auto text-slate-400"
              />
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Belum ada pesanan
              </h3>
              <p className="mt-2 text-slate-500">
                Buat pesanan pertama Anda untuk mulai melakukan pengiriman paket.
              </p>
              <Link
                href="/customer/buat-pesanan"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                <Plus size={18} />
                Buat Pesanan
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              paymentLoading={payment.isPending}
              onPay={() => payment.mutate(shipment)}
              onDownload={() => downloadReceipt(shipment)}
              currentUserId={currentUser.data?.id}
            />
          ))}
        </div>
      </section>
    </CustomerNavbarShell>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </h2>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="animate-pulse">
            <div className="aspect-[16/8] bg-slate-200" />
            <div className="space-y-4 p-6">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="h-5 w-64 rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 rounded bg-slate-200" />
                <div className="h-10 rounded bg-slate-200" />
              </div>
              <div className="h-20 rounded-2xl bg-slate-200" />
              <div className="h-12 w-full rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
