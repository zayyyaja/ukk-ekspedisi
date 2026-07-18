"use client";

import { Banknote, CheckCircle2, Eye, PackageSearch, Truck, X } from "lucide-react";
import { useState } from "react";

import type { ApiListMeta, CashierOrder } from "@/components/cashier/cashier-types";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import {
  getShipmentDeliveryProof,
  getShipmentPackagePhoto,
} from "@/lib/shipment-photos";

function paymentStatusClass(status?: string | null) {
  if (status === "paid") return "bg-emerald-100/50 text-emerald-700 border-emerald-200";
  if (status === "failed") return "bg-rose-100/50 text-rose-700 border-rose-200";
  return "bg-amber-100/50 text-amber-700 border-amber-200";
}

function shipmentStatusClass(status?: string | null) {
  if (status === "delivered") return "bg-emerald-100/50 text-emerald-700 border-emerald-200";
  if (status === "cancelled") return "bg-rose-100/50 text-rose-700 border-rose-200";
  if (status === "arrived_at_branch") return "bg-cyan-100/50 text-cyan-700 border-cyan-200";
  if (status === "picked_up") return "bg-blue-100/50 text-blue-700 border-blue-200";
  return "bg-slate-100/50 text-slate-600 border-slate-200";
}

function canConfirm(order: CashierOrder) {
  if (order.payments?.payment_status !== "paid") return false;
  if (order.status !== "pending") return false;
  if (order.handover_method === "pickup" && !order.courier_id) return false;
  return true;
}

function isAwaitingPickupReturn(order: CashierOrder) {
  return (
    order.handover_method === "pickup" &&
    order.payments?.payment_status === "paid" &&
    order.status === "pending" &&
    Boolean(order.courier_id)
  );
}

function needsCourierAssignment(order: CashierOrder) {
  return (
    order.handover_method === "pickup" &&
    order.payments?.payment_status === "paid" &&
    order.status === "pending" &&
    !order.courier_id
  );
}

