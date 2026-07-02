import type { Prisma } from "@prisma/client";
import { payments_payment_method, payments_payment_status, shipments_status } from "@prisma/client";

import {
  confirmCashierPackage,
  confirmCashierPayment,
  cancelExpiredCashierOrders,
  findCashierBranch,
  findCashierOrderById,
  findCashierOrderByTrackingNumber,
  findCashierOrders,
  findCashierPaymentsByBranch,
  rejectCashierOrder,
} from "@/repositories/cashier.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import type { AuthUser } from "@/types/auth";

export type CashierPeriod = "today" | "yesterday" | "7d" | "30d" | "month" | "custom";

export type CashierOrderQuery = {
  search?: string;
  shipmentStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  period?: CashierPeriod;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};

function ensureCashier(user: AuthUser) {
  if (user.role !== "cashier") {
    throw new ForbiddenError("Cashier access required");
  }

  if (!user.branchId) {
    throw new ForbiddenError("Cashier branch is required");
  }
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function dateRange(query: CashierOrderQuery) {
  const now = new Date();
  const period = query.period ?? "today";

  if (period === "custom" && (query.fromDate || query.toDate)) {
    return {
      gte: query.fromDate ? startOfDay(new Date(query.fromDate)) : undefined,
      lte: query.toDate ? endOfDay(new Date(query.toDate)) : undefined,
    };
  }

  if (period === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return { gte: startOfDay(yesterday), lte: endOfDay(yesterday) };
  }

  if (period === "7d" || period === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - (period === "7d" ? 6 : 29));
    return { gte: startOfDay(start), lte: endOfDay(now) };
  }

  if (period === "month") {
    return { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: endOfDay(now) };
  }

  return { gte: startOfDay(now), lte: endOfDay(now) };
}

function buildOrderWhere(query: CashierOrderQuery): Prisma.shipmentsWhereInput {
  const where: Prisma.shipmentsWhereInput = {};
  const range = dateRange(query);

  where.created_at = range;

  if (query.shipmentStatus) {
    where.status = query.shipmentStatus as shipments_status;
  }

  if (query.paymentStatus || query.paymentMethod) {
    where.payments = {
      payment_status: query.paymentStatus ? (query.paymentStatus as payments_payment_status) : undefined,
      payment_method: query.paymentMethod ? (query.paymentMethod as payments_payment_method) : undefined,
    };
  }

  if (query.search) {
    where.OR = [
      { tracking_number: { contains: query.search } },
      { customers_shipments_sender_idTocustomers: { name: { contains: query.search } } },
      { shipment_items: { some: { item_name: { contains: query.search } } } },
    ];
  }

  return where;
}

function buildPaymentWhere(query: CashierOrderQuery): Prisma.paymentsWhereInput {
  const range = dateRange(query);
  return {
    payment_method: query.paymentMethod ? (query.paymentMethod as payments_payment_method) : undefined,
    payment_status: query.paymentStatus ? (query.paymentStatus as payments_payment_status) : undefined,
    created_at: range,
  };
}

function paginate(query: CashierOrderQuery) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

function paymentAmount(value: unknown) {
  return Number(value ?? 0);
}

function summarizeOrders(orders: Awaited<ReturnType<typeof findCashierOrders>>[1]) {
  return {
    pendingOrders: orders.filter((order) => order.status === shipments_status.pending).length,
    failedOrCancelled: orders.filter(
      (order) => order.status === shipments_status.cancelled || order.payments?.payment_status === payments_payment_status.failed,
    ).length,
    paidToday: orders.filter((order) => order.payments?.payment_status === payments_payment_status.paid).length,
    totalRevenue: orders
      .filter((order) => order.payments?.payment_status === payments_payment_status.paid)
      .reduce((sum, order) => sum + paymentAmount(order.payments?.amount), 0),
  };
}

export async function getCashierDashboardSummary(currentUser: AuthUser, query: CashierOrderQuery) {
  ensureCashier(currentUser);
  await cancelExpiredCashierOrders(currentUser.branchId!);

  const branch = await findCashierBranch(currentUser.branchId!);
  const [_total, orders] = await findCashierOrders(currentUser.branchId!, buildOrderWhere(query), 0, 1000);
  const summary = summarizeOrders(orders);

  return toJsonSafe({
    branch,
    ...summary,
    growthPercent: 0,
    updatedAt: new Date().toISOString(),
  });
}

