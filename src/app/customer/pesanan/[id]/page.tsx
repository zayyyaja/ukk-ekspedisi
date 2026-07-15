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
import {
  getShipmentDeliveryProof,
  getShipmentPackagePhoto,
} from "@/lib/shipment-photos";
import type { CurrentUser, Shipment } from "@/types/customer-portal";

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
    refetchInterval: 4_000,
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
      <CustomerNavbarShell>
        <div className="mx-auto max-w-6xl p-4 sm:p-6 font-mono">
          <div className="border-4 border-slate-900 bg-rose-100 p-4 text-xs font-black uppercase tracking-wider text-rose-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
            [ SYSTEM_CRITICAL ]: {error instanceof Error ? error.message : "Detail pesanan tidak ditemukan."}
          </div>
        </div>
      </CustomerNavbarShell>
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
    <CustomerNavbarShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 font-mono select-none pb-16">
        <BackLink />

        <ShipmentAlerts
          showPaymentFinish={searchParams.get("payment") === "finish"}
          isPendingAdditional={isPendingAdditional}
          isCashPending={derivedState.isCash && paymentStatus === "pending"}
        />

        {/* Resi Number Section - Gaya Papan Kontainer Kargo */}
        <div className="overflow-hidden border-4 border-slate-900 bg-amber-400 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          <div className="px-6 py-5 text-center relative">
            <div className="absolute top-2 left-2 text-[9px] font-black text-slate-900/40 tracking-wider">// CORE_MANIFEST_ID</div>
            <p className="text-3xs font-black uppercase tracking-[0.25em] text-slate-900">
              NOMOR RESI PENGIRIMAN LOGISTIK
            </p>
            <p className="mt-2 font-mono text-2xl sm:text-4xl font-black tracking-widest text-slate-950 uppercase">
              {data.tracking_number || "[ MENUNGGU_VERIFIKASI ]"}
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
      className="group inline-flex items-center gap-2 text-2xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-950"
    >
      <ArrowLeft size={14} className="stroke-[2.5] transition-transform group-hover:-translate-x-1" />
      [ ESC ]: KEMBALI KE DAFTAR PESANAN
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
        <div className="border-4 border-slate-900 bg-emerald-50 p-4 text-3xs font-black uppercase tracking-wider text-emerald-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          // STATUS_SYNC_OK: Pembayaran selesai diproses. Sistem sedang menyinkronkan status dari Midtrans.
        </div>
      )}
      {isPendingAdditional && (
        <div className="border-4 border-slate-900 bg-amber-50 p-4 text-3xs font-black uppercase tracking-wider text-amber-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>SISTEM_INFO: Terdapat selisih biaya hasil validasi fisik oleh kasir. Silakan lunasi kekurangan untuk melanjutkan pengiriman.</span>
        </div>
      )}
      {isCashPending && (
        <div className="border-4 border-slate-900 bg-sky-50 p-4 text-3xs font-black uppercase tracking-wider text-sky-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          HOLD_WARNING: Pembayaran cash menunggu konfirmasi kasir. Bawa paket dan nomor resi ini ke cabang asal sebelum batas waktu 24 jam berakhir.
        </div>
      )}
    </div>
  );
}

