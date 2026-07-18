import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  payments_payment_status,
  shipments_handover_method,
} from "@prisma/client";

import {
  findBranchesByIds,
  findAllPayments,
  findCashierBranchPayments,
  findCustomerPayments,
  findPaymentByShipmentId,
  findPaymentByTransactionReference,
  findPaymentWithShipment,
  getPaymentSummary,
  updatePaymentStatus,
  updatePaymentTransactionReference,
} from "@/repositories/payment.repository";
import { env } from "@/config/env";
import { createSnapTransaction, getMidtransTransactionStatus, verifyMidtransSignature } from "@/lib/midtrans";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type { AuthUser } from "@/types/auth";
import type {
  CreateOnlinePaymentInput,
  PaymentFilterInput,
  VerifyCashPaymentInput,
} from "@/validations/payment.validation";

type MidtransWebhookPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status:
    | "settlement"
    | "capture"
    | "pending"
    | "deny"
    | "expire"
    | "cancel"
    | "failure";
};

type MidtransStatusPayload = Pick<MidtransWebhookPayload, "order_id" | "transaction_status"> & {
  status_code?: string;
  gross_amount?: string;
};

function toJsonSafe<T>(value: T) {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue: unknown) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      return currentValue;
    }),
  ) as unknown;
}

function toNumber(value: unknown) {
  return Number(value);
}

function paginate(query: PaymentFilterInput) {
  return {
    page: query.page,
    limit: query.limit,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  };
}

function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function buildPaymentWhere(query: PaymentFilterInput): Prisma.paymentsWhereInput {
  const where: Prisma.paymentsWhereInput = {};

  if (query.paymentStatus) {
    where.payment_status = query.paymentStatus as payments_payment_status;
  }

  if (query.paymentMethod) {
    where.payment_method = query.paymentMethod as payments_payment_method;
  }

  if (query.fromDate || query.toDate) {
    where.payment_date = {
      gte: query.fromDate ? new Date(query.fromDate) : undefined,
      lte: query.toDate ? new Date(query.toDate) : undefined,
    };
  }

  if (query.branchId) {
    where.shipments = {
      origin_branch_id: BigInt(query.branchId),
    };
  }

  return where;
}

function ensureCustomer(user: AuthUser) {
  if (user.role !== "customer") {
    throw new ForbiddenError("Customer access required");
  }
}

function ensureCashier(user: AuthUser) {
  if (user.role !== "cashier") {
    throw new ForbiddenError("Cashier access required");
  }
}

function ensureAdmin(user: AuthUser) {
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
}

function ensureAdminOrManager(user: AuthUser) {
  if (user.role !== "admin" && user.role !== "manager") {
    throw new ForbiddenError("Admin or manager access required");
  }
}

function ensurePaymentOwner(
  user: AuthUser,
  payment: NonNullable<Awaited<ReturnType<typeof findPaymentWithShipment>>>,
) {
  const shipment = payment.shipments;

  if (
    shipment.sender_id !== BigInt(user.id) &&
    shipment.receiver_id !== BigInt(user.id)
  ) {
    throw new ForbiddenError("You are not allowed to access this payment");
  }
}

function ensureCashierBranch(
  user: AuthUser,
  payment: NonNullable<Awaited<ReturnType<typeof findPaymentWithShipment>>>,
) {
  if (!user.branchId) {
    throw new ForbiddenError("Cashier branch is required");
  }

  if (payment.shipments.origin_branch_id !== BigInt(user.branchId)) {
    throw new ForbiddenError("You can only access payments from your branch");
  }
}

function mapMidtransStatus(status: MidtransWebhookPayload["transaction_status"]) {
  if (status === "settlement" || status === "capture") {
    return payments_payment_status.paid;
  }

  if (status === "pending") {
    return payments_payment_status.pending;
  }

  return payments_payment_status.failed;
}

function normalizeMidtransStatus(status: unknown): MidtransWebhookPayload["transaction_status"] {
  if (
    status === "settlement" ||
    status === "capture" ||
    status === "pending" ||
    status === "deny" ||
    status === "expire" ||
    status === "cancel" ||
    status === "failure"
  ) {
    return status;
  }

  return "failure";
}

function mapEnabledPayments(paymentMethod: CreateOnlinePaymentInput["paymentMethod"]) {
  const mapping: Record<CreateOnlinePaymentInput["paymentMethod"], string[]> = {
    qris: ["other_qris"],
    gopay: ["gopay"],
    shopeepay: ["shopeepay"],
    bca_va: ["bca_va"],
    bni_va: ["bni_va"],
    bri_va: ["bri_va"],
    mandiri_va: ["echannel"],
  };

  return mapping[paymentMethod];
}

