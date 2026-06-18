import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  payments_payment_status,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const paymentInclude = {
  shipments: {
    include: {
      branches_shipments_origin_branch_idTobranches: true,
      branches_shipments_destination_branch_idTobranches: true,
      customers_shipments_sender_idTocustomers: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          phone: true,
        },
      },
      customers_shipments_receiver_idTocustomers: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          phone: true,
        },
      },
    },
  },
} satisfies Prisma.paymentsInclude;

export function findPaymentById(paymentId: number) {
  return prisma.payments.findUnique({
    where: {
      id: BigInt(paymentId),
    },
  });
}

export function findPaymentByShipmentId(shipmentId: number) {
  return prisma.payments.findUnique({
    where: {
      shipment_id: BigInt(shipmentId),
    },
    include: paymentInclude,
  });
}

export function findPaymentByTransactionReference(transactionReference: string) {
  return prisma.payments.findFirst({
    where: {
      transaction_reference: transactionReference,
    },
    include: paymentInclude,
  });
}

export function findPaymentWithShipment(paymentId: number) {
  return prisma.payments.findUnique({
    where: {
      id: BigInt(paymentId),
    },
    include: paymentInclude,
  });
}

export function createPayment(data: {
  shipmentId: number;
  amount: number;
  paymentMethod: payments_payment_method;
}) {
  return prisma.payments.create({
    data: {
      shipment_id: BigInt(data.shipmentId),
      amount: data.amount,
      payment_method: data.paymentMethod,
      payment_status: payments_payment_status.pending,
      payment_date: null,
      transaction_reference: null,
    },
  });
}

export function updatePaymentStatus(data: {
  paymentId: number;
  paymentStatus: payments_payment_status;
  paymentDate?: Date | null;
  transactionReference?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payments.update({
      where: {
        id: BigInt(data.paymentId),
      },
      data: {
        payment_status: data.paymentStatus,
        payment_date: data.paymentDate,
        transaction_reference: data.transactionReference ?? undefined,
      },
    });

    if (data.paymentStatus === payments_payment_status.paid) {
      await tx.shipments.update({
        where: {
          id: payment.shipment_id,
        },
        data: {
          paid_at: new Date(),
        },
      });
    }

    return tx.payments.findUniqueOrThrow({
      where: {
        id: payment.id,
      },
      include: paymentInclude,
    });
  });
}

export function updatePaymentTransactionReference(data: {
  paymentId: number;
  transactionReference: string;
  paymentMethod?: payments_payment_method;
}) {
  return prisma.payments.update({
    where: {
      id: BigInt(data.paymentId),
    },
    data: {
      transaction_reference: data.transactionReference,
      payment_method: data.paymentMethod,
      payment_status: payments_payment_status.pending,
    },
    include: paymentInclude,
  });
}

export function findCustomerPayments(
  customerId: number,
  where: Prisma.paymentsWhereInput,
  skip: number,
  take: number,
) {
  const scopedWhere: Prisma.paymentsWhereInput = {
    ...where,
    shipments: {
      OR: [{ sender_id: BigInt(customerId) }, { receiver_id: BigInt(customerId) }],
    },
  };

  return prisma.$transaction([
    prisma.payments.count({ where: scopedWhere }),
    prisma.payments.findMany({
      where: scopedWhere,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
      include: paymentInclude,
    }),
  ]);
}

export function findCashierBranchPayments(
  branchId: number,
  where: Prisma.paymentsWhereInput,
  skip: number,
  take: number,
) {
  const scopedWhere: Prisma.paymentsWhereInput = {
    ...where,
    shipments: {
      origin_branch_id: BigInt(branchId),
    },
  };

  return prisma.$transaction([
    prisma.payments.count({ where: scopedWhere }),
    prisma.payments.findMany({
      where: scopedWhere,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
      include: paymentInclude,
    }),
  ]);
}

export function findAllPayments(
  where: Prisma.paymentsWhereInput,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.payments.count({ where }),
    prisma.payments.findMany({
      where,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
      include: paymentInclude,
    }),
  ]);
}

export function getPaymentSummary() {
  return prisma.$transaction([
    prisma.payments.aggregate({
      where: { payment_status: payments_payment_status.paid },
      _sum: { amount: true },
    }),
    prisma.payments.groupBy({
      by: ["payment_status"],
      _count: { _all: true },
    }),
    prisma.payments.groupBy({
      by: ["payment_method"],
      where: { payment_status: payments_payment_status.paid },
      _sum: { amount: true },
    }),
    prisma.shipments.groupBy({
      by: ["origin_branch_id"],
      where: { payments: { payment_status: payments_payment_status.paid } },
      _sum: { total_price: true },
    }),
  ]);
}

export function findBranchesByIds(branchIds: bigint[]) {
  return prisma.branches.findMany({
    where: { id: { in: branchIds } },
    select: { id: true, name: true },
  });
}
