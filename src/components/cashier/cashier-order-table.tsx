"use client";

import { Banknote, CheckCircle2, Eye, Truck, X } from "lucide-react";
import { useState } from "react";

import type { ApiListMeta, CashierOrder } from "@/components/cashier/cashier-types";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import {
  getShipmentDeliveryProof,
  getShipmentPackagePhoto,
} from "@/lib/shipment-photos";

// Pewarnaan status yang dikonversi ke skema Neo-Brutalist kontras tinggi
function paymentStatusClass(status?: string | null) {
  if (status === "paid") return "border-2 border-ink bg-emerald-400 text-ink";
  if (status === "failed") return "border-2 border-ink bg-red-400 text-white";
  return "border-2 border-ink bg-amber-400 text-ink";
}

function shipmentStatusClass(status?: string | null) {
  if (status === "delivered") return "border-2 border-ink bg-emerald-400 text-ink";
  if (status === "cancelled") return "border-2 border-ink bg-red-400 text-white";
  if (status === "arrived_at_branch") return "border-2 border-ink bg-cyan-400 text-ink";
  if (status === "picked_up") return "border-2 border-ink bg-blue-400 text-ink";
  return "border-2 border-ink bg-paper text-steel";
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
      {/* Kontainer Manifes Tabel Utama */}
      <section className="overflow-hidden border-2 border-ink bg-paper rounded-app shadow-stamp">
        <div className="overflow-x-auto">
          <table className="w-full min-w-275 border-collapse text-left text-xs font-body">
            <thead className="border-b-2 border-ink bg-paper text-ink">
              <tr className="font-mono font-black uppercase tracking-wider">
                <th className="border-r-2 border-ink px-4 py-3.5 text-center w-35">Status Bayar</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Pelanggan</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Nama Paket</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Total Harga</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Metode Bayar</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Penyerahan</th>
                <th className="border-r-2 border-ink px-4 py-3.5 text-center w-35">Status Paket</th>
                <th className="border-r-2 border-ink px-4 py-3.5">Waktu Pesan</th>
                <th className="px-4 py-3.5">Aksi Tindakan Manifes</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink">
              {loading ? (
                <tr>
                  <td className="px-5 py-12 text-center font-mono text-xs font-bold uppercase tracking-wide text-steel bg-paper" colSpan={9}>
                    [!] MENYINKRONKAN DATA MANIFES...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center font-mono text-xs font-bold uppercase tracking-wide text-steel bg-paper" colSpan={9}>
                    [?] BELUM ADA PESANAN MASUK DALAM SISTEM.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const currentInput = trackingInput(order.id);
                  const awaitingReturn = isAwaitingPickupReturn(order);
                  const needsCourier = needsCourierAssignment(order);

                  return (
                    <tr className="bg-paper hover:bg-slate-50/50 transition-colors" key={order.id}>
                      <td className="border-r-2 border-ink px-4 py-3 text-center">
                        <span className={`inline-block w-full rounded-app px-2 py-1 text-[10px] font-mono font-black uppercase tracking-wide text-center ${paymentStatusClass(order.payments?.payment_status)}`}>
                          {order.payments?.payment_status ?? "UNPAID"}
                        </span>
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 font-bold text-ink">
                        {order.customers_shipments_sender_idTocustomers?.name ?? "-"}
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 text-steel font-medium">
                        {order.shipment_items?.[0]?.item_name ?? "-"}
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 font-mono font-black text-ink">
                        {formatCurrency(order.total_price)}
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 font-mono font-bold uppercase tracking-wide text-ink">
                        {order.payments?.payment_method ?? "-"}
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3">
                        <span className="inline-block rounded-app border-2 border-ink bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-ink">
                          {order.handover_method === "pickup" ? "PICKUP" : "DROP OFF"}
                        </span>
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 text-center">
                        <span className={`inline-block w-full rounded-app px-2 py-1 text-[10px] font-mono font-black uppercase tracking-wide text-center ${shipmentStatusClass(order.status)}`}>
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="border-r-2 border-ink px-4 py-3 font-mono text-steel">
                        {formatDate(order.shipment_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              onConfirm(order, currentInput);
                              setTrackingInputs((current) => ({ ...current, [order.id]: "" }));
                            }}
                          >
                            {/* Tombol Detail */}
                            <button
                              aria-label="Lihat detail pesanan"
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-app border-2 border-ink bg-paper text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs cursor-pointer"
                              onClick={() => setDetail(order)}
                              title="Lihat detail"
                              type="button"
                            >
                              <Eye size={15} className="stroke-[2.5]" />
                            </button>

                            {/* Tombol Cash Verifikasi */}
                            {order.payments?.payment_method === "cash" && order.payments.payment_status === "pending" ? (
                              <button
                                aria-label="Konfirmasi pembayaran cash"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-app border-2 border-ink bg-amber-400 text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs cursor-pointer"
                                onClick={() => onVerifyCash?.(order)}
                                title="Konfirmasi pembayaran cash"
                                type="button"
                              >
                                <Banknote size={15} className="stroke-[2.5]" />
                              </button>
                            ) : null}

                            {/* Alur Form Pengisian Aksi Kasir */}
                            {needsCourier ? (
                              <>
                                <input
                                  className="h-9 w-24 border-2 border-ink bg-paper px-2 font-mono text-xs font-bold uppercase text-ink outline-none placeholder:text-steel/40 rounded-app focus:bg-amber-50/50"
                                  maxLength={5}
                                  onChange={(event) => setCourierInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="ID KURIR"
                                  value={courierInput(order.id)}
                                />
                                <button
                                  className="h-9 rounded-app border-2 border-ink bg-amber-400 px-3 font-display text-[10px] font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
                                  disabled={!courierInput(order.id)}
                                  onClick={() => {
                                    if (courierInput(order.id)) onAssignCourier?.(order, courierInput(order.id));
                                  }}
                                  title="Tugaskan kurir untuk menjemput paket ke rumah pengirim"
                                  type="button"
                                >
                                  <Truck size={12} className="stroke-[2.5]" />
                                  TUGASKAN
                                </button>
                              </>
                            ) : awaitingReturn ? (
                              <>
                                <input
                                  className="h-9 w-36 border-2 border-ink bg-paper px-2 font-mono text-xs font-bold uppercase text-ink outline-none placeholder:text-steel/40 rounded-app focus:border-emerald-500"
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="NO. RESI MANIFES"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket diterima dari kurir"
                                  className="grid h-9 w-9 shrink-0 place-items-center rounded-app border-2 border-ink bg-emerald-400 text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                  disabled={!currentInput.trim()}
                                  title="Konfirmasi paket sudah diterima dari kurir (status: Picked Up)"
                                  type="submit"
                                >
                                  <CheckCircle2 size={15} className="stroke-[2.5]" />
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  className="h-9 w-36 border-2 border-ink bg-paper px-2 font-mono text-xs font-bold uppercase text-ink outline-none placeholder:text-steel/40 rounded-app disabled:opacity-40 focus:border-ink"
                                  disabled={!canConfirm(order)}
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="INPUT RESI BARU"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket"
                                  className="grid h-9 w-9 shrink-0 place-items-center rounded-app border-2 border-ink bg-emerald-400 text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                  disabled={!canConfirm(order) || !currentInput.trim()}
                                  title="Konfirmasi paket"
                                  type="submit"
                                >
                                  <CheckCircle2 size={15} className="stroke-[2.5]" />
                                </button>
                              </>
                            )}

                            {/* Tombol Tolak */}
                            <button
                              aria-label="Tolak pesanan"
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-app border-2 border-ink bg-red-400 text-white shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                              disabled={order.status === "cancelled" || order.status === "delivered"}
                              onClick={() => setRejecting(order)}
                              title="Tolak pesanan"
                              type="button"
                            >
                              <X size={15} className="stroke-[2.5]" />
                            </button>
                          </form>

                          {/* Pemberitahuan Kondisional Penjemputan */}
                          {awaitingReturn ? (
                            <div className="flex items-center gap-1.5 rounded-app border-2 border-dashed border-ink bg-amber-50 px-2 py-1 text-[10px] font-mono font-bold uppercase text-ink">
                              <Truck size={12} className="stroke-[2.5]" />
                              <span>KURIR SEDANG MENJEMPUT — INPUT RESI JIKA BARANG TIBA</span>
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

        {/* Kontrol Navigasi Halaman / Pagination */}
        {meta ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t-2 border-ink bg-paper px-4 py-3.5 text-xs font-mono font-bold uppercase text-ink">
            <span>
              Menampilkan {orders.length === 0 ? 0 : (meta.page - 1) * meta.perPage + 1} - {(meta.page - 1) * meta.perPage + orders.length} dari {meta.total} Entri Manifes
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(meta.totalPages || 1, 5) }, (_, index) => index + 1).map((page) => (
                <button
                  className={`h-8 w-8 rounded-app border-2 border-ink font-mono font-black text-xs transition-all shadow-stamp-xs cursor-pointer ${
                    page === meta.page
                      ? "bg-ink text-paper shadow-none translate-x-0 translate-y-0"
                      : "bg-paper text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0"
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
      </section>

      {/* MODAL WINDOW 1: DETAIL PESANAN KASIR */}
      {detail ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto border-4 border-ink bg-paper p-6 shadow-stamp rounded-app">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b-2 border-ink pb-4">
              <div>
                <h2 className="font-display text-xl font-black uppercase tracking-wide text-ink">
                  MANIFES DETAILED LOG
                </h2>
                <p className="font-mono text-[11px] font-bold uppercase text-steel">
                  Pemeriksaan mendalam berkas logistik internal customer
                </p>
              </div>
              <button
                className="h-10 border-2 border-ink bg-paper px-4 font-display text-xs font-black uppercase tracking-wider text-ink shadow-stamp-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp active:translate-x-0 active:translate-y-0 rounded-app cursor-pointer"
                onClick={() => setDetail(null)}
                type="button"
              >
                TUTUP JENDELA
              </button>
            </div>

            {/* Grid Informasi Grid Utama */}
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
              <Info label="Metode Penyerahan" value={detail.handover_method === "pickup" ? "JEMPUT PAKET (PICKUP)" : "DROP OFF MANDIRI"} />
              <Info label="Sistem Pembayaran" value={detail.payments?.payment_method} />
              <Info label="Status Pembayaran" value={detail.payments?.payment_status} />
              <Info label="Status Lokasi Paket" value={detail.status} />
              <Info label="No. Resi Pelacakan" value={detail.tracking_number} />
              <Info label="Total Harga Final" value={formatCurrency(detail.total_price)} />
            </div>

            {/* Foto Lampiran Paket Manifes */}
            {getShipmentPackagePhoto(detail) ? (
              <div className="mt-5 border-2 border-ink p-2 bg-white rounded-app shadow-stamp-xs">
                <p className="mb-2 font-mono text-[10px] font-black uppercase text-ink tracking-wide">// LAMPIRAN FOTO ITEM FISIK</p>
                <img alt="Foto Paket" className="h-48 w-full border border-ink object-cover rounded-app" src={getShipmentPackagePhoto(detail) ?? ""} />
              </div>
            ) : null}

            {/* Bukti Penerapan Delivery / Paket Tiba */}
            {getShipmentDeliveryProof(detail) ? (
              <div className="mt-5 border-2 border-ink p-2 bg-white rounded-app shadow-stamp-xs">
                <p className="mb-2 font-mono text-[10px] font-black uppercase text-ink tracking-wide">// BUKTI SERAH TERIMA VALID</p>
                <img alt="Bukti penyerahan" className="h-48 w-full border border-ink object-cover rounded-app" src={getShipmentDeliveryProof(detail) ?? ""} />
              </div>
            ) : null}

            {/* Pelacakan Histori Logistik */}
            <h3 className="mt-6 font-display font-black text-sm uppercase tracking-wider text-ink">
              TIMELINE PELACAKAN RUTE MANIFES
            </h3>
            <div className="mt-3 grid gap-3">
              {(detail.shipment_trackings ?? []).map((tracking) => (
                <div className="border-2 border-ink bg-white p-4 rounded-app shadow-stamp-xs" key={tracking.id}>
                  <div className="font-mono text-xs font-black uppercase text-ink tracking-wide">[STATUS]: {tracking.status?.replace(/_/g, " ")}</div>
                  <div className="mt-0.5 font-mono text-[10px] font-bold uppercase text-steel">
                    LOKASI: {tracking.location} — {formatDate(tracking.tracked_at)}
                  </div>
                  <p className="mt-2 text-xs font-body font-medium text-ink bg-slate-50 border border-ink/20 p-2 rounded-app">
                    {tracking.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL WINDOW 2: PENOLAKAN PESANAN */}
      {rejecting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <form
            className="w-full max-w-md border-4 border-ink bg-paper p-6 shadow-stamp rounded-app"
            onSubmit={(event) => {
              event.preventDefault();
              onReject(rejecting, reason);
              setRejecting(null);
              setReason("");
            }}
          >
            <h2 className="font-display text-lg font-black uppercase tracking-wide text-ink">
              TOLAK PESANAN MASUK
            </h2>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase text-steel">
              Berikan parameter alasan penolakan manifes logistik secara terperinci.
            </p>

            <div className="mt-5 space-y-1.5">
              <label className="block font-mono text-[10px] font-black uppercase tracking-wider text-ink">
                ALASAN PENOLAKAN INTERNAL
              </label>
              <textarea
                className="w-full min-h-25 border-2 border-ink bg-white p-3 font-body text-xs font-semibold text-ink outline-none placeholder:text-steel/40 rounded-app focus:shadow-stamp-sm transition-all"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contoh: Alamat pengirim di luar jangkauan armada, paket melanggar ketentuan SOP logistik, barang berbahaya..."
                required
                value={reason}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="h-10 border-2 border-ink bg-paper px-4 font-display text-xs font-black uppercase tracking-wider text-ink shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 rounded-app cursor-pointer"
                onClick={() => setRejecting(null)}
                type="button"
              >
                BATALKAN
              </button>
              <button
                className="h-10 border-2 border-ink bg-red-400 px-4 font-display text-xs font-black uppercase tracking-wider text-white shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 rounded-app cursor-pointer"
                type="submit"
              >
                TOLAK MANIFES
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

// Sub-komponen Info Panel dengan sentuhan Box Manifes Kargo Tebal
function Info({ label, value, wide }: { label: string; value?: string | number | null; wide?: boolean }) {
  return (
    <div className={`border-2 border-ink bg-white p-3 rounded-app shadow-stamp-xs ${wide ? "sm:col-span-2" : ""}`}>
      <div className="font-mono text-[9px] font-black uppercase tracking-widest text-steel">
        {label}
      </div>
      <div className="mt-1 font-body text-xs font-black text-ink uppercase tracking-wide wrap-break-word">
        {value ?? "-"}
      </div>
    </div>
  );
}