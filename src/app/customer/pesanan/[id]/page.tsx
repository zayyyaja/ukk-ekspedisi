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

import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import {
  getShipmentDeliveryProof,
  getShipmentPackagePhoto,
} from "@/lib/shipment-photos";
import type { CurrentUser, Shipment } from "@/types/customer-portal";
import { BentoHeader } from "@/components/customer/bento-header";

// ============================================
// CONSTANTS
// ============================================
const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  picked_up: "Paket Diambil",
  in_transit: "Dalam Perjalanan",
  arrived_at_branch: "Tiba di Cabang",
  out_for_delivery: "Sedang Diantar",
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
      const response = await apiGet<Shipment>(`/api/v2/customer/shipments/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
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

  // Mutasi Pembayaran Online Midtrans
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const method = shipment?.payments?.payment_method;
      const response = await apiPost<{ redirectUrl?: string | null }>(
        `/api/v2/customer/shipments/${params.id}/payments/online`,
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
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Pembayaran gagal dibuka.");
    },
  });

  // Mutasi Pembatalan Pesanan
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiPatch(
        `/api/v2/customer/shipments/${params.id}/cancel`,
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan.");
      setShowCancelDialog(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal membatalkan pesanan.");
    },
  });

  // Sinkronisasi status pembayaran otomatis
  const paymentSync = useMutation({
    mutationFn: async () => {
      const response = await apiPost(
        `/api/v2/customer/shipments/${params.id}/payments/sync`,
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
      <div className="w-full font-body">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
          <BentoHeader />
        </div>
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 font-body">
          <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive rounded-xl">
            Kesalahan: {error instanceof Error ? error.message : "Detail pesanan tidak ditemukan."}
          </div>
        </div>
      </div>
    );
  }

  const data = shipment;
  const { paymentStatus, canPay, isPendingAdditional, packageName, canCancel } = derivedState;
  const packagePhoto = getShipmentPackagePhoto(data);
  const deliveryProofPhoto = getShipmentDeliveryProof(data);
  const origin = data.branches_shipments_origin_branch_idTobranches;
  const destination = data.branches_shipments_destination_branch_idTobranches;
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
    <div className="w-full font-body">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 font-body select-none pb-16">
        <BackLink />

        <ShipmentAlerts
          showPaymentFinish={searchParams.get("payment") === "finish"}
          isPendingAdditional={isPendingAdditional}
          isCashPending={derivedState.isCash && paymentStatus === "pending"}
        />

        {/* Resi Number Section - Neo Minimalist Style */}
        <div className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden relative">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <div className="px-6 py-10 text-center relative z-10">
            <p className="text-xs font-semibold uppercase tracking-tight text-primary mb-3">
              Tracking Number
            </p>
            <p className="font-mono text-4xl sm:text-6xl font-semibold tracking-wider text-ink drop-shadow-sm">
              {data.tracking_number || "Waiting for Verification"}
            </p>
          </div>
        </div>

        {/* Main Layout - 2 Columns */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">

          {/* KOLOM KIRI (7 Kolom konten utama) */}
          <div className="space-y-6">
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

            {deliveryProofPhoto && (
              <DeliveryProofCard photoUrl={deliveryProofPhoto} />
            )}
          </div>

          {/* KOLOM KANAN (Ringkasan Pembayaran & Aksi) */}
          <div className="space-y-6 lg:sticky lg:top-24">
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
    </div>
  );
}

// ============================================
// SUB COMPONENTS
// ============================================

function BackLink() {
  return (
    <Link
      href="/customer/lacak-resi"
      className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
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
    <div className="space-y-3">
      {showPaymentFinish && (
        <div className="border border-green-500/20 bg-green-500/10 p-4 text-sm font-medium text-green-700 rounded-xl">
          Pembayaran berhasil. Sistem sedang memproses status pembayaran Anda.
        </div>
      )}
      {isPendingAdditional && (
        <div className="border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-700 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>Terdapat selisih biaya dari validasi petugas. Silakan lunasi sisa tagihan untuk melanjutkan pengiriman.</span>
        </div>
      )}
      {isCashPending && (
        <div className="border border-sky-500/20 bg-sky-500/10 p-4 text-sm font-medium text-sky-700 rounded-xl">
          Pembayaran tunai menunggu konfirmasi. Mohon tunjukkan resi ini kepada petugas di cabang.
        </div>
      )}
    </div>
  );
}

function DeliveryProofCard({ photoUrl }: { photoUrl: string }) {
  return (
    <article className="border border-border bg-surface shadow-sm rounded-2xl overflow-hidden">
      <div className="border-b border-border bg-slate-50 px-6 py-4">
        <h2 className="text-sm font-semibold text-ink">Bukti Serah Terima</h2>
        <p className="text-xs font-medium text-muted mt-1">
          Dokumentasi fisik penerimaan paket.
        </p>
      </div>
      <div className="p-6 bg-surface">
        <img
          alt="Bukti paket diterima"
          className="h-72 w-full object-cover rounded-xl border border-border"
          src={photoUrl}
        />
      </div>
    </article>
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
    <article className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
      <div className="relative aspect-[21/9] w-full bg-slate-100">
        {packagePhoto ? (
          <Image
            src={packagePhoto}
            alt={packageName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority
            unoptimized={packagePhoto.startsWith("/uploads/")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50/50">
            <div className="text-center p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-primary/10 text-primary rounded-2xl">
                <Package size={28} />
              </div>
              <p className="mt-4 text-xs font-medium text-muted">
                No package photo available
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-tight text-primary mb-2">
            Package Information
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-3 drop-shadow-md">
            {packageName}
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Calendar size={14} className="text-slate-300" />
            <span>Registration Date: {formatDate(shipmentDate)}</span>
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
    <div className="border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl space-y-8">
      {/* Status Badges Grill */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-4 border border-border/60 bg-background/50 p-5 rounded-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary rounded-xl">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Delivery Status
            </p>
            <div className="mt-1.5 inline-block">
              <StatusBadge status={shipmentStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-border/60 bg-background/50 p-5 rounded-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary rounded-xl">
            <CreditCard size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Payment Status
            </p>
            <div className="mt-1.5 inline-block">
              <StatusBadge status={paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Info Block - Neo Minimalist Style */}
      {hasReceiverInfo && (
        <div className="border border-border/60 bg-background/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/60 bg-surface/50 px-6 py-4">
            <User size={18} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-tight text-ink">Shipping Address</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="border-b border-border/60 pb-4">
              <span className="text-muted block text-[10px] font-semibold uppercase tracking-wider">Receiver Name</span>
              <span className="text-base font-semibold text-ink mt-1 block">{receiver?.name ?? "-"}</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {receiver?.phone && (
                <div>
                  <span className="text-muted flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Phone size={12} />Phone</span>
                  <span className="text-ink font-semibold text-sm mt-1.5 block">{receiver.phone}</span>
                </div>
              )}
              {receiver?.email && (
                <div className="min-w-0">
                  <span className="text-muted flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Mail size={12} />Email</span>
                  <span className="text-ink font-semibold text-sm truncate block mt-1.5">{receiver.email}</span>
                </div>
              )}
            </div>

            {fullAddress && (
              <div className="border-t border-border/60 pt-5 mt-2">
                <span className="text-muted flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><MapPin size={12} />Full Address</span>
                <p className="text-ink font-medium text-sm leading-relaxed mt-2">{fullAddress}</p>
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
    <div className="border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-5 mb-6">
        <Truck size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-ink">Logistics Route</h3>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] items-center">
        {/* Origin Node */}
        <div className="border border-border/60 bg-background/50 p-5 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
            <Warehouse size={14} />
            Origin Branch
          </div>
          <p className="text-base font-semibold text-ink truncate">{origin?.name ?? "-"}</p>
          <p className="text-xs font-medium text-muted mt-1">{origin?.city ?? "-"}</p>
        </div>

        {/* Arrow Node */}
        <div className="flex justify-center hidden sm:flex">
          <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary rounded-full shadow-sm">
            <ArrowRight size={20} />
          </div>
        </div>

        {/* Destination Node */}
        <div className="border border-primary/20 bg-primary/5 p-5 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary mb-3">
            <MapPin size={14} />
            Destination Branch
          </div>
          <p className="text-base font-semibold text-ink truncate">{destination?.name ?? "-"}</p>
          <p className="text-xs font-medium text-muted mt-1">{destination?.city ?? "-"}</p>
        </div>
      </div>

      {/* Cargo Mass Weight */}
      <div className="mt-6 flex items-center justify-between border border-border/60 bg-background/50 px-6 py-4 rounded-2xl text-xs font-semibold">
        <div className="flex items-center gap-2 text-muted">
          <Scale size={16} />
          <span className="uppercase tracking-wider">Total Cargo Weight</span>
        </div>
        <span className="text-lg font-semibold text-ink">{weight} KG</span>
      </div>
    </div>
  );
}

function getTrackingStatusIndex(status: string) {
  const index = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);
  return index === -1 ? -1 : index;
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
    () => getTrackingStatusIndex(shipment.status),
    [shipment.status],
  );

  const currentTrackingId = useMemo(() => {
    if (trackings.length === 0) return null;
    const matched = trackings.filter(t => getTrackingStatusIndex(t.status) === currentStatusIndex);
    if (matched.length > 0) return matched[matched.length - 1]?.id ?? null;
    const reached = trackings.filter(t => getTrackingStatusIndex(t.status) <= currentStatusIndex);
    return reached[reached.length - 1]?.id ?? trackings[trackings.length - 1]?.id ?? null;
  }, [trackings, currentStatusIndex]);

  const progressPercent = useMemo(() => {
    if (currentStatusIndex < 0) return 0;
    return Math.round(((currentStatusIndex + 1) / STATUS_ORDER.length) * 100);
  }, [currentStatusIndex]);

  return (
    <section className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
      <div className="border-b border-border/60 bg-background/50 px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
              Progress Monitoring
            </p>
            <h2 className="text-xl font-semibold text-ink">Tracking Timeline</h2>
          </div>
          <div className="flex items-center gap-2 bg-surface text-primary px-4 py-2 border border-primary/20 shadow-sm rounded-xl self-start sm:self-center">
            <span className="text-xs font-bold tracking-wider">{progressPercent}% COMPLETE</span>
          </div>
        </div>

        <HorizontalStepper currentStatusIndex={currentStatusIndex} />
      </div>

      <div className="p-8">
        {trackings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/60 bg-background/50 rounded-2xl">
            <Package size={40} className="text-slate-300 mb-4" />
            <p className="text-sm font-semibold text-ink tracking-tight">
              Awaiting Handover
            </p>
            <p className="text-xs font-medium text-muted mt-2 max-w-sm">
              Logistics flow will be updated once the branch post validates the package.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-0 pl-2">
            {trackings.map((tracking, index) => {
              const statusIndex = getTrackingStatusIndex(tracking.status);
              const isActive = currentStatusIndex >= 0 && statusIndex >= 0 && statusIndex <= currentStatusIndex;
              const nextTracking = trackings[index + 1];
              const nextStatusIndex = nextTracking ? getTrackingStatusIndex(nextTracking.status) : -1;
              const isNextActive = currentStatusIndex >= 0 && nextStatusIndex >= 0 && nextStatusIndex <= currentStatusIndex;

              return (
                <TimelineItem
                  key={tracking.id}
                  tracking={tracking}
                  isActive={isActive}
                  isCurrent={tracking.id === currentTrackingId}
                  isLast={index === trackings.length - 1}
                  isNextActive={isNextActive}
                />
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function formatStepLabel(step: (typeof STATUS_ORDER)[number]) {
  return step.replaceAll("_", " ");
}

function HorizontalStepper({ currentStatusIndex }: { currentStatusIndex: number }) {
  return (
    <div className="mt-8 grid grid-cols-6 relative">
      {STATUS_ORDER.map((step, index) => {
        const isActive = currentStatusIndex >= 0 && index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const isLineActive = currentStatusIndex >= 0 && index < currentStatusIndex;

        return (
          <div key={step} className="relative flex flex-col items-center">
            {index < STATUS_ORDER.length - 1 && (
              <span
                aria-hidden
                className={`absolute top-[14px] z-0 h-[2px] w-full -translate-y-1/2 transition-colors duration-300 ${isLineActive ? "bg-primary" : "bg-slate-200"
                  }`}
                style={{ left: "50%", right: "-50%" }}
              />
            )}

            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center bg-slate-50">
              <div className={`h-[22px] w-[22px] flex items-center justify-center rounded-full transition-all duration-300 border-2 ${!isActive ? "border-slate-200 bg-white" : isCurrent ? "border-primary bg-primary text-primary-foreground scale-110 shadow-sm" : "border-primary bg-primary text-primary-foreground"
                }`}>
                {isActive ? <CheckCircle2 size={14} className="stroke-[3]" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />}
              </div>
            </div>

            <p className={`mt-3 hidden text-center text-[9px] font-semibold uppercase tracking-wider sm:block truncate w-full px-1 transition-colors duration-300 ${isActive ? "text-ink" : "text-slate-400"
              }`}>
              {formatStepLabel(step)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function TimelineItem({
  tracking,
  isActive,
  isCurrent,
  isLast,
  isNextActive,
}: {
  tracking: NonNullable<Shipment["shipment_trackings"]>[number];
  isActive: boolean;
  isCurrent: boolean;
  isLast: boolean;
  isNextActive: boolean;
}) {
  const connectorActive = isActive && isNextActive;

  return (
    <li className="relative grid grid-cols-[40px_1fr] gap-4 pb-8 last:pb-0">
      {!isLast && (
        <span className={`absolute left-[19px] top-8 bottom-0 w-0.5 transition-colors duration-300 ${connectorActive ? "bg-primary" : "bg-slate-200"
          }`} />
      )}

      <div className="relative z-10 flex justify-center pt-1">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${isActive ? (isCurrent ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/20 text-primary") : "bg-slate-100 text-muted"
          }`}>
          {isActive ? <CheckCircle2 size={18} className="stroke-[2.5]" /> : <Circle size={14} className="stroke-[2.5]" />}
        </div>
      </div>

      <div className={`p-5 border border-border shadow-sm rounded-2xl transition-all duration-300 ${isActive ? (isCurrent ? "bg-surface" : "bg-slate-50") : "bg-slate-50/50 opacity-70"
        }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
          <strong className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-ink" : "text-muted"}`}>
            {tracking.status.replaceAll("_", " ")}
          </strong>
          <span className="text-[10px] font-medium text-muted">
            {formatDate(tracking.tracked_at)}
          </span>
        </div>
        <p className="text-sm font-medium text-ink leading-relaxed">
          {tracking.description ?? "-"}
        </p>
        {tracking.location && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <MapPin size={12} className="text-primary" />
            {tracking.location}
          </p>
        )}
      </div>
    </li>
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
    <article className="border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
      {/* Billing Console Header */}
      <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Barcode size={80} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-tight text-slate-400 mb-1">
          Billing Summary
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-white drop-shadow-md">
            {formatCurrency(shipment.total_price)}
          </span>
        </div>
        <div className="mt-6 inline-block">
          <span className="border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 rounded-lg backdrop-blur-md">
            Method: {shipment.payments?.payment_method === "cash" ? "Cash" : (shipment.payments?.payment_method?.toUpperCase() ?? "-")}
          </span>
        </div>
      </div>

      {/* Bill Matrix Rows */}
      <div className="p-8 space-y-5 bg-surface/50">
        <SummaryRow label="Package" value={packageName} />
        <SummaryRow label="Total Weight" value={`${shipment.total_weight} kg`} />
        <SummaryRow label="Handover" value={handoverLabel} />
        <SummaryRow label="Date" value={formatDate(shipment.shipment_date)} />

        <div className="my-6 border-t border-border/60" />

        <SummaryRow
          label="Total Price"
          value={formatCurrency(shipment.total_price)}
          highlight
        />
      </div>

      {/* Action Gateway Buttons Terminal */}
      <div className="space-y-3 border-t border-border/60 bg-background/50 p-8">
        {canPay && (
          <button
            className="flex h-14 w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-base shadow-sm transition-all hover:bg-primary/90 rounded-2xl disabled:opacity-50"
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
            className="flex h-14 w-full items-center justify-center gap-2 border border-border/60 bg-surface text-ink font-semibold text-sm transition-all hover:bg-slate-50 rounded-2xl shadow-sm"
            onClick={onDownload}
            type="button"
          >
            <Download size={18} />
            Download Receipt PDF
          </button>
        )}

        {canCancel && (
          <button
            className="flex h-14 w-full items-center justify-center gap-2 border border-destructive/20 bg-surface text-destructive font-semibold text-sm transition-all hover:bg-destructive/5 rounded-2xl"
            onClick={onCancel}
            type="button"
          >
            <XCircle size={18} />
            Cancel Order
          </button>
        )}

        {shipment.status === "cancelled" && (
          <div className="border border-destructive/20 bg-destructive/5 p-4 text-center text-xs font-semibold text-destructive rounded-xl">
            Order has been cancelled
          </div>
        )}

        {paymentStatus === "failed" && !canPay && (
          <div className="border border-destructive/20 bg-destructive/5 p-4 text-center text-xs font-semibold text-destructive rounded-xl">
            Payment deadline expired
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
      <span className="text-muted font-medium text-xs">{label}</span>
      <span className={`font-semibold text-xs ${highlight ? "text-base text-ink" : "text-ink"}`}>
        {value}
      </span>
    </div>
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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => !isPending && onOpenChange(false)}
      />

      <div className="relative w-full max-w-md border border-border bg-surface p-8 shadow-lg rounded-2xl font-body">
        <div className="flex h-12 w-12 items-center justify-center bg-destructive/10 text-destructive rounded-full">
          <AlertTriangle size={24} />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-ink">Batalkan Pesanan?</h3>
        <p className="mt-2 text-sm font-medium text-muted leading-relaxed">
          Pesanan yang telah dibatalkan tidak dapat dikembalikan. Apakah Anda yakin ingin membatalkan pesanan ini?
        </p>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button
            className="flex-1 h-12 border border-border bg-surface text-sm font-medium text-ink hover:bg-slate-50 transition-all rounded-xl disabled:opacity-50"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={isPending}
          >
            Tidak, Kembali
          </button>
          <button
            className="flex-1 h-12 bg-destructive text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all rounded-xl disabled:opacity-50"
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
    <div className="w-full font-body">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 font-body pb-16">
        <div className="h-6 w-48 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
          </div>
          <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}