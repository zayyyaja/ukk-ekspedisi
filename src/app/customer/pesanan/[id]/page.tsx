"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Barcode,
  Calendar,
  CheckCircle2,
  Circle,
  CreditCard,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  Scale,
  Truck,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import type { CurrentUser, Shipment } from "@/types/customer-portal";

// ============================================
// CONSTANTS
// ============================================
const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  picked_up: "Paket Diambil",
  in_transit: "Dalam Perjalanan",
  arrived_at_branch: "Tiba di Cabang",
  out_for_delivery: "Dalam Pengantaran",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Pembayaran Gagal",
};

const STATUS_ORDER = [
  "pending",
  "picked_up",
  "in_transit",
  "arrived_at_branch",
  "out_for_delivery",
  "delivered",
] as const;

// ============================================
// PDF GENERATOR
// ============================================
function downloadReceipt(shipment: Shipment) {
  const sender = shipment.customers_shipments_sender_idTocustomers;
  const receiver = shipment.customers_shipments_receiver_idTocustomers;
  const payment = shipment.payments;
  const document = new jsPDF();

  document.setFillColor(15, 23, 42);
  document.rect(0, 0, 210, 38, "F");
  document.setTextColor(255, 255, 255);
  document.setFontSize(20);
  document.text("EKSPEDISI ONLINE", 14, 16);
  document.setFontSize(11);
  document.text("Digital Shipping Receipt", 14, 27);
  document.setTextColor(15, 23, 42);
  document.setFontSize(20);
  document.text(shipment.tracking_number, 14, 52);
  document.setFontSize(11);

  const rows = [
    ["Nama Paket", shipment.shipment_items?.[0]?.item_name ?? "-"],
    ["Pengirim", sender?.name ?? "-"],
    ["Penerima", receiver?.name ?? "-"],
    ["Telepon", receiver?.phone ?? "-"],
    ["Email", receiver?.email ?? "-"],
    ["Alamat Tujuan", receiver?.address ?? receiver?.city ?? "-"],
    ["Cabang Asal", shipment.branches_shipments_origin_branch_idTobranches?.name ?? "-"],
    ["Cabang Tujuan", shipment.branches_shipments_destination_branch_idTobranches?.name ?? "-"],
    ["Berat", `${shipment.total_weight} kg`],
    ["Metode Pembayaran", payment?.payment_method ?? "-"],
    ["Status Pembayaran", payment?.payment_status ?? "-"],
    ["Status Pengiriman", shipment.status],
    ["Biaya", formatCurrency(shipment.total_price)],
    ["Tanggal", formatDate(shipment.shipment_date)],
  ];

  rows.forEach(([label, value], index) => {
    const y = 66 + index * 9;
    document.setTextColor(100, 116, 139);
    document.text(label, 14, y);
    document.setTextColor(15, 23, 42);
    document.text(String(value), 68, y, { maxWidth: 125 });
  });

  document.save(`resi-${shipment.tracking_number}.pdf`);
}

// ============================================
// CUSTOM HOOKS
// ============================================
function useShipmentDetail(id: string) {
  return useQuery({
    queryKey: ["customer-shipment", id],
    queryFn: async () => {
      const response = await apiGet<Shipment>(`/api/v1/customer/shipments/${id}`);
      return response.data;
    },
    refetchInterval: 4_000,
    enabled: Boolean(id),
  });
}