function DeliveryProofCard({ photoUrl }: { photoUrl: string }) {
  return (
    <article className="border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
      <div className="border-b-4 border-slate-900 bg-emerald-400 px-5 py-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">// BUKTI_SERAH_TERIMA_TERKIRIM</h2>
        <p className="mt-0.5 text-3xs font-bold text-slate-800 uppercase">
          Dokumentasi fisik oleh kurir di lokasi tujuan penyerahan.
        </p>
      </div>
      <div className="p-4 bg-slate-900">
        <img
          alt="Bukti paket telah diterima"
          className="h-64 w-full border-2 border-white object-cover rounded-xs"
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
    <article className="border-4 border-slate-900 bg-white shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
      <div className="relative aspect-[16/9] w-full bg-slate-100 border-b-2 border-slate-900">
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
          <div className="flex h-full w-full items-center justify-center bg-slate-50">
            <div className="text-center p-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-slate-900 bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm">
                <Package size={28} className="stroke-[2.5]" />
              </div>
              <p className="mt-3 text-3xs font-black uppercase tracking-wider text-slate-400">
                [ VISUAL_NOT_AVAILABLE ]: Foto manifes belum diambil oleh petugas loker
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-3xs font-black uppercase tracking-widest text-amber-400">
            // CARGO_ITEM_DESC
          </p>
          <h1 className="mt-1 text-xl font-black uppercase tracking-wide leading-tight sm:text-2xl">
            {packageName}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-3xs font-bold uppercase tracking-wider text-slate-300">
            <Calendar size={12} className="text-amber-400" />
            <span>REGISTRASI_SYSTEM: {formatDate(shipmentDate)}</span>
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
    <div className="border-4 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm space-y-5">
      {/* Status Badges Grill */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 border-2 border-slate-900 bg-slate-50 p-3 rounded-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white rounded-xs">
            <Package size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-3xs font-black uppercase tracking-wider text-slate-400">
              STATUS PENGIRIMAN
            </p>
            <div className="mt-1 inline-block">
              <StatusBadge status={shipmentStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-2 border-slate-900 bg-slate-50 p-3 rounded-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white rounded-xs">
            <CreditCard size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-3xs font-black uppercase tracking-wider text-slate-400">
              STATUS OTORISASI BILLING
            </p>
            <div className="mt-1 inline-block">
              <StatusBadge status={paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Info Block - Mirip Label Pengiriman Paket */}
      {hasReceiverInfo && (
        <div className="border-4 border-slate-900 bg-white rounded-sm overflow-hidden shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-3 border-b-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-white">
            <User size={14} className="text-amber-400" />
            <span className="text-3xs font-black uppercase tracking-widest">// ALAMAT_PENGIRIMAN_MANIFES</span>
          </div>

          <div className="p-4 space-y-3 text-3xs font-bold uppercase tracking-wide">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-slate-400 block text-[9px] font-black">// NAMA_PENERIMA</span>
              <span className="text-xs font-black text-slate-900">{receiver?.name ?? "-"}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {receiver?.phone && (
                <div>
                  <span className="text-slate-400 block text-[9px] font-black"><Phone size={8} className="inline mr-1" />TELEPON</span>
                  <span className="text-slate-900 font-black">{receiver.phone}</span>
                </div>
              )}
              {receiver?.email && (
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] font-black"><Mail size={8} className="inline mr-1" />EMAIL</span>
                  <span className="text-slate-900 font-black truncate block">{receiver.email}</span>
                </div>
              )}
            </div>

            {fullAddress && (
              <div className="border-t border-slate-200 pt-2 mt-2 bg-slate-50 p-2 border-2 border-dashed border-slate-300">
                <span className="text-slate-400 block text-[9px] font-black"><MapPin size={8} className="inline mr-1" />ALAMAT DESTINASI LENGKAP</span>
                <p className="text-slate-900 font-black normal-case leading-normal mt-0.5">{fullAddress}</p>
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
    <div className="border-4 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm">
      <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-3 mb-4">
        <Truck size={16} className="text-slate-900" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">DIAGRAM_RUTE_LOGISTIK</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-center">
        {/* Origin Node */}
        <div className="border-2 border-slate-900 bg-slate-50 p-3 rounded-sm">
          <div className="flex items-center gap-1.5 text-3xs font-black uppercase tracking-wider text-slate-400">
            <Warehouse size={12} />
            ORIGIN_HUB_ASAL
          </div>
          <p className="mt-1 text-xs font-black text-slate-900 truncate">{origin?.name ?? "-"}</p>
          <p className="text-3xs font-bold text-slate-500 uppercase">{origin?.city ?? "-"}</p>
        </div>

        {/* Arrow Node */}
        <div className="flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-xs">
            <ArrowRight size={16} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Destination Node */}
        <div className="border-2 border-slate-900 bg-amber-50/50 p-3 rounded-sm">
          <div className="flex items-center gap-1.5 text-3xs font-black uppercase tracking-wider text-amber-700">
            <MapPin size={12} />
            DESTINATION_TUJUAN
          </div>
          <p className="mt-1 text-xs font-black text-slate-900 truncate">{destination?.name ?? "-"}</p>
          <p className="text-3xs font-bold text-slate-500 uppercase">{destination?.city ?? "-"}</p>
        </div>
      </div>

      {/* Cargo Mass Weight */}
      <div className="mt-4 flex items-center justify-between border-2 border-slate-900 bg-slate-950 px-4 py-2 text-white rounded-sm text-3xs font-black uppercase">
        <div className="flex items-center gap-2">
          <Scale size={14} className="text-amber-400" />
          <span>BOBOT TIMBANG MASSA (WEIGHT)</span>
        </div>
        <span className="text-sm font-black text-amber-400">{weight} KG</span>
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
    <section className="border-4 border-slate-900 bg-white shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
      <div className="border-b-4 border-slate-900 bg-slate-50 px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-3xs font-black uppercase tracking-widest text-slate-400">
              // NODE_PROGRESS_MONITOR
            </p>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">TIMELINE TRACKING RESI</h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] rounded-xs self-start sm:self-center">
            <span className="text-2xs font-black text-amber-400">{progressPercent}% SYNCED</span>
          </div>
        </div>

        <HorizontalStepper currentStatusIndex={currentStatusIndex} />
      </div>

      <div className="p-5">
        {trackings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-300 bg-slate-50 rounded-sm">
            <Package size={32} className="text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-3xs font-black uppercase text-slate-400 tracking-wide">
              [ WAITING_CARGO_HANDOVER ]: MENUNGGU SERAH TERIMA KASIR
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
              Alur logistik eksternal akan aktif setelah validasi pos cabang dilakukan.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-0">
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
    <div className="mt-6 grid grid-cols-6 relative">
      {STATUS_ORDER.map((step, index) => {
        const isActive = currentStatusIndex >= 0 && index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const isLineActive = currentStatusIndex >= 0 && index < currentStatusIndex;

        return (
          <div key={step} className="relative flex flex-col items-center">
            {index < STATUS_ORDER.length - 1 && (
              <span
                aria-hidden
                className={`absolute top-3.5 z-0 h-1 w-full -translate-y-1/2 border-y border-slate-900 transition-colors ${
                  isLineActive ? "bg-slate-900" : "bg-slate-200"
                }`}
                style={{ left: "50%", right: "-50%" }}
              />
            )}

            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
              <div className={`h-6 w-6 border-2 border-slate-900 flex items-center justify-center rounded-xs transition-all ${
                !isActive ? "bg-white text-slate-300" : isCurrent ? "bg-amber-400 text-slate-950 scale-110 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" : "bg-slate-900 text-white"
              }`}>
                {isActive ? <span className="text-[10px] font-black">✓</span> : <span className="h-1 w-1 bg-slate-300 rounded-full" />}
              </div>
            </div>

            <p className={`mt-2 hidden text-center text-[8px] font-black uppercase leading-tight tracking-wider sm:block truncate w-full px-1 ${
              isActive ? "text-slate-950" : "text-slate-400"
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
    <li className="relative grid grid-cols-[36px_1fr] gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className={`absolute left-[15px] top-7 bottom-0 w-1 border-r-2 border-slate-900 transition-colors ${
          connectorActive ? "bg-slate-900" : "bg-slate-200"
        }`} />
      )}

      <div className="relative z-10 flex justify-center pt-0.5">
        <div className={`flex h-8 w-8 items-center justify-center border-2 border-slate-900 rounded-xs shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all ${
          isActive ? (isCurrent ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-white") : "bg-white text-slate-300"
        }`}>
          <span className="text-2xs font-black">{isActive ? "✓" : "◦"}</span>
        </div>
      </div>

      <div className={`border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm transition-all ${
        isActive ? (isCurrent ? "bg-amber-50/40" : "bg-slate-50/70") : "bg-white opacity-60"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-slate-300 pb-1.5 mb-1.5">
          <strong className={`text-2xs font-black uppercase tracking-wider ${isActive ? "text-slate-950" : "text-slate-400"}`}>
            [{tracking.status.replaceAll("_", " ")}]
          </strong>
          <span className="text-[10px] font-bold text-slate-400">
            {formatDate(tracking.tracked_at)}
          </span>
        </div>
        <p className="text-xs font-bold text-slate-700 leading-normal">
          {tracking.description ?? "-"}
        </p>
        {tracking.location && (
          <p className="mt-1.5 flex items-center gap-1 text-3xs font-black uppercase tracking-wider text-slate-400">
            <MapPin size={10} className="text-amber-500" />
            LOC: {tracking.location}
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
    <article className="border-4 border-slate-900 bg-white shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
      {/* Billing Console Header */}
      <div className="bg-slate-900 p-5 text-white border-b-4 border-slate-900">
        <p className="text-3xs font-black uppercase tracking-widest text-amber-400">
          // AGGREGATE_BILLING_SUMMARY
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tight text-white">
            {formatCurrency(shipment.total_price)}
          </span>
        </div>
        <div className="mt-3">
          <span className="border border-white bg-white/10 px-2 py-0.5 text-3xs font-black uppercase tracking-wider text-slate-100 rounded-xs">
            METHOD: {shipment.payments?.payment_method === "cash" ? "CASH" : (shipment.payments?.payment_method?.toUpperCase() ?? "-")}
          </span>
        </div>
      </div>

      {/* Bill Matrix Rows */}
      <div className="p-4 space-y-2.5 text-3xs font-bold uppercase tracking-wide">
        <SummaryRow label="DESK_PAKET" value={packageName} />
        <SummaryRow label="MASSA_BOBOT" value={`${shipment.total_weight} kg`} />
        <SummaryRow label="METODE_DROP" value={handoverLabel} />
        <SummaryRow label="LOG_REG_DATE" value={formatDate(shipment.shipment_date)} />

        <div className="my-2 border-t-2 border-dashed border-slate-200" />

        <SummaryRow
          label="GRAND_TOTAL_TAGIHAN"
          value={formatCurrency(shipment.total_price)}
          highlight
        />
      </div>

      {/* Action Gateway Buttons Terminal */}
      <div className="space-y-3 border-t-4 border-slate-900 bg-slate-50 p-4">
        {canPay && (
          <button
            className="flex h-11 w-full items-center justify-center gap-2 border-2 border-slate-950 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm disabled:opacity-50"
            disabled={isPaying}
            onClick={onPay}
            type="button"
          >
            <CreditCard size={14} className="stroke-[2.5]" />
            {paymentLabel}
          </button>
        )}

        {paymentStatus === "paid" && (
          <button
            className="flex h-11 w-full items-center justify-center gap-2 border-2 border-slate-950 bg-emerald-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
            onClick={onDownload}
            type="button"
          >
            <Download size={14} className="stroke-[2.5]" />
            DOWNLOAD RESI PDF
          </button>
        )}

        {canCancel && (
          <button
            className="flex h-11 w-full items-center justify-center gap-2 border-2 border-rose-900 bg-white font-black text-rose-900 shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] hover:bg-rose-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs uppercase tracking-widest transition-all rounded-sm"
            onClick={onCancel}
            type="button"
          >
            <XCircle size={14} />
            BATALKAN PESANAN
          </button>
        )}

        {shipment.status === "cancelled" && (
          <div className="border-2 border-rose-900 bg-rose-100 p-3 text-center text-3xs font-black uppercase text-rose-950 rounded-sm">
            // TERMINATED: PESANAN TELAH DIBATALKAN
          </div>
        )}

        {paymentStatus === "failed" && !canPay && (
          <div className="border-2 border-rose-900 bg-rose-100 p-3 text-center text-3xs font-black uppercase text-rose-950 rounded-sm">
            // EXPIRED: BATAS OTORISASI BERAKHIR
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
      <span className="text-slate-400 font-bold text-[10px]">{label}</span>
      <span className={`font-black ${highlight ? "text-base text-slate-950 bg-amber-400 px-1" : "text-slate-900"}`}>
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
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={() => !isPending && onOpenChange(false)}
      />

      <div className="relative w-full max-w-md border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm font-mono">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-slate-900 bg-rose-400 text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          <AlertTriangle size={24} className="stroke-[2.5]" />
        </div>

        <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-900">TERMINASI MANIFES CARGO?</h3>
        <p className="mt-2 text-3xs font-bold text-slate-500 uppercase leading-normal">
          Pesanan yang telah dibatalkan secara permanen tidak dapat dipulihkan kembali oleh enkripsi sistem. Konfirmasi tindakan Anda?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 h-10 border-2 border-slate-900 bg-white text-3xs font-black uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 active:translate-x-[1px] active:translate-y-[1px] transition-all rounded-sm disabled:opacity-50"
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={isPending}
          >
            TIDAK, KEMBALI
          </button>
          <button
            className="flex-1 h-10 border-2 border-slate-950 bg-rose-600 text-3xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-rose-700 active:translate-x-[1px] active:translate-y-[1px] transition-all rounded-sm disabled:opacity-50"
            onClick={onConfirm}
            type="button"
            disabled={isPending}
          >
            {isPending ? "MEMPROSES..." : "YA, BATALKAN"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 font-mono">
        <div className="h-6 w-48 bg-slate-200 border-2 border-slate-300 animate-pulse rounded-sm" />
        <div className="h-20 bg-slate-200 border-4 border-slate-300 animate-pulse rounded-sm" />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="h-64 bg-slate-200 border-4 border-slate-300 animate-pulse rounded-sm" />
            <div className="h-40 bg-slate-200 border-4 border-slate-300 animate-pulse rounded-sm" />
          </div>
          <div className="h-96 bg-slate-200 border-4 border-slate-300 animate-pulse rounded-sm" />
        </div>
      </div>
    </CustomerNavbarShell>
  );
}