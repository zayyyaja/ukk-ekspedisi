"use client";

import { Bell, MailOpen, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { apiGet, apiPatch } from "@/lib/api-client";
import { formatDate } from "@/lib/customer-format";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  shipments?: {
    id: string;
    tracking_number: string;
    status: string;
    shipment_date: string;
  } | null;
};

export default function CustomerInboxPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<NotificationItem[]>("/api/v2/customer/notifications?limit=50")
      .then((response) => setItems(response.data))
      .catch((currentError) => {
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat inbox.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function markAsRead(notification: NotificationItem) {
    if (notification.is_read) {
      return;
    }

    try {
      await apiPatch(`/api/v2/customer/notifications/${notification.id}/read`, {});
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (currentError) {
      toast.error(currentError instanceof Error ? currentError.message : "Gagal menandai pesan.");
    }
  }

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inbox / Pesan</h1>
            <p className="mt-1 text-slate-500">
              Notifikasi paket yang ditujukan ke email akun Anda. Hanya baca — tidak perlu membalas.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Memuat pesan...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <MailOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-700">Belum ada pesan</p>
            <p className="mt-2 text-sm text-slate-500">
              Notifikasi muncul jika seseorang mengirim paket dan mencantumkan email akun Anda sebagai penerima.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
                  notification.is_read ? "border-slate-200" : "border-orange-200 bg-orange-50/40"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-orange-500" />
                      <h2 className="font-bold text-slate-900">{notification.title}</h2>
                      {!notification.is_read && (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{notification.message}</p>
                    {notification.shipments && (
                      <p className="text-xs font-medium text-slate-500">
                        Resi: {notification.shipments.tracking_number} · Status: {notification.shipments.status.replaceAll("_", " ")}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">{formatDate(notification.created_at)}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {!notification.is_read && (
                      <button
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => markAsRead(notification)}
                        type="button"
                      >
                        Tandai dibaca
                      </button>
                    )}
                    {notification.shipments && (
                      <Link
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                        href={`/customer/pesanan/${notification.shipments.id}`}
                        onClick={() => {
                          void markAsRead(notification);
                        }}
                      >
                        Lihat tracking
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </CustomerNavbarShell>
  );
}
