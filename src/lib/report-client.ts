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
  return (await apiGet<Shipment[]>(`/api/v1/admin/shipments?${params(filters)}`)).data;
}

export async function getAdminPaymentReport(filters?: ReportFilters) {
  return (await apiGet<Payment[]>(`/api/v1/admin/payments?${params(filters)}`)).data;
}

export async function getAdminCustomerReport(filters?: ReportFilters) {
  return (await apiGet<CustomerRecord[]>(`/api/v1/admin/customers?${params(filters)}`)).data;
}

export async function getAdminStaffReport(filters?: ReportFilters) {
  return (await apiGet<StaffUser[]>(`/api/v1/admin/users?${params(filters)}`)).data;
}

export async function getAdminBranchReport(filters?: ReportFilters) {
  return (await apiGet<Branch[]>(`/api/v1/admin/branches?${params(filters)}`)).data;
}

export async function getCashierPaymentReport(filters?: ReportFilters) {
  return (await apiGet<Payment[]>(`/api/v1/cashier/payments?${params(filters)}`)).data;
}

export async function getManagerRevenueReport() {
  return (await apiGet<Record<string, unknown>>("/api/v1/manager/payments/summary")).data;
}

export async function getManagerShipmentReport(filters?: ReportFilters) {
  return (await apiGet<Shipment[]>(`/api/v1/admin/shipments?${params(filters)}`)).data;
}

export async function getManagerBranchPerformanceReport() {
  return (await apiGet<DashboardSummary>("/api/v1/manager/dashboard")).data;
}

export async function getManagerCourierPerformanceReport(filters?: ReportFilters) {
  return (await apiGet<Shipment[]>(`/api/v1/admin/shipments?${params(filters)}`)).data;
}
