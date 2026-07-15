"use client";

import { apiGet } from "@/lib/api-client";
import { queryString } from "@/lib/customer-format";
import type {
  Branch,
  CustomerRecord,
  DashboardSummary,
  Payment,
  Shipment,
  StaffUser,
} from "@/types/customer-portal";
import type { ReportFilters } from "@/types/report";

function params(filters?: ReportFilters) {
  return queryString({
    fromDate: filters?.fromDate,
    toDate: filters?.toDate,
    branchId: filters?.branchId,
    status: filters?.status,
    paymentStatus: filters?.status,
    limit: 100,
  });
}

export async function getAdminShipmentReport(filters?: ReportFilters) {
  return (await apiGet<Shipment[]>(`/api/v2/admin/shipments?${params(filters)}`)).data;
}

export async function getAdminPaymentReport(filters?: ReportFilters) {
  return (await apiGet<Payment[]>(`/api/v2/admin/payments?${params(filters)}`)).data;
}

export async function getAdminCustomerReport(filters?: ReportFilters) {
  return (await apiGet<CustomerRecord[]>(`/api/v2/admin/customers?${params(filters)}`)).data;
}

export async function getAdminStaffReport(filters?: ReportFilters) {
  return (await apiGet<StaffUser[]>(`/api/v2/admin/users?${params(filters)}`)).data;
}

export async function getAdminBranchReport(filters?: ReportFilters) {
  return (await apiGet<Branch[]>(`/api/v2/admin/branches?${params(filters)}`)).data;
}

export async function getCashierPaymentReport(filters?: ReportFilters) {
  return (await apiGet<Payment[]>(`/api/v2/cashier/payments?${params(filters)}`)).data;
}

export async function getManagerRevenueReport() {
  return (await apiGet<Record<string, unknown>>("/api/v2/manager/payments/summary")).data;
}

export async function getManagerShipmentReport(filters?: ReportFilters) {
  return (await apiGet<Shipment[]>(`/api/v2/admin/shipments?${params(filters)}`)).data;
}

export async function getManagerBranchPerformanceReport() {
  return (await apiGet<DashboardSummary>("/api/v2/manager/dashboard")).data;
}

export async function getManagerCourierPerformanceReport(filters?: ReportFilters) {
  return (await apiGet<Shipment[]>(`/api/v2/admin/shipments?${params(filters)}`)).data;
}