export async function createOnlinePayment(
  currentUser: AuthUser,
  shipmentId: number,
  input: CreateOnlinePaymentInput,
) {
  ensureCustomer(currentUser);

  const payment = await findPaymentByShipmentId(shipmentId);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  ensurePaymentOwner(currentUser, payment);

  if (payment.shipments.sender_id !== BigInt(currentUser.id)) {
    throw new ForbiddenError("Penerima hanya dapat melihat detail dan tracking shipment.");
  }

  if (payment.payment_status === payments_payment_status.paid) {
    throw new ValidationError("Payment is already paid");
  }

  const orderId = `EXP-${payment.shipments.tracking_number}-${Date.now()}`;
  const amount = toNumber(payment.amount);
  const sender = payment.shipments.customers_shipments_sender_idTocustomers;
  const appUrl = env.APP_URL;
  const transaction = (await createSnapTransaction({
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: sender.name,
      email: sender.email,
      phone: sender.phone,
    },
    item_details: [
      {
        id: payment.shipments.tracking_number,
        price: amount,
        quantity: 1,
        name: `Ongkos Kirim ${payment.shipments.tracking_number}`,
      },
    ],
    enabled_payments: mapEnabledPayments(input.paymentMethod),
    callbacks: {
      finish: `${appUrl}/customer/pesanan/${shipmentId}?payment=finish`,
      error: `${appUrl}/customer/pembayaran/${shipmentId}?status=error`,
      pending: `${appUrl}/customer/pembayaran/${shipmentId}?status=pending`,
    },
  })) as {
    token?: string;
    redirect_url?: string;
  };

  const updatedPayment = await updatePaymentTransactionReference({
    paymentId: Number(payment.id),
    transactionReference: orderId,
    paymentMethod: input.paymentMethod as payments_payment_method,
  });

  return {
    paymentId: Number(updatedPayment.id),
    snapToken: transaction.token ?? null,
    redirectUrl: transaction.redirect_url ?? null,
    orderId,
  };
}

