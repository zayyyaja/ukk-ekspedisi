"use client";

import { Banknote, CheckCircle2, Eye, Truck, X } from "lucide-react";
import { useState } from "react";

import type { ApiListMeta, CashierOrder } from "@/components/cashier/cashier-types";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import {
  getShipmentDeliveryProof,
  getShipmentPackagePhoto,
} from "@/lib/shipment-photos";

function paymentStatusClass(status?: string | null) {
  if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "failed") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function shipmentStatusClass(status?: string | null) {
  if (status === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "cancelled") return "border-red-200 bg-red-50 text-red-700";
  if (status === "arrived_at_branch") return "border-orange-200 bg-orange-50 text-orange-700";
  if (status === "picked_up") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

/** Kasir bisa konfirmasi picked_up jika:
 * - Drop-off: pembayaran paid + status pending
 * - Pickup:   pembayaran paid + status pending + kurir sudah di-assign (courier_id ada)
 */
function canConfirm(order: CashierOrder) {
  if (order.payments?.payment_status !== "paid") return false;
  if (order.status !== "pending") return false;
  if (order.handover_method === "pickup" && !order.courier_id) return false;
  return true;
}

/** Apakah order pickup yang sedang menunggu kurir kembali */
function isAwaitingPickupReturn(order: CashierOrder) {
  return (
    order.handover_method === "pickup" &&
    order.payments?.payment_status === "paid" &&
    order.status === "pending" &&
    Boolean(order.courier_id)
  );
}

/** Apakah order pickup yang belum assign kurir */
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
      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-5 py-4">Status Pembayaran</th>
                <th className="px-5 py-4">Pelanggan</th>
                <th className="px-5 py-4">Nama Paket</th>
                <th className="px-5 py-4">Total Harga</th>
                <th className="px-5 py-4">Metode Pembayaran</th>
                <th className="px-5 py-4">Metode Penyerahan</th>
                <th className="px-5 py-4">Status Paket</th>
                <th className="px-5 py-4">Waktu Pesan</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={9}>Memuat data...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={9}>Belum ada pesanan.</td></tr>
              ) : (
                orders.map((order) => {
                  const currentInput = trackingInput(order.id);
                  const awaitingReturn = isAwaitingPickupReturn(order);
                  const needsCourier = needsCourierAssignment(order);

                  return (
                    <tr className="border-t border-slate-100" key={order.id}>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${paymentStatusClass(order.payments?.payment_status)}`}>
                          {order.payments?.payment_status ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">{order.customers_shipments_sender_idTocustomers?.name ?? "-"}</td>
                      <td className="px-5 py-4">{order.shipment_items?.[0]?.item_name ?? "-"}</td>
                      <td className="px-5 py-4">{formatCurrency(order.total_price)}</td>
                      <td className="px-5 py-4">{order.payments?.payment_method ?? "-"}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {order.handover_method === "pickup" ? "Jemput Paket" : "Drop Off"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${shipmentStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">{formatDate(order.shipment_date)}</td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[360px] flex-col gap-2">
                          <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                              event.preventDefault();
                              onConfirm(order, currentInput);
                              setTrackingInputs((current) => ({ ...current, [order.id]: "" }));
                            }}
                          >
                            <button
                              aria-label="Lihat detail pesanan"
                              className="grid h-10 w-10 place-items-center rounded-lg border border-orange-500 text-orange-600"
                              onClick={() => setDetail(order)}
                              title="Lihat detail"
                              type="button"
                            >
                              <Eye size={17} />
                            </button>

                            {order.payments?.payment_method === "cash" && order.payments.payment_status === "pending" ? (
                              <button
                                aria-label="Konfirmasi pembayaran cash"
                                className="grid h-10 w-10 place-items-center rounded-lg border border-amber-300 text-amber-600"
                                onClick={() => onVerifyCash?.(order)}
                                title="Konfirmasi pembayaran cash"
                                type="button"
                              >
                                <Banknote size={17} />
                              </button>
                            ) : null}

                            {needsCourier ? (
                              <>
                                <input
                                  className="h-10 w-28 rounded-lg border border-slate-200 px-3 text-xs font-semibold uppercase outline-none focus:border-orange-500"
                                  maxLength={5}
                                  onChange={(event) => setCourierInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="ID Kurir"
                                  value={courierInput(order.id)}
                                />
                                <button
                                  className="h-10 rounded-lg bg-orange-100 px-4 text-xs font-bold text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                                  disabled={!courierInput(order.id)}
                                  onClick={() => {
                                    if (courierInput(order.id)) onAssignCourier?.(order, courierInput(order.id));
                                  }}
                                  title="Tugaskan kurir untuk menjemput paket ke rumah pengirim"
                                  type="button"
                                >
                                  <Truck size={14} className="inline mr-1" />
                                  Tugaskan Kurir
                                </button>
                              </>
                            ) : awaitingReturn ? (
                              <>
                                <input
                                  className="h-10 w-40 rounded-lg border border-slate-200 px-3 text-xs font-semibold uppercase outline-none focus:border-emerald-500"
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="No. Resi paket"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket diterima dari kurir"
                                  className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-300 text-emerald-600 disabled:border-slate-200 disabled:text-slate-400"
                                  disabled={!currentInput.trim()}
                                  title="Konfirmasi paket sudah diterima dari kurir (status: Picked Up)"
                                  type="submit"
                                >
                                  <CheckCircle2 size={17} />
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  className="h-10 w-40 rounded-lg border border-slate-200 px-3 text-xs font-semibold uppercase outline-none focus:border-orange-500"
                                  disabled={!canConfirm(order)}
                                  onChange={(event) => setTrackingInputs((current) => ({ ...current, [order.id]: event.target.value }))}
                                  placeholder="Input resi"
                                  value={currentInput}
                                />
                                <button
                                  aria-label="Konfirmasi paket"
                                  className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-300 text-emerald-600 disabled:border-slate-200 disabled:text-slate-400"
                                  disabled={!canConfirm(order) || !currentInput.trim()}
                                  title="Konfirmasi paket"
                                  type="submit"
                                >
                                  <CheckCircle2 size={17} />
                                </button>
                              </>
                            )}

                            <button
                              aria-label="Tolak pesanan"
                              className="grid h-10 w-10 place-items-center rounded-lg border border-red-400 text-red-600 disabled:border-slate-200 disabled:text-slate-400"
                              disabled={order.status === "cancelled" || order.status === "delivered"}
                              onClick={() => setRejecting(order)}
                              title="Tolak pesanan"
                              type="button"
                            >
                              <X size={17} />
                            </button>
                          </form>

                          {awaitingReturn ? (
                            <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
                              <Truck size={13} />
                              <span>Kurir sedang menjemput — input resi setelah paket tiba di kasir</span>
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
        {meta ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            <span>Menampilkan {orders.length === 0 ? 0 : (meta.page - 1) * meta.perPage + 1}-{(meta.page - 1) * meta.perPage + orders.length} dari {meta.total} data</span>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(meta.totalPages || 1, 5) }, (_, index) => index + 1).map((page) => (
                <button className={`h-9 w-9 rounded-lg ${page === meta.page ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`} key={page} onClick={() => onPageChange?.(page)} type="button">
                  {page}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {detail ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Detail Pesanan</h2>
                <p className="text-slate-500">Informasi pesanan customer</p>
              </div>
              <button className="button secondary" onClick={() => setDetail(null)} type="button">Tutup</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
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
              <Info label="Nama Paket" value={detail.shipment_items?.[0]?.item_name} />
              <Info label="Berat" value={`${detail.total_weight} kg`} />
              <Info label="Cabang Asal" value={detail.branches_shipments_origin_branch_idTobranches?.name} />
              <Info label="Cabang Tujuan" value={detail.branches_shipments_destination_branch_idTobranches?.name} />
              <Info label="Metode Penyerahan" value={detail.handover_method === "pickup" ? "Jemput Paket" : "Drop Off"} />
              <Info label="Metode Pembayaran" value={detail.payments?.payment_method} />
              <Info label="Status Pembayaran" value={detail.payments?.payment_status} />
              <Info label="Status Paket" value={detail.status} />
              <Info label="No. Resi" value={detail.tracking_number} />
              <Info label="Total Harga" value={formatCurrency(detail.total_price)} />
            </div>
            {getShipmentPackagePhoto(detail) ? (
              <img alt="Foto Paket" className="mt-5 h-48 w-full rounded-2xl object-cover" src={getShipmentPackagePhoto(detail) ?? ""} />
            ) : null}
            {getShipmentDeliveryProof(detail) ? (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-700">Bukti paket telah diterima</p>
                <img alt="Bukti penyerahan" className="h-48 w-full rounded-2xl object-cover" src={getShipmentDeliveryProof(detail) ?? ""} />
              </div>
            ) : null}
            <h3 className="mt-6 font-bold">Timeline Tracking</h3>
            <div className="mt-3 grid gap-3">
              {(detail.shipment_trackings ?? []).map((tracking) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={tracking.id}>
                  <div className="font-semibold">{tracking.status}</div>
                  <div className="text-sm text-slate-500">{tracking.location} - {formatDate(tracking.tracked_at)}</div>
                  <p className="mt-1 text-sm">{tracking.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {rejecting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onSubmit={(event) => { event.preventDefault(); onReject(rejecting, reason); setRejecting(null); setReason(""); }}>
            <h2 className="text-2xl font-bold">Tolak Pesanan</h2>
            <p className="mt-1 text-slate-500">Tuliskan alasan penolakan pesanan customer.</p>
            <div className="field mt-5">
              <label>Alasan Penolakan</label>
              <textarea className="input min-h-28" onChange={(event) => setReason(event.target.value)} placeholder="Alamat tidak valid, paket tidak sesuai SOP, paket dilarang" required value={reason} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="button secondary" onClick={() => setRejecting(null)} type="button">Batal</button>
              <button className="button danger" type="submit">Tolak</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Info({ label, value, wide }: { label: string; value?: string | number | null; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-xs font-semibold uppercase text-slate-400">{label}</div>
      <div className="mt-1 font-semibold">{value ?? "-"}</div>
    </div>
  );
}