export function CashierOrderTable({
  orders,
  meta,
  loading,
  onConfirm,
  onAssignCourier,
  onReject,
  onVerifyCash,
  onPageChange,
}: {
  orders: CashierOrder[];
  meta?: ApiListMeta;
  loading?: boolean;
  onConfirm: (order: CashierOrder, trackingNumber: string) => void;
  onAssignCourier?: (order: CashierOrder, courierCode: string) => void;
  onReject: (order: CashierOrder, reason: string) => void;
  onVerifyCash?: (order: CashierOrder) => void;
  onPageChange?: (page: number) => void;
}) {
  const [detail, setDetail] = useState<CashierOrder | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState<CashierOrder | null>(null);
  const [courierInputs, setCourierInputs] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");

  function trackingInput(orderId: string) {
    return trackingInputs[orderId] ?? "";
  }

  function courierInput(orderId: string) {
    return courierInputs[orderId] ?? "";
  }

  return (
    <>
      {/* Main Table Container */}
      <div className="w-full space-y-4">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[680px] border border-border/40 bg-surface rounded-2xl shadow-sm">
          <table className="w-full min-w-275 border-collapse text-left relative">
            <thead>
              <tr className="border-b border-border/40 bg-slate-50/90 backdrop-blur-md sticky top-0 z-10">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap text-center w-35">Status Bayar</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Pelanggan</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Nama Paket</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Total Harga</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Metode Bayar</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Penyerahan</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap text-center w-35">Status Paket</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Waktu Pesan</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td className="px-5 py-16 text-center text-sm font-medium text-muted" colSpan={9}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                      Memuat data pesanan...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="p-0" colSpan={9}>
                    <div className="p-10">
                      <EmptyState
                        title="Belum ada pesanan"
                        description="Tidak ada data pesanan yang sesuai dengan filter atau pencarian Anda."
                        icon={PackageSearch}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const currentInput = trackingInput(order.id);
                  const awaitingReturn = isAwaitingPickupReturn(order);
                  const needsCourier = needsCourierAssignment(order);

                  return (
                    <tr className="bg-transparent hover:bg-slate-50/50 transition-colors duration-200" key={order.id}>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${paymentStatusClass(order.payments?.payment_status)}`}>
                          {order.payments?.payment_status ?? "UNPAID"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-ink whitespace-nowrap">
                        {order.customers_shipments_sender_idTocustomers?.name ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-muted whitespace-nowrap">
                        {order.shipment_items?.[0]?.item_name ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-ink whitespace-nowrap">
                        {formatCurrency(order.total_price)}
                      </td>
                      <td className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-ink whitespace-nowrap">
                        {order.payments?.payment_method ?? "-"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-slate-100/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                          {order.handover_method === "pickup" ? "PICKUP" : "DROP OFF"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${shipmentStatusClass(order.status)}`}>
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted whitespace-nowrap">
                        {formatDate(order.shipment_date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              onConfirm(order, currentInput);
                              setTrackingInputs((current) => ({ ...current, [order.id]: "" }));
                            }}
                          >
                            {/* Detail Button */}
                            <button
                              aria-label="Lihat detail pesanan"
                              className="inline-flex h-8 w-8 items-center justify-center border border-border/50 bg-surface text-muted shadow-sm transition-all rounded-lg hover:bg-slate-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              onClick={() => setDetail(order)}
                              title="Lihat detail"
                              type="button"
                            >
                              <Eye size={15} strokeWidth={2} />
                            </button>

                            {/* Cash Verification Button */}
                            {order.payments?.payment_method === "cash" && order.payments.payment_status === "pending" ? (
                              <button
                                aria-label="Konfirmasi pembayaran cash"
                                className="inline-flex h-8 w-8 items-center justify-center border border-amber-200 bg-amber-50 text-amber-700 shadow-sm transition-all rounded-lg hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                onClick={() => onVerifyCash?.(order)}
                                title="Konfirmasi pembayaran cash"
                                type="button"
                              >
                                <Banknote size={15} strokeWidth={2} />
                              </button>
                            ) : null}

                            {/* Cashier Action Forms */}
                            {needsCourier ? (
                              <>
                                <input
                                  className="h-8 w-24 rounded-lg border border-border/40 bg-slate-50/50 px-2 text-[11px] font-medium uppercase text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary"
                                  maxLength={5}
                                  onChange={(event) => setCourierInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="ID KURIR"
                                  value={courierInput(order.id)}
                                />
                                <button
                                  className="inline-flex h-8 items-center justify-center gap-1 border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold tracking-tight text-amber-700 shadow-sm transition-all rounded-lg cursor-pointer hover:bg-amber-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                                  disabled={!courierInput(order.id)}
                                  onClick={() => {
                                    if (courierInput(order.id)) onAssignCourier?.(order, courierInput(order.id));
                                  }}
                                  title="Tugaskan kurir untuk menjemput paket ke rumah pengirim"
                                  type="button"
                                >
                                  <Truck size={12} strokeWidth={2} />
                                  Tugaskan
                                </button>
                              </>
                            ) : awaitingReturn ? (
                              <>
                                <input
                                  className="h-8 w-36 rounded-lg border border-border/40 bg-slate-50/50 px-2 text-[11px] font-medium uppercase text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary"
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="NO. RESI MANIFES"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket diterima dari kurir"
                                  className="inline-flex h-8 w-8 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition-all rounded-lg hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-40"
                                  disabled={!currentInput.trim()}
                                  title="Konfirmasi paket sudah diterima dari kurir (status: Picked Up)"
                                  type="submit"
                                >
                                  <CheckCircle2 size={15} strokeWidth={2} />
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  className="h-8 w-36 rounded-lg border border-border/40 bg-slate-50/50 px-2 text-[11px] font-medium uppercase text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary disabled:opacity-50"
                                  disabled={!canConfirm(order)}
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="INPUT RESI BARU"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket"
                                  className="inline-flex h-8 w-8 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition-all rounded-lg hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-40"
                                  disabled={!canConfirm(order) || !currentInput.trim()}
                                  title="Konfirmasi paket"
                                  type="submit"
                                >
                                  <CheckCircle2 size={15} strokeWidth={2} />
                                </button>
                              </>
                            )}

                            {/* Reject Button */}
                            <button
                              aria-label="Tolak pesanan"
                              className="inline-flex h-8 w-8 items-center justify-center border border-rose-200 bg-rose-50 text-rose-700 shadow-sm transition-all rounded-lg hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-40"
                              disabled={order.status === "cancelled" || order.status === "delivered"}
                              onClick={() => setRejecting(order)}
                              title="Tolak pesanan"
                              type="button"
                            >
                              <X size={15} strokeWidth={2} />
                            </button>
                          </form>

                          {/* Courier Status Indicator */}
                          {awaitingReturn ? (
                            <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                              <Truck size={12} strokeWidth={2} />
                              <span>Kurir sedang menjemput — input resi jika tiba</span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
            <div className="text-sm font-medium text-muted">
              Menampilkan{" "}
              <strong className="text-ink font-semibold">{orders.length === 0 ? 0 : (meta.page - 1) * meta.perPage + 1}</strong>
              {" – "}
              <strong className="text-ink font-semibold">{(meta.page - 1) * meta.perPage + orders.length}</strong>
              {" dari "}
              <strong className="text-ink font-semibold">{meta.total}</strong>
              {" pesanan"}
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(meta.totalPages || 1, 5) }, (_, index) => index + 1).map((page) => (
                <button
                  className={`inline-flex h-9 w-9 items-center justify-center border text-xs font-semibold shadow-sm transition-all rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    page === meta.page
                      ? "bg-primary text-primary-foreground border-primary pointer-events-none"
                      : "bg-surface text-ink border-border/50 hover:bg-slate-50"
                  }`}
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL 1: ORDER DETAIL */}
      {detail ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto border border-border/40 bg-surface p-6 sm:p-8 shadow-xl rounded-3xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border/40 pb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  Detail Pesanan
                </h2>
                <p className="mt-1 text-sm font-medium text-muted">
                  Pemeriksaan mendalam berkas logistik customer
                </p>
              </div>
              <button
                className="inline-flex h-9 items-center justify-center border border-border/50 bg-surface px-4 text-xs font-semibold text-ink shadow-sm transition-all rounded-lg cursor-pointer hover:bg-slate-50 focus-visible:outline-none"
                onClick={() => setDetail(null)}
                type="button"
              >
                Tutup
              </button>
            </div>

            {/* Detail Info Grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Nama Pengirim" value={detail.customers_shipments_sender_idTocustomers?.name} />
              <Info label="Email Pengirim" value={detail.customers_shipments_sender_idTocustomers?.email} />
              <Info label="Telepon Pengirim" value={detail.customers_shipments_sender_idTocustomers?.phone} />
              <Info label="Kota Pengirim" value={detail.customers_shipments_sender_idTocustomers?.city} />
              <Info label="Alamat Pengirim" value={detail.customers_shipments_sender_idTocustomers?.address} wide />
              <Info label="Nama Penerima" value={detail.customers_shipments_receiver_idTocustomers?.name} />
              <Info label="Email Penerima" value={detail.customers_shipments_receiver_idTocustomers?.email} />
              <Info label="Telepon Penerima" value={detail.customers_shipments_receiver_idTocustomers?.phone} />
              <Info label="Kota Penerima" value={detail.customers_shipments_receiver_idTocustomers?.city} />
              <Info label="Alamat Penerima" value={detail.customers_shipments_receiver_idTocustomers?.address} wide />
              <Info label="Nama Item Paket" value={detail.shipment_items?.[0]?.item_name} />
              <Info label="Berat Muatan" value={`${detail.total_weight} kg`} />
              <Info label="Hub Cabang Asal" value={detail.branches_shipments_origin_branch_idTobranches?.name} />
              <Info label="Hub Cabang Tujuan" value={detail.branches_shipments_destination_branch_idTobranches?.name} />
              <Info label="Metode Penyerahan" value={detail.handover_method === "pickup" ? "Jemput Paket (Pickup)" : "Drop Off Mandiri"} />
              <Info label="Sistem Pembayaran" value={detail.payments?.payment_method} />
              <Info label="Status Pembayaran" value={detail.payments?.payment_status} />
              <Info label="Status Lokasi Paket" value={detail.status} />
              <Info label="No. Resi Pelacakan" value={detail.tracking_number} />
              <Info label="Total Harga Final" value={formatCurrency(detail.total_price)} />
            </div>

            {/* Package Photo */}
            {getShipmentPackagePhoto(detail) ? (
              <div className="mt-6 border border-border/40 p-4 bg-slate-50/50 rounded-2xl shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Foto Paket</p>
                <img alt="Foto Paket" className="h-48 w-full border border-border/40 object-cover rounded-xl shadow-sm" src={getShipmentPackagePhoto(detail) ?? ""} />
              </div>
            ) : null}

            {/* Delivery Proof */}
            {getShipmentDeliveryProof(detail) ? (
              <div className="mt-4 border border-border/40 p-4 bg-slate-50/50 rounded-2xl shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Bukti Serah Terima</p>
                <img alt="Bukti penyerahan" className="h-48 w-full border border-border/40 object-cover rounded-xl shadow-sm" src={getShipmentDeliveryProof(detail) ?? ""} />
              </div>
            ) : null}

            {/* Tracking Timeline */}
            <h3 className="mt-8 text-base font-semibold tracking-tight text-ink">
              Timeline Pelacakan
            </h3>
            <div className="mt-3 grid gap-3">
              {(detail.shipment_trackings ?? []).map((tracking) => (
                <div className="border border-border/40 bg-surface p-5 rounded-2xl shadow-sm" key={tracking.id}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink">{tracking.status?.replace(/_/g, " ")}</div>
                  <div className="mt-1 text-sm font-medium text-muted">
                    {tracking.location} — {formatDate(tracking.tracked_at)}
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink bg-slate-50/50 border border-border/40 p-3 rounded-xl leading-relaxed">
                    {tracking.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: REJECT ORDER */}
      {rejecting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            className="w-full max-w-md border border-border/40 bg-surface p-6 sm:p-8 shadow-xl rounded-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              onReject(rejecting, reason);
              setRejecting(null);
              setReason("");
            }}
          >
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Tolak Pesanan
            </h2>
            <p className="mt-1 text-sm font-medium text-muted">
              Berikan alasan penolakan pesanan secara terperinci.
            </p>

            <div className="mt-5 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-tight text-muted block">
                Alasan Penolakan
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-border/40 bg-slate-50/50 p-3 text-sm font-medium text-ink outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary resize-none placeholder:text-muted"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contoh: Alamat pengirim di luar jangkauan armada, paket melanggar ketentuan SOP logistik, barang berbahaya..."
                required
                value={reason}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex h-9 items-center justify-center border border-border/50 bg-surface px-4 text-xs font-semibold text-ink shadow-sm transition-all rounded-lg cursor-pointer hover:bg-slate-50 focus-visible:outline-none"
                onClick={() => setRejecting(null)}
                type="button"
              >
                Batalkan
              </button>
              <button
                className="inline-flex h-9 items-center justify-center border border-rose-200 bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition-all rounded-lg cursor-pointer hover:bg-rose-700 focus-visible:outline-none"
                type="submit"
              >
                Tolak Pesanan
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Info({ label, value, wide }: { label: string; value?: string | number | null; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 border border-border/40 bg-surface p-4 rounded-xl shadow-sm ${wide ? "sm:col-span-2" : ""}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="text-sm font-medium text-ink">
        {value ?? "-"}
      </div>
    </div>
  );
}