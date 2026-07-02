import type { Branch, Payment, Shipment } from "@/types/customer-portal";

export type CashierFilters = {
  search: string;
  period: string;
  paymentMethod: string;
  paymentStatus: string;
  shipmentStatus: string;
  fromDate: string;
  toDate: string;
  page: number;
  limit: number;
};

export type CashierSummary = {
  branch: Branch | null;
  pendingOrders: number;
  failedOrCancelled: number;
  paidToday: number;
  totalRevenue: number;
  growthPercent: number;
  updatedAt: string;
};

export type CashierReport = {
  branch: Branch | null;
  summary: {
    totalRevenue: number;
    totalCash: number;
    totalOnline: number;
    totalPending: number;
    totalFailed: number;
    totalTransactions: number;
  };
  chart: Array<{ date: string; revenue: number }>;
  chartDaily: Array<{ date: string; revenue: number }>;
  chartMonthly: Array<{ month: string; revenue: number }>;
  transactions: Payment[];
};

export type CashierOrder = Shipment;

export type ApiListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};