function usePayment(shipment: Shipment | undefined, shipmentId: string, onSync: () => void) {
  return useMutation({
    mutationFn: async () => {
      const method = shipment?.payments?.payment_method;
      const response = await apiPost<{ redirectUrl?: string | null }>(
        `/api/v1/customer/shipments/${shipmentId}/payments/online`,
        { paymentMethod: method && method !== "cash" ? method : "qris" },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      toast.error("Link pembayaran Midtrans belum tersedia.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Pembayaran gagal dibuka.");
    },
  });
}

function useCancelOrder(shipmentId: string, onSuccess: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiPatch(
        `/api/v1/customer/shipments/${shipmentId}/cancel`,
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan.");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan pesanan.");
    },
  });
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: shipment,
    isLoading,
    isError,
    error,
    refetch,
  } = useShipmentDetail(params.id);
  const currentUser = useQuery({
    queryKey: ["customer-current-user"],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data as CurrentUser;
    },
  });

  const paymentMutation = usePayment(shipment, params.id, () => refetch());

  const cancelMutation = useCancelOrder(params.id, () => {
    setShowCancelDialog(false);
    refetch();
  });

  const paymentSync = useMutation({
    mutationFn: async () => {
      const response = await apiPost(
        `/api/v1/customer/shipments/${params.id}/payments/sync`,
      );
      return response.data;
    },
    onSuccess: () => refetch(),
    onError: () => {
      toast.warning("Status pembayaran belum bisa disinkronkan.");
    },
  });

  useEffect(() => {
    if (searchParams.get("payment") === "finish") {
      paymentSync.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, searchParams]);

  const derivedState = useMemo(() => {
    if (!shipment) return null;

    const paymentStatus = shipment.payments?.payment_status ?? "pending";
    const isCash = shipment.payments?.payment_method === "cash";
    const canPay =
      !isCash &&
      (paymentStatus === "pending" || paymentStatus === "failed") &&
      shipment.status !== "cancelled";
    const isPendingAdditional =
      paymentStatus === "pending" && shipment.status !== "pending";
    const packageName = shipment.shipment_items?.[0]?.item_name ?? "Paket ekspedisi";
    const canCancel =
      String(shipment.customers_shipments_sender_idTocustomers?.id ?? "") === String(currentUser.data?.id ?? "") &&
      paymentStatus !== "paid" &&
      shipment.status !== "cancelled" &&
      shipment.status !== "delivered" &&
      shipment.status !== "out_for_delivery" &&
      shipment.status === "pending";

    return {
      paymentStatus,
      isCash,
      canPay,
      isPendingAdditional,
      packageName,
      canCancel,
    };
  }, [shipment, currentUser.data?.id]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !shipment || !derivedState) {
    return (
      <CustomerNavbarShell>
        <div className="alert error">
          {error instanceof Error ? error.message : "Detail pesanan tidak ditemukan."}
        </div>
      </CustomerNavbarShell>
    );
  }

  const data = shipment;
  const { paymentStatus, canPay, isPendingAdditional, packageName, canCancel } = derivedState;
  const packagePhoto = data.shipment_items?.[0]?.photo ?? data.photo;
  const origin = data.branches_shipments_origin_branch_idTobranches;
  const destination = data.branches_shipments_destination_branch_idTobranches;
  const sender = data.customers_shipments_sender_idTocustomers;
  const receiver = data.customers_shipments_receiver_idTocustomers;
  const handoverLabel = data.handover_method === "pickup" ? "Jemput Paket" : "Drop off";

  const paymentLabel = paymentMutation.isPending
    ? "Membuka Midtrans..."
    : paymentStatus === "failed"
      ? "Coba Bayar Lagi"
      : isPendingAdditional
        ? "Bayar Selisih"
        : "Bayar Sekarang";

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
        <BackLink />

        <ShipmentAlerts
          showPaymentFinish={searchParams.get("payment") === "finish"}
          isPendingAdditional={isPendingAdditional}
          isCashPending={derivedState.isCash && paymentStatus === "pending"}
        />

        {/* Resi Number Section */}
        <div className="overflow-hidden rounded-2xl border-2 border-orange-500 bg-orange-500 shadow-sm">
          <div className="px-6 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-100">
              Nomor Resi Pengiriman
            </p>

            <p className="mt-2 font-mono text-3xl font-black tracking-widest text-white">
              {data.tracking_number}
            </p>
          </div>
        </div>

        {/* Main Layout - 2 Columns */}
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            <PackageHeroCard
              packagePhoto={packagePhoto}
              packageName={packageName}
              trackingNumber={data.tracking_number}
              shipmentDate={data.shipment_date}
            />

            <StatusSection
              shipmentStatus={data.status}
              paymentStatus={paymentStatus}
              receiver={receiver}
            />

            <RouteInfo
              origin={origin}
              destination={destination}
              weight={data.total_weight}
            />

            <TrackingTimeline shipment={data} />
          </div>

          {/* RIGHT COLUMN - Payment Summary */}
          <div className="space-y-5">
            <PaymentSummary
              shipment={data}
              packageName={packageName}
              handoverLabel={handoverLabel}
              canPay={canPay}
              canCancel={canCancel}
              paymentStatus={paymentStatus}
              paymentLabel={paymentLabel}
              isPaying={paymentMutation.isPending}
              onPay={() => paymentMutation.mutate()}
              onCancel={() => setShowCancelDialog(true)}
              onDownload={() => downloadReceipt(data)}
            />
          </div>
        </div>
      </div>

      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={() => cancelMutation.mutate()}
        isPending={cancelMutation.isPending}
      />
    </CustomerNavbarShell>
  );
}

