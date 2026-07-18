"use client";

import { Bell, MailOpen, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiGet, apiPatch } from "@/lib/api-client";
import { formatDate } from "@/lib/customer-format";
import { BentoHeader } from "@/components/customer/bento-header";

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
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 font-body pb-16">
        <header className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
            <Bell size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Notifications</h1>
            <p className="mt-2 text-sm font-medium text-muted">
              Order updates and latest information.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 backdrop-blur-xl p-16 text-center text-muted font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            Loading inbox...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-background/50 p-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-slate-100 text-muted rounded-2xl mb-6">
              <MailOpen size={32} />
            </div>
            <p className="text-lg font-semibold text-ink">No new notifications</p>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
              Order and delivery notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${
                  notification.is_read ? "border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "border-primary/20 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                }`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        notification.is_read ? "bg-background/80 text-muted border border-border/60" : "bg-primary/20 text-primary border border-primary/20"
                      }`}>
                        <Package size={20} />
                      </div>
                      <h2 className="text-base font-semibold text-ink leading-tight">{notification.title}</h2>
                      {!notification.is_read && (
                        <span className="rounded-lg bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-primary shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-muted pl-14">{notification.message}</p>
                    {notification.shipments && (
                      <div className="pl-14">
                        <div className="inline-flex items-center gap-3 bg-background/50 border border-border/60 px-4 py-2 rounded-xl text-xs font-semibold text-ink">
                          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Tracking</span>
                          <span>{notification.shipments.tracking_number}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Status</span>
                          <span className="text-primary">{notification.shipments.status.replaceAll("_", " ")}</span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted pl-14">{formatDate(notification.created_at)}</p>
                  </div>

                  <div className="flex shrink-0 gap-3 sm:flex-col sm:items-end">
                    {!notification.is_read && (
                      <button
                        className="rounded-2xl border border-border/60 bg-background/50 px-5 py-3 text-xs font-semibold text-ink hover:bg-slate-50 transition-colors shadow-sm"
                        onClick={() => markAsRead(notification)}
                        type="button"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.shipments && (
                      <Link
                        className="rounded-2xl bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        href={`/customer/pesanan/${notification.shipments.id}`}
                        onClick={() => {
                          void markAsRead(notification);
                        }}
                      >
                        View Order
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
