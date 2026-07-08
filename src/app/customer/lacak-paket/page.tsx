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
}: {
  shipment: Shipment;
  paymentLoading: boolean;
  onPay: () => void;
  onDownload: () => void;
}) {
  const paymentStatus = shipment.payments?.payment_status;
  const canPay = paymentStatus === "pending" || paymentStatus === "failed";

  return (
    <Link
      href={`/customer/pesanan/${shipment.id}`}
      className="group flex h-full flex-col overflow-hidden border-4 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-sm transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
    >
      {/* Cover Gambar */}
      <div className="relative aspect-[16/8] overflow-hidden bg-amber-50 border-b-4 border-slate-900">
        <img
          src={getShipmentCoverPhoto(shipment)}
          alt="Foto paket"
          className="h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0 group-hover:scale-102"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />

        <div className="absolute bottom-4 left-4">
          <span className="border-2 border-slate-900 bg-white px-2.5 py-1 text-3xs font-black uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm">
            #{shipment.tracking_number}
          </span>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="line-clamp-2 text-md font-black text-slate-900 uppercase tracking-wide">
            {shipment.shipment_items?.[0]?.item_name ?? "PAKET_DOMESTIK"}
          </h3>

          <p className="mt-3 text-3xs font-bold uppercase tracking-wider text-slate-400">
            // NOMOR_RESI_PELACAKAN
          </p>
          <p className="text-sm font-black text-amber-600">
            {shipment.tracking_number}
          </p>
        </div>

        {/* Informasi Rincian */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t-2 border-dashed border-slate-200 pt-4">
          <div className="flex items-start gap-2">
            <div className="border-2 border-slate-900 bg-amber-400 p-1.5 rounded-sm shrink-0">
              <CalendarDays size={14} className="text-slate-900 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-3xs font-black uppercase tracking-wider text-slate-400">TANGGAL</p>
              <p className="text-2xs font-bold text-slate-800 mt-0.5">
                {formatDate(shipment.shipment_date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="border-2 border-slate-900 bg-amber-400 p-1.5 rounded-sm shrink-0">
              <MapPin size={14} className="text-slate-900 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-3xs font-black uppercase tracking-wider text-slate-400">TUJUAN</p>
              <p className="text-2xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                {shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Monitoring */}
        <div className="mt-4 space-y-2 border-2 border-slate-900 bg-slate-50 p-3 rounded-sm">
          <div className="flex items-center justify-between text-3xs font-black uppercase tracking-wider">
            <span className="text-slate-500">PEMBAYARAN:</span>
            <StatusBadge status={paymentStatus} />
          </div>

          <div className="flex items-center justify-between text-3xs font-black uppercase tracking-wider border-t border-slate-200 pt-2">
            <span className="text-slate-500">PENGIRIMAN:</span>
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        {/* Harga Total */}
        <div className="mt-4 border-t-2 border-slate-900 pt-3">
          <p className="text-3xs font-black uppercase tracking-wider text-slate-400">
            TOTAL BIAYA OPERASIONAL
          </p>
          <h4 className="text-lg font-black text-slate-900 mt-0.5">
            {formatCurrency(shipment.total_price)}
          </h4>
        </div>

        {/* Blok Tombol Aksi */}
        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {canPay ? (
              <Button
                className="flex-1 rounded-sm border-2 border-slate-900 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-3xs uppercase tracking-widest transition-all h-10"
                disabled={paymentLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPay();
                }}
                type="button"
              >
                {paymentStatus === "failed" ? "COBA BAYAR ULANG" : "BAYAR SEKARANG"}
              </Button>
            ) : (
              <span className="flex flex-1 items-center justify-center gap-1.5 border-2 border-slate-900 bg-slate-900 px-3 py-2 text-3xs font-black uppercase tracking-widest text-white rounded-sm h-10">
                LIHAT DETAIL
                <ArrowRight className="h-3 w-3 stroke-[3]" />
              </span>
            )}

            {paymentStatus === "paid" && (
              <Button
                variant="outline"
                className="flex-1 rounded-sm border-2 border-slate-900 bg-white font-black text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-3xs uppercase tracking-widest transition-all h-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload();
                }}
                type="button"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                UNDUH RESI
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
      <section className="space-y-8 font-mono select-none">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end border-b-4 border-slate-900 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
              // DASHBOARD_PELANGGAN
            </p>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-wide text-slate-900">
              MONITORING_PAKET
            </h1>
            <p className="mt-2 max-w-2xl text-xs font-bold leading-relaxed text-slate-500">
              Pantau manifes pengiriman, verifikasi pelunasan invoice, serta pelacakan node 
              posisi kurir secara terintegrasi dan berkala.
            </p>
          </div>

          <Link
            href="/customer/buat-pesanan"
            className="inline-flex h-12 items-center justify-center gap-2 border-4 border-slate-900 bg-amber-400 px-6 font-black text-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest rounded-sm transition-all"
          >
            <Plus size={16} className="stroke-[3]" />
            BUAT MANIFES BARU
          </Link>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Summary label="TOTAL MANIFES" value={totalOrders} />
          <Summary label="DALAM TRANSIT" value={processingOrders} />
          <Summary label="DONE_DELIVERED" value={completedOrders} />
          <Summary
            label="KUMULATIF TRANSAKSI"
            value={formatCurrency(paidTransactionTotal)}
          />
        </div>

        {/* Panel Filter Navigasi */}
        <div className="border-4 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_240px]">
            <label className="relative flex">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 stroke-[2.5]"
              />
              <input
                className="h-11 w-full border-2 border-slate-900 bg-white pl-11 pr-4 text-2xs font-bold uppercase tracking-wide placeholder:text-slate-400 focus:bg-amber-50/20 focus:outline-none rounded-sm"
                placeholder="INPUT NO RESI / ID BARANG..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="relative flex">
              <Funnel
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 stroke-[2.5]"
              />
              <select
                className="h-11 w-full appearance-none border-2 border-slate-900 bg-white pl-11 pr-10 text-2xs font-black uppercase tracking-widest focus:outline-none cursor-pointer rounded-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">[ SEMUA STATUS ]</option>
                <option value="pending">PENDING</option>
                <option value="picked_up">PICKED UP</option>
                <option value="in_transit">IN TRANSIT</option>
                <option value="arrived_at_branch">ARRIVED AT BRANCH</option>
                <option value="delivered">DELIVERED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>

            <div className="relative flex">
              <select
                className="h-11 w-full appearance-none border-2 border-slate-900 bg-white px-4 text-2xs font-black uppercase tracking-widest focus:outline-none cursor-pointer rounded-sm"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="">[ STATUS INVOICE ]</option>
                <option value="pending">PENDING</option>
                <option value="paid">PAID</option>
                <option value="failed">FAILED</option>
              </select>
            </div>
          </div>
        </div>

        {shipments.isLoading ? <OrderSkeleton /> : null}

        {shipments.isError ? (
          <div className="border-4 border-slate-900 bg-rose-100 p-4 text-3xs font-black uppercase tracking-wider text-rose-950 rounded-sm">
            [ LOG_ERROR_FETCH ]: {shipments.error instanceof Error ? shipments.error.message : "GAGAL_MEMUAT_MANIFES"}
          </div>
        ) : null}

        {/* Kondisi Empty State */}
        {!shipments.isLoading && filtered.length === 0 ? (
          <div className="grid min-h-[300px] place-items-center border-4 border-dashed border-slate-400 bg-white p-8 rounded-sm">
            <div className="text-center max-w-sm">
              <PackageSearch
                size={40}
                className="mx-auto text-slate-900 stroke-[2]"
              />
              <h3 className="mt-4 text-md font-black uppercase tracking-wide text-slate-900">
                MANIFES_TIDAK_DITEMUKAN
              </h3>
              <p className="mt-1 text-3xs font-bold text-slate-500 uppercase leading-relaxed">
                Belum ada berkas pengiriman terdaftar atau filter pencarian tidak cocok.
              </p>
              <Link
                href="/customer/buat-pesanan"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 border-2 border-slate-900 bg-amber-400 px-5 text-3xs font-black uppercase tracking-widest text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm transition-all"
              >
                <Plus size={14} className="stroke-[3]" />
                ISIKAN FORM PESANAN
              </Link>
            </div>
          </div>
        ) : null}

        {/* Grid Grid Kartu Pesanan */}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              paymentLoading={payment.isPending}
              onPay={() => payment.mutate(shipment)}
              onDownload={() => downloadReceipt(shipment)}
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
    <article className="border-4 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
      <p className="text-3xs font-black uppercase tracking-wider text-slate-400">// {label}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 uppercase">
        {value}
      </h2>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden border-4 border-slate-900 bg-white rounded-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        >
          <div className="animate-pulse">
            <div className="aspect-[16/8] bg-slate-200 border-b-4 border-slate-900" />
            <div className="space-y-4 p-5">
              <div className="h-5 w-1/2 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 rounded bg-slate-200" />
                <div className="h-8 rounded bg-slate-200" />
              </div>
              <div className="h-14 rounded bg-slate-200" />
              <div className="h-10 w-full rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}