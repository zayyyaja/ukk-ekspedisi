"use client";

import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type { ApiListMeta, CashierFilters, CashierOrder, CashierReport, CashierSummary } from "@/components/cashier/cashier-types";

function queryString(filters: Partial<CashierFilters>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export async function fetchCashierSummary(filters: Partial<CashierFilters>) {
  const qs = queryString(filters);
  const response = await apiGet<CashierSummary>(`/api/v2/cashier/dashboard/summary${qs ? `?${qs}` : ""}`);
  return response.data;
}

export async function fetchCashierOrders(filters: Partial<CashierFilters>) {
  const qs = queryString(filters);
  const response = await apiGet<CashierOrder[]>(`/api/v2/cashier/orders${qs ? `?${qs}` : ""}`);
  return { data: response.data, meta: response.meta as ApiListMeta };
}

export async function fetchRecentCashierOrders(filters: Partial<CashierFilters>) {
  const qs = queryString(filters);
  const response = await apiGet<CashierOrder[]>(`/api/v2/cashier/orders/recent${qs ? `?${qs}` : ""}`);
  return { data: response.data, meta: response.meta as ApiListMeta };
}

export async function createCashierOrder(payload: Record<string, unknown>) {
  const response = await apiPost<CashierOrder>("/api/v2/cashier/orders", payload);
  return response.data;
}

export async function confirmCashierOrder(id: string, trackingNumber: string) {
  const response = await apiPatch<CashierOrder>(`/api/v2/cashier/orders/${id}/confirm`, { trackingNumber });
  return response.data;
}

export async function verifyCashierCashPayment(paymentId: string, paidAmount: number) {
  const response = await apiPatch<CashierOrder>(`/api/v2/cashier/payments/${paymentId}/verify-cash`, { paidAmount });
  return response.data;
}

export async function assignCashierPickupCourier(id: string, courierCode: string) {
  const response = await apiPatch<CashierOrder>(`/api/v2/cashier/orders/${id}/assign-courier`, { courierCode });
  return response.data;
}

export async function verifyCashierOrderByResi(trackingNumber: string) {
  const response = await apiPost<CashierOrder>("/api/v2/cashier/orders/verify-resi", { trackingNumber });
  return response.data;
}

export async function rejectCashierOrder(id: string, reason: string) {
  const response = await apiPatch<CashierOrder>(`/api/v2/cashier/orders/${id}/reject`, { reason });
  return response.data;
}

export async function fetchCashierReport(filters: Partial<CashierFilters>) {
  const qs = queryString(filters);
  const response = await apiGet<CashierReport>(`/api/v2/cashier/reports${qs ? `?${qs}` : ""}`);
  return response.data;
}
