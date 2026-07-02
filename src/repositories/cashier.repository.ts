import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  payments_payment_status,
  shipment_trackings_status,
  shipments_handover_method,
  shipments_status,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { paymentInclude } from "@/repositories/payment.repository";
import { shipmentInclude } from "@/repositories/shipment.repository";

export const cashierOrderInclude = {
  customers_shipments_sender_idTocustomers: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
    },
  },
  customers_shipments_receiver_idTocustomers: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
    },
  },
  branches_shipments_origin_branch_idTobranches: true,
  branches_shipments_destination_branch_idTobranches: true,
  shipment_items: true,
  payments: true,
  shipment_trackings: {
    orderBy: { tracked_at: "asc" as const },
  },
} satisfies Prisma.shipmentsInclude;

export function findCashierBranch(branchId: number) {
  return prisma.branches.findUnique({
    where: { id: BigInt(branchId) },
  });
}

export async function cancelExpiredCashierOrders(branchId: number) {
  const expiredOrders = await prisma.shipments.findMany({
    where: {
      origin_branch_id: BigInt(branchId),
      status: shipments_status.pending,
      payments: {
        payment_method: payments_payment_method.cash,
        payment_status: payments_payment_status.pending,
        expired_at: {
          lte: new Date(),
        },
      },
    },
    include: {
      branches_shipments_origin_branch_idTobranches: true,
      payments: true,
    },
  });

  if (expiredOrders.length === 0) {
    return;
  }

  await prisma.$transaction(
    expiredOrders.flatMap((order) => [
      prisma.shipment_trackings.create({
        data: {
          shipment_id: order.id,
          location: order.branches_shipments_origin_branch_idTobranches.name,
          description: "Pesanan dibatalkan karena melewati batas pembayaran.",
          status: shipment_trackings_status.cancelled,
          tracked_at: new Date(),
        },
      }),
      prisma.payments.update({
        where: { shipment_id: order.id },
        data: { payment_status: payments_payment_status.failed },
      }),
      prisma.shipments.update({
        where: { id: order.id },
        data: { status: shipments_status.cancelled },
      }),
    ]),
  );
}

export function findCashierOrders(
  branchId: number,
  where: Prisma.shipmentsWhereInput,
  skip: number,
  take: number,
) {
  const scopedWhere: Prisma.shipmentsWhereInput = {
    AND: [
      { origin_branch_id: BigInt(branchId) },
      { status: { in: [shipments_status.pending, shipments_status.picked_up, shipments_status.in_transit, shipments_status.cancelled] } },
      where,
    ],
  };

  return prisma.$transaction([
    prisma.shipments.count({ where: scopedWhere }),
    prisma.shipments.findMany({
      where: scopedWhere,
      skip,
      take,
      orderBy: { created_at: "desc" },
      include: cashierOrderInclude,
    }),
  ]);
}

export function findCashierOrderById(branchId: number, orderId: number) {
  return prisma.shipments.findFirst({
    where: {
      id: BigInt(orderId),
      origin_branch_id: BigInt(branchId),
      status: { in: [shipments_status.pending, shipments_status.picked_up, shipments_status.in_transit, shipments_status.cancelled] },
    },
    include: cashierOrderInclude,
  });
}

export function findCashierOrderByTrackingNumber(branchId: number, trackingNumber: string) {
  return prisma.shipments.findFirst({
    where: {
      tracking_number: trackingNumber,
      origin_branch_id: BigInt(branchId),
      status: { in: [shipments_status.pending, shipments_status.picked_up, shipments_status.in_transit, shipments_status.cancelled] },
    },
    include: cashierOrderInclude,
  });
}

export function findCashierPaymentsByBranch(
  branchId: number,
  where: Prisma.paymentsWhereInput = {},
) {
  return prisma.payments.findMany({
    where: {
      AND: [
        where,
        {
          shipments: {
            origin_branch_id: BigInt(branchId),
          },
        },
      ],
    },
    orderBy: { created_at: "desc" },
    include: paymentInclude,
  });
}

export function confirmCashierPayment(paymentId: bigint) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payments.update({
      where: { id: paymentId },
      data: {
        payment_status: payments_payment_status.paid,
        payment_date: new Date(),
        transaction_reference: `CASH-${paymentId.toString()}-${Date.now()}`,
      },
    });

    await tx.shipments.update({
      where: { id: payment.shipment_id },
      data: { paid_at: new Date() },
    });

    return tx.shipments.findUniqueOrThrow({
      where: { id: payment.shipment_id },
      include: cashierOrderInclude,
    });
  });
}

export function confirmCashierPackage(shipmentId: bigint, location: string, actualWeight?: number) {
  return prisma.$transaction(async (tx) => {
    let description = "Paket telah diterima oleh petugas.";

    if (actualWeight) {
      const shipment = await tx.shipments.findUniqueOrThrow({
        where: { id: shipmentId },
        include: { rates: true },
      });

      if (Number(actualWeight) > Number(shipment.total_weight)) {
        let newPrice = Number(actualWeight) * Number(shipment.rates.price_per_kg);
        if (shipment.handover_method === shipments_handover_method.pickup) {
          newPrice += 10000;
        }

        if (newPrice > Number(shipment.total_price)) {
          await tx.payments.update({
            where: { shipment_id: shipmentId },
            data: {
              payment_status: payments_payment_status.pending,
              amount: newPrice,
            },
          });

          await tx.shipments.update({
            where: { id: shipmentId },
            data: {
              total_weight: actualWeight,
              total_price: newPrice,
            },
          });

          description = "Paket diterima namun terdapat selisih berat. Menunggu pelunasan sisa biaya.";
        }
      }
    }

    await tx.shipment_trackings.create({
      data: {
        shipment_id: shipmentId,
        location,
        description,
        status: shipment_trackings_status.picked_up,
        tracked_at: new Date(),
      },
    });

    return tx.shipments.update({
      where: { id: shipmentId },
      data: { status: shipments_status.picked_up },
      include: cashierOrderInclude,
    });
  });
}

export function rejectCashierOrder(shipmentId: bigint, reason: string, location: string) {
  return prisma.$transaction(async (tx) => {
    await tx.shipment_trackings.create({
      data: {
        shipment_id: shipmentId,
        location,
        description: reason,
        status: shipment_trackings_status.cancelled,
        tracked_at: new Date(),
      },
    });

    return tx.shipments.update({
      where: { id: shipmentId },
      data: { status: shipments_status.cancelled },
      include: shipmentInclude,
    });
  });
}
