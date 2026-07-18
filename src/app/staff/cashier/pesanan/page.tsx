"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  assignCashierPickupCourier,
  confirmCashierOrder,
  fetchCashierOrders,
  fetchCashierSummary,
  rejectCashierOrder,
  verifyCashierCashPayment,
} from "@/components/cashier/cashier-api";
import { CashierFiltersBar } from "@/components/cashier/cashier-filters";
import { CashierOrderTable } from "@/components/cashier/cashier-order-table";
import { CashierQueryProvider } from "@/components/cashier/cashier-query-provider";
import { CashierShell } from "@/components/cashier/cashier-shell";
import type { CashierFilters, CashierOrder } from "@/components/cashier/cashier-types";

const initialFilters: CashierFilters = { search: "", period: "30d", paymentMethod: "", paymentStatus: "paid", shipmentStatus: "", fromDate: "", toDate: "", page: 1, limit: 10 };

function OrdersContent() {
  const [filters, setFilters] = useState(initialFilters);
  const queryClient = useQueryClient();
  const summary = useQuery({ queryKey: ["cashier-summary-branch"], queryFn: () => fetchCashierSummary({ period: "today" }) });
  const orders = useQuery({ queryKey: ["cashier-orders", filters], queryFn: () => fetchCashierOrders(filters) });
  const confirm = useMutation({
    mutationFn: ({ order, trackingNumber }: { order: CashierOrder; trackingNumber: string }) => confirmCashierOrder(order.id, trackingNumber),
    onSuccess: () => {
      toast.success("Paket berhasil dikonfirmasi.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["cashier-summary-branch"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Konfirmasi paket gagal."),
  });
  const reject = useMutation({
    mutationFn: ({ order, reason }: { order: CashierOrder; reason: string }) => rejectCashierOrder(order.id, reason),
    onSuccess: () => {
      toast.success("Pesanan berhasil ditolak.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Pesanan gagal ditolak."),
  });
  const verifyCash = useMutation({
    mutationFn: (order: CashierOrder) => verifyCashierCashPayment(order.payments?.id ?? "", Number(order.payments?.amount ?? order.total_price)),
    onSuccess: () => {
      toast.success("Pembayaran cash berhasil dikonfirmasi.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["cashier-summary-branch"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Verifikasi cash gagal."),
  });
  const assignCourier = useMutation({
    mutationFn: ({ order, courierCode }: { order: CashierOrder; courierCode: string }) => assignCashierPickupCourier(order.id, courierCode),
    onSuccess: () => {
      toast.success("Kurir pickup berhasil ditugaskan.");
      void queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Assign kurir gagal."),
  });

  return (
    <CashierShell branchName={summary.data?.branch?.name} search={filters.search} onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Pesanan</h1>
          <p className="mt-2 text-sm font-medium text-muted">Semua pesanan cabang dengan filter riwayat.</p>
        </div>
        <CashierFiltersBar filters={filters} onChange={setFilters} table />
        <CashierOrderTable
          orders={orders.data?.data ?? []}
          meta={orders.data?.meta}
          loading={orders.isLoading}
          onAssignCourier={(order, courierCode) => assignCourier.mutate({ order, courierCode })}
          onConfirm={(order, trackingNumber) => confirm.mutate({ order, trackingNumber })}
          onReject={(order, reason) => reject.mutate({ order, reason })}
          onVerifyCash={(order) => verifyCash.mutate(order)}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>
    </CashierShell>
  );
}

export default function CashierPesananPage() {
  return <CashierQueryProvider><OrdersContent /></CashierQueryProvider>;
}