// ============================================
// SUB COMPONENTS
// ============================================

function BackLink() {
  return (
    <Link
      href="/customer/lacak-paket"
      className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-600"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      Kembali ke Daftar Pesanan
    </Link>
  );
}

function ShipmentAlerts({
  showPaymentFinish,
  isPendingAdditional,
  isCashPending,
}: {
  showPaymentFinish: boolean;
  isPendingAdditional: boolean;
  isCashPending: boolean;
}) {
  return (
    <>
      {showPaymentFinish && (
        <div className="alert success">
          Pembayaran selesai diproses. Sistem sedang menyinkronkan status dari Midtrans.
        </div>
      )}
      {isPendingAdditional && (
        <div className="alert warning">
          Terdapat selisih biaya hasil validasi fisik oleh kasir. Silakan lunasi kekurangan
          untuk melanjutkan pengiriman.
        </div>
      )}
      {isCashPending && (
        <div className="alert">
          Pembayaran cash menunggu konfirmasi kasir. Bawa paket dan nomor resi ini ke cabang
          asal sebelum batas 24 jam.
        </div>
      )}
    </>
  );
}

function PackageHeroCard({
  packagePhoto,
  packageName,
  trackingNumber,
  shipmentDate,
}: {
  packagePhoto?: string | null;
  packageName: string;
  trackingNumber: string;
  shipmentDate: string;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
        {packagePhoto ? (
          <Image
            src={packagePhoto}
            alt={packageName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur">
                <Package size={48} className="text-orange-500" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                Foto paket belum tersedia
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
            Paket Ekspedisi
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            {packageName}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
            <Calendar size={14} />
            <span>Dipesan pada {formatDate(shipmentDate)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusSection({
  shipmentStatus,
  paymentStatus,
  receiver,
}: {
  shipmentStatus: string;
  paymentStatus: string;
  receiver?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}) {
  const hasReceiverInfo =
    receiver &&
    (receiver.name ||
      receiver.phone ||
      receiver.email ||
      receiver.address ||
      receiver.city);

  const fullAddress = [receiver?.address, receiver?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Status Badges */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Shipment Status */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Package size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status Pengiriman
              </p>
              <div className="mt-1">
                <StatusBadge status={shipmentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <CreditCard size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status Pembayaran
              </p>
              <div className="mt-1">
                <StatusBadge status={paymentStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Info - Complete */}
      {hasReceiverInfo && (
        <div className="mt-4 overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-orange-100 bg-orange-100/50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 shadow-sm">
              <User size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                Informasi Penerima
              </p>
              <p className="mt-0.5 text-base font-bold text-slate-900">
                {receiver?.name ?? "-"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-0 divide-y divide-orange-100">
            {/* Phone */}
            {receiver?.phone && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Phone size={14} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nomor Telepon
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {receiver.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            {receiver?.email && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Mail size={14} className="text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                    {receiver.email}
                  </p>
                </div>
              </div>
            )}

            {/* Address */}
            {fullAddress && (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <MapPin size={14} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Alamat Tujuan
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed text-slate-900">
                    {fullAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RouteInfo({
  origin,
  destination,
  weight,
}: {
  origin?: { name?: string | null; city?: string | null } | null;
  destination?: { name?: string | null; city?: string | null } | null;
  weight: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Truck size={18} className="text-orange-600" />
        <h3 className="text-base font-bold text-slate-900">Rute Pengiriman</h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        {/* Origin */}
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Warehouse size={14} />
            Asal
          </div>
          <p className="mt-2 text-base font-bold text-slate-900">{origin?.name ?? "-"}</p>
          <p className="text-sm text-slate-500">{origin?.city ?? "-"}</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <ArrowRight size={18} className="text-orange-600" />
          </div>
        </div>

        {/* Destination */}
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
            <MapPin size={14} />
            Tujuan
          </div>
          <p className="mt-2 text-base font-bold text-slate-900">{destination?.name ?? "-"}</p>
          <p className="text-sm text-slate-500">{destination?.city ?? "-"}</p>
        </div>
      </div>

      {/* Weight */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
        <Scale size={16} className="text-orange-600" />
        <span className="text-sm font-semibold text-slate-700">Berat Paket</span>
        <span className="ml-auto text-base font-bold text-slate-900">{weight} kg</span>
      </div>
    </div>
  );
}

function PaymentSummary({
  shipment,
  packageName,
  handoverLabel,
  canPay,
  canCancel,
  paymentStatus,
  paymentLabel,
  isPaying,
  onPay,
  onCancel,
  onDownload,
}: {
  shipment: Shipment;
  packageName: string;
  handoverLabel: string;
  canPay: boolean;
  canCancel: boolean;
  paymentStatus: string;
  paymentLabel: string;
  isPaying: boolean;
  onPay: () => void;
  onCancel: () => void;
  onDownload: () => void;
}) {
  return (
    <article className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Ringkasan Pembayaran
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black">
            {formatCurrency(shipment.total_price)}
          </span>
        </div>
        <div className="mt-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
            {shipment.payments?.payment_method === "cash"
              ? "Cash"
              : shipment.payments?.payment_method?.toUpperCase() ?? "-"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 p-6">
        <SummaryRow label="Nama Paket" value={packageName} />
        <SummaryRow label="Berat" value={`${shipment.total_weight} kg`} />
        <SummaryRow label="Metode Penyerahan" value={handoverLabel} />
        <SummaryRow label="Tanggal" value={formatDate(shipment.shipment_date)} />

        <div className="my-3 border-t border-dashed border-slate-200" />

        <SummaryRow
          label="Biaya Pengiriman"
          value={formatCurrency(shipment.total_price)}
          highlight
        />
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-5">
        {canPay && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md disabled:opacity-60"
            disabled={isPaying}
            onClick={onPay}
            type="button"
          >
            <CreditCard size={18} />
            {paymentLabel}
          </button>
        )}

        {paymentStatus === "paid" && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
            onClick={onDownload}
            type="button"
          >
            <Download size={18} />
            Download Resi PDF
          </button>
        )}

        {canCancel && (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50"
            onClick={onCancel}
            type="button"
          >
            <XCircle size={18} />
            Batalkan Pesanan
          </button>
        )}

        {shipment.status === "cancelled" && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
            Pesanan Telah Dibatalkan
          </div>
        )}

        {paymentStatus === "failed" && !canPay && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
            Pesanan Kedaluwarsa
          </div>
        )}
      </div>
    </article>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`font-semibold ${highlight ? "text-lg text-orange-600" : "text-sm text-slate-900"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function TrackingTimeline({ shipment }: { shipment: Shipment }) {
  const trackings = useMemo(
    () =>
      [...(shipment.shipment_trackings ?? [])].sort(
        (a, b) => new Date(a.tracked_at).getTime() - new Date(b.tracked_at).getTime(),
      ),
    [shipment.shipment_trackings],
  );

  const currentStatusIndex = useMemo(
    () => STATUS_ORDER.indexOf(shipment.status as never),
    [shipment.status],
  );

  const progressPercent = useMemo(() => {
    if (trackings.length === 0) return 0;
    return Math.round(((currentStatusIndex + 1) / STATUS_ORDER.length) * 100);
  }, [currentStatusIndex, trackings.length]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Progress Pengiriman
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Timeline Tracking</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-orange-600">{progressPercent}%</p>
            <p className="text-xs text-slate-500">Selesai</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {STATUS_ORDER.slice(0, 5).map((step, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <StepIndicator isActive={isActive} isCurrent={isCurrent} />
                  <p
                    className={`mt-2 hidden text-center text-[10px] font-semibold uppercase tracking-wide sm:block ${isActive ? "text-orange-600" : "text-slate-400"
                      }`}
                  >
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
                {index < 4 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 transition-all ${index < currentStatusIndex ? "bg-orange-500" : "bg-slate-200"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {trackings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Package size={28} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              Menunggu konfirmasi dari ekspedisi
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Timeline akan muncul setelah paket diproses
            </p>
          </div>
        ) : (
          <ol className="relative space-y-0">
            {trackings.map((tracking, index) => (
              <TimelineItem
                key={tracking.id}
                tracking={tracking}
                isFirst={index === 0}
                isLast={index === trackings.length - 1}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function StepIndicator({ isActive, isCurrent }: { isActive: boolean; isCurrent: boolean }) {
  const baseClass =
    "flex h-8 w-8 items-center justify-center rounded-full transition-all";
  const stateClass = !isActive
    ? "bg-slate-200"
    : isCurrent
      ? "bg-orange-500 ring-4 ring-orange-100"
      : "bg-orange-500";

  return (
    <div className={`${baseClass} ${stateClass}`}>
      {isActive ? (
        <CheckCircle2 size={16} className="text-white" />
      ) : (
        <Circle size={16} className="text-slate-400" />
      )}
    </div>
  );
}

function TimelineItem({
  tracking,
  isFirst,
  isLast,
}: {
  tracking: NonNullable<Shipment["shipment_trackings"]>[number];
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <li className="relative grid grid-cols-[32px_1fr] gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          className={`absolute left-[15px] top-8 h-full w-0.5 ${isFirst ? "bg-orange-500" : "bg-slate-200"
            }`}
        />
      )}

      <div className="relative z-10 flex justify-center pt-1">
        {isFirst ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 ring-4 ring-orange-100">
            <CheckCircle2 size={16} className="text-white" />
          </span>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
            <Circle size={12} className="text-slate-400" />
          </span>
        )}
      </div>

      <div
        className={`rounded-2xl p-4 transition-all ${isFirst
          ? "border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm"
          : "bg-slate-50"
          }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong
            className={`text-sm font-bold capitalize ${isFirst ? "text-orange-700" : "text-slate-900"
              }`}
          >
            {tracking.status.replaceAll("_", " ")}
          </strong>
          <span className="text-xs font-medium text-slate-500">
            {formatDate(tracking.tracked_at)}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-600">{tracking.description ?? "-"}</p>
        {tracking.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} />
            {tracking.location}
          </p>
        )}
      </div>
    </li>
  );
}

function CancelConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isPending && onOpenChange(false)}
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={28} className="text-red-600" />
        </div>

        <h3 className="mt-4 text-xl font-bold text-slate-900">Batalkan Pesanan?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Pesanan yang dibatalkan tidak dapat dikembalikan. Apakah Anda yakin ingin
          melanjutkan?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={isPending}
          >
            Tidak, Kembali
          </button>
          <button
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            type="button"
            disabled={isPending}
          >
            {isPending ? "Memproses..." : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-20 animate-pulse rounded-2xl border-2 border-orange-200 bg-slate-200" />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="h-[400px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
          </div>
          <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>
    </CustomerNavbarShell>
  );
}