export async function handleMidtransWebhook(payload: MidtransWebhookPayload) {
  if (!verifyMidtransSignature(payload)) {
    throw new ForbiddenError("Invalid Midtrans signature");
  }

  const payment = await findPaymentByTransactionReference(payload.order_id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  if (payment.payment_status === payments_payment_status.paid) {
    return toJsonSafe(payment);
  }

  const paymentStatus = mapMidtransStatus(payload.transaction_status);

  if (paymentStatus === payments_payment_status.pending) {
    return toJsonSafe(payment);
  }

  const updatedPayment = await updatePaymentStatus({
    paymentId: Number(payment.id),
    paymentStatus,
    paymentDate:
      paymentStatus === payments_payment_status.paid ? new Date() : null,
    transactionReference: payload.order_id,
  });

  return toJsonSafe(updatedPayment);
}

async function applyMidtransPaymentStatus(payload: MidtransStatusPayload) {
  const payment = await findPaymentByTransactionReference(payload.order_id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  if (payment.payment_status === payments_payment_status.paid) {
    return toJsonSafe(payment);
  }

  const paymentStatus = mapMidtransStatus(
    normalizeMidtransStatus(payload.transaction_status),
  );

  if (paymentStatus === payments_payment_status.pending) {
    return toJsonSafe(payment);
  }

  const updatedPayment = await updatePaymentStatus({
    paymentId: Number(payment.id),
    paymentStatus,
    paymentDate:
      paymentStatus === payments_payment_status.paid ? new Date() : null,
    transactionReference: payload.order_id,
  });

  return toJsonSafe(updatedPayment);
}

export async function syncCustomerPaymentStatus(
  currentUser: AuthUser,
  shipmentId: number,
) {
  ensureCustomer(currentUser);

  const payment = await findPaymentByShipmentId(shipmentId);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  ensurePaymentOwner(currentUser, payment);

  if (!payment.transaction_reference) {
    return toJsonSafe(payment);
  }

  if (payment.payment_status === payments_payment_status.paid) {
    return toJsonSafe(payment);
  }

  const status = await getMidtransTransactionStatus(payment.transaction_reference);

  return applyMidtransPaymentStatus({
    order_id: String(status.order_id ?? payment.transaction_reference),
    transaction_status: normalizeMidtransStatus(status.transaction_status),
    status_code: status.status_code ? String(status.status_code) : undefined,
    gross_amount: status.gross_amount ? String(status.gross_amount) : undefined,
  });
}

export async function verifyCashPayment(
  currentUser: AuthUser,
  paymentId: number,
  input: VerifyCashPaymentInput,
) {
  ensureCashier(currentUser);

  const payment = await findPaymentWithShipment(paymentId);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  ensureCashierBranch(currentUser, payment);

  if (payment.payment_method !== payments_payment_method.cash) {
    throw new ValidationError("Only cash payment can be verified by cashier");
  }

  if (payment.payment_status !== payments_payment_status.pending) {
    throw new ValidationError("Only pending cash payment can be verified");
  }

  if (payment.shipments.handover_method !== shipments_handover_method.drop_off) {
    throw new ValidationError("Cash payment is only allowed for drop off");
  }

  if (input.paidAmount < toNumber(payment.amount)) {
    throw new ValidationError("Paid amount is lower than payment amount");
  }

  const updatedPayment = await updatePaymentStatus({
    paymentId,
    paymentStatus: payments_payment_status.paid,
    paymentDate: new Date(),
    transactionReference: `CASH-${paymentId}-${Date.now()}`,
  });

  return toJsonSafe(updatedPayment);
}

export async function getCustomerPayments(
  currentUser: AuthUser,
  query: PaymentFilterInput,
) {
  ensureCustomer(currentUser);

  const { page, limit, skip, take } = paginate(query);
  const [total, payments] = await findCustomerPayments(
    currentUser.id,
    buildPaymentWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(payments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getCashierPayments(
  currentUser: AuthUser,
  query: PaymentFilterInput,
) {
  ensureCashier(currentUser);

  if (!currentUser.branchId) {
    throw new ForbiddenError("Cashier branch is required");
  }

  const { page, limit, skip, take } = paginate(query);
  const [total, payments] = await findCashierBranchPayments(
    currentUser.branchId,
    buildPaymentWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(payments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getAdminPayments(
  currentUser: AuthUser,
  query: PaymentFilterInput,
) {
  ensureAdminOrManager(currentUser);

  const { page, limit, skip, take } = paginate(query);
  const [total, payments] = await findAllPayments(
    buildPaymentWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(payments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getPaymentDetail(currentUser: AuthUser, paymentId: number) {
  const payment = await findPaymentWithShipment(paymentId);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  if (currentUser.role === "customer") {
    ensurePaymentOwner(currentUser, payment);
  } else if (currentUser.role === "cashier") {
    ensureCashierBranch(currentUser, payment);
  } else if (currentUser.role !== "admin" && currentUser.role !== "manager") {
    throw new ForbiddenError("You are not allowed to access this payment");
  }

  return toJsonSafe(payment);
}

export async function getManagerPaymentSummary(currentUser: AuthUser) {
  ensureAdminOrManager(currentUser);

  const [revenueSummary, statusSummary, methodSummary, branchSummary] =
    await getPaymentSummary();
  const branches = await findBranchesByIds(
    branchSummary.map((summary) => summary.origin_branch_id),
  );
  const branchNames = new Map(
    branches.map((branch) => [branch.id.toString(), branch.name]),
  );

  const revenueByMethod = methodSummary.reduce<Record<string, number>>(
    (summary, method) => {
      summary[method.payment_method] = toNumber(method._sum?.amount ?? 0);

      return summary;
    },
    {},
  );
  const revenueByBranch = branchSummary.reduce<Record<string, number>>(
    (summary, branch) => {
      const branchName =
        branchNames.get(branch.origin_branch_id.toString()) ??
        `Branch #${branch.origin_branch_id.toString()}`;
      summary[branchName] = toNumber(branch._sum?.total_price ?? 0);

      return summary;
    },
    {},
  );
  const totalByStatus = statusSummary.reduce<Record<string, number>>(
    (summary, status) => {
      const count =
        typeof status._count === "number"
          ? status._count
          : (status._count as any)?._all ?? 0;
      summary[status.payment_status] = count;

      return summary;
    },
    {},
  );

  return {
    totalRevenue: toNumber(revenueSummary._sum.amount ?? 0),
    totalPaid: totalByStatus[payments_payment_status.paid] ?? 0,
    totalPending: totalByStatus[payments_payment_status.pending] ?? 0,
    totalFailed: totalByStatus[payments_payment_status.failed] ?? 0,
    revenueByMethod,
    revenueByBranch,
  };
}