export async function getCashierOrders(currentUser: AuthUser, query: CashierOrderQuery) {
  ensureCashier(currentUser);
  await cancelExpiredCashierOrders(currentUser.branchId!);

  const { page, limit, skip, take } = paginate(query);
  const [total, orders] = await findCashierOrders(currentUser.branchId!, buildOrderWhere(query), skip, take);

  return {
    data: toJsonSafe(orders),
    meta: {
      page,
      perPage: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRecentCashierOrders(currentUser: AuthUser, query: CashierOrderQuery) {
  return getCashierOrders(currentUser, { ...query, page: 1, limit: query.limit ?? 5 });
}

export async function getCashierOrderDetail(currentUser: AuthUser, orderId: number) {
  ensureCashier(currentUser);
  await cancelExpiredCashierOrders(currentUser.branchId!);

  const order = await findCashierOrderById(currentUser.branchId!, orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return toJsonSafe(order);
}

export async function confirmCashierOrder(currentUser: AuthUser, orderId: number, trackingNumber?: string, actualWeight?: number) {
  ensureCashier(currentUser);

  const order = await findCashierOrderById(currentUser.branchId!, orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const branchName = order.branches_shipments_origin_branch_idTobranches.name;
  const inputResi = trackingNumber?.trim().toUpperCase();

  if (!inputResi) {
    throw new ValidationError("Nomor resi wajib diisi", {
      trackingNumber: ["Nomor resi wajib diisi."],
    });
  }

  if (inputResi !== order.tracking_number.toUpperCase()) {
    throw new ValidationError("Nomor resi tidak ditemukan.");
  }

  if (order.payments?.payment_status !== payments_payment_status.paid) {
    throw new ValidationError(
      "Pembayaran belum berhasil. Customer harus menyelesaikan pembayaran terlebih dahulu.",
    );
  }

  if (order.status !== shipments_status.pending) {
    throw new ValidationError("Pesanan ini sudah diverifikasi atau tidak dapat diverifikasi ulang.");
  }

  return toJsonSafe(await confirmCashierPackage(order.id, branchName, actualWeight));
}

export async function verifyCashierOrderByResi(currentUser: AuthUser, trackingNumber: string) {
  ensureCashier(currentUser);

  const resi = trackingNumber.trim().toUpperCase();

  if (!resi) {
    throw new ValidationError("Nomor resi wajib diisi", {
      trackingNumber: ["Nomor resi wajib diisi."],
    });
  }

  const order = await findCashierOrderByTrackingNumber(currentUser.branchId!, resi);

  if (!order) {
    throw new NotFoundError("Order dengan nomor resi tersebut tidak ditemukan di cabang Anda");
  }

  const branchName = order.branches_shipments_origin_branch_idTobranches.name;

  if (order.payments?.payment_status !== payments_payment_status.paid) {
    throw new ValidationError("Pembayaran belum berhasil. Customer harus menyelesaikan pembayaran terlebih dahulu.");
  }

  if (order.status !== shipments_status.pending) {
    throw new ValidationError("Pesanan ini sudah diverifikasi atau tidak dapat diverifikasi ulang.");
  }

  return toJsonSafe(await confirmCashierPackage(order.id, branchName));
}

export async function rejectOrder(currentUser: AuthUser, orderId: number, reason: string) {
  ensureCashier(currentUser);

  if (!reason.trim()) {
    throw new ValidationError("Alasan penolakan wajib diisi", {
      reason: ["Alasan penolakan wajib diisi."],
    });
  }

  const order = await findCashierOrderById(currentUser.branchId!, orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.status === shipments_status.delivered || order.status === shipments_status.cancelled) {
    throw new ValidationError("Order cannot be rejected");
  }

  return toJsonSafe(
    await rejectCashierOrder(order.id, reason, order.branches_shipments_origin_branch_idTobranches.name),
  );
}

export async function getCashierReports(currentUser: AuthUser, query: CashierOrderQuery) {
  ensureCashier(currentUser);

  const branch = await findCashierBranch(currentUser.branchId!);
  const payments = await findCashierPaymentsByBranch(currentUser.branchId!, buildPaymentWhere(query));
  const paid = payments.filter((payment) => payment.payment_status === payments_payment_status.paid);
  const totalRevenue = paid.reduce((sum, payment) => sum + paymentAmount(payment.amount), 0);
  const totalCash = paid
    .filter((payment) => payment.payment_method === payments_payment_method.cash)
    .reduce((sum, payment) => sum + paymentAmount(payment.amount), 0);
  const totalOnline = totalRevenue - totalCash;
  const totalPending = payments.filter((payment) => payment.payment_status === payments_payment_status.pending).length;
  const totalFailed = payments.filter((payment) => payment.payment_status === payments_payment_status.failed).length;
  const revenueByDay = new Map<string, number>();
  const revenueByMonth = new Map<string, number>();

  for (const payment of paid) {
    const rawDate = payment.payment_date ?? payment.created_at;
    const dayKey = rawDate.toISOString().slice(0, 10);
    const monthKey = rawDate.toISOString().slice(0, 7);
    const amount = paymentAmount(payment.amount);
    revenueByDay.set(dayKey, (revenueByDay.get(dayKey) ?? 0) + amount);
    revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) ?? 0) + amount);
  }

  const chartDaily = Array.from(revenueByDay.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, revenue]) => ({ date, revenue }));
  const chartMonthly = Array.from(revenueByMonth.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, revenue]) => ({ month, revenue }));

  return toJsonSafe({
    branch,
    summary: {
      totalRevenue,
      totalCash,
      totalOnline,
      totalPending,
      totalFailed,
      totalTransactions: payments.length,
    },
    chart: chartDaily,
    chartDaily,
    chartMonthly,
    transactions: payments,
  });
}
