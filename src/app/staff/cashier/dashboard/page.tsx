"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Clipboard, ShoppingBag, WalletCards } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  assignCashierPickupCourier,
  confirmCashierOrder,
  fetchCashierSummary,
  fetchRecentCashierOrders,
  rejectCashierOrder,
  verifyCashierCashPayment,
} from "@/components/cashier/cashier-api";
import { CashierFiltersBar } from "@/components/cashier/cashier-filters";
import { CashierOrderTable } from "@/components/cashier/cashier-order-table";
import { CashierQueryProvider } from "@/components/cashier/cashier-query-provider";
import { CashierSettingsHint, CashierShell } from "@/components/cashier/cashier-shell";
import type { CashierFilters, CashierOrder } from "@/components/cashier/cashier-types";
import { formatCurrency } from "@/lib/customer-format";

const initialFilters: CashierFilters = {
  search: "",
  period: "today",
  paymentMethod: "",
  paymentStatus: "",
  shipmentStatus: "",
  fromDate: "",
  toDate: "",
  page: 1,
  limit: 5,
};

function DashboardContent() {
  const [filters, setFilters] = useState(initialFilters);
  const queryClient = useQueryClient();
  const summary = useQuery({ queryKey: ["cashier-summary", filters], queryFn: () => fetchCashierSummary(filters) });
  const orders = useQuery({ queryKey: ["cashier-recent-orders", filters], queryFn: () => fetchRecentCashierOrders(filters) });
  const confirm = useMutation({
    mutationFn: ({ order, trackingNumber }: { order: CashierOrder; trackingNumber: string }) => confirmCashierOrder(order.id, trackingNumber),
    onSuccess: () => {
      toast.success("Paket berhasil dikonfirmasi.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["cashier-recent-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Konfirmasi paket gagal."),
  });
  const reject = useMutation({
    mutationFn: ({ order, reason }: { order: CashierOrder; reason: string }) => rejectCashierOrder(order.id, reason),
    onSuccess: () => {
      toast.success("Pesanan berhasil ditolak.");
      void queryClient.invalidateQueries({ queryKey: ["cashier"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Pesanan gagal ditolak."),
  });
  const verifyCash = useMutation({
    mutationFn: (order: CashierOrder) => verifyCashierCashPayment(order.payments?.id ?? "", Number(order.payments?.amount ?? order.total_price)),
    onSuccess: () => {
      toast.success("Pembayaran cash berhasil dikonfirmasi.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["cashier-recent-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Verifikasi cash gagal."),
  });
  const assignCourier = useMutation({
    mutationFn: ({ order, courierCode }: { order: CashierOrder; courierCode: string }) => assignCashierPickupCourier(order.id, courierCode),
    onSuccess: () => {
      toast.success("Kurir pickup berhasil ditugaskan.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-recent-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Assign kurir gagal."),
  });
  const data = summary.data;

  return (
    <CashierShell branchName={data?.branch?.name} search={filters.search} onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Beranda</h1>
          <p className="mt-2 text-slate-500">Ringkasan informasi dari cabang Anda hari ini.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">Data diperbarui sekarang</div>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<ShoppingBag />} label="Pesanan Pending" value={data?.pendingOrders ?? 0} tone="amber" description="Menunggu pembayaran atau proses awal." />
        <SummaryCard icon={<Clipboard />} label="Pembayaran / Pesanan Gagal" value={data?.failedOrCancelled ?? 0} tone="red" description="Perlu perhatian." />
        <SummaryCard icon={<WalletCards />} label="Pembayaran Hari Ini" value={data?.paidToday ?? 0} tone="green" description="Transaksi berhasil." />
        <SummaryCard icon={<BarChart3 />} label="Total Pemasukan" value={formatCurrency(data?.totalRevenue ?? 0)} tone="slate" />
      </div>

      <section className="mt-8">
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-xl font-bold">Daftar Pesanan Terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">Pesanan dari cabang Anda yang perlu dipantau hari ini.</p>
          </div>
          <div className="md:justify-self-end">
            <CashierFiltersBar filters={filters} onChange={setFilters} />
          </div>
        </div>
        <CashierOrderTable
          orders={orders.data?.data ?? []}
          meta={orders.data?.meta}
          loading={orders.isLoading}
          onAssignCourier={(order, courierCode) => assignCourier.mutate({ order, courierCode })}
          onConfirm={(order, trackingNumber) => confirm.mutate({ order, trackingNumber })}
          onReject={(order, reason) => reject.mutate({ order, reason })}
          onVerifyCash={(order) => verifyCash.mutate(order)}
        />
      </section>

      <CashierSettingsHint />
    </CashierShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  tone: "primary" | "red" | "green" | "slate" | "amber";
}) {
  const styles = {
    primary: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-700",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${styles[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {description ? <p className="mt-2 text-sm font-semibold text-blue-700">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function CashierDashboardPage() {
  return (
    <CashierQueryProvider>
      <DashboardContent />
    </CashierQueryProvider>
  );
}
