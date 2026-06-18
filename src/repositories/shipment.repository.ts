import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  payments_payment_status,
  shipment_trackings_status,
  shipments_handover_method,
  shipments_status,
  users_role,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const shipmentInclude = {
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
  branches_shipments_origin_branch_idTobranches: true,
  branches_shipments_destination_branch_idTobranches: true,
  users: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      branch_id: true,
    },
  },
  rates: true,
  shipment_items: true,
  payments: true,
  shipment_trackings: {
    orderBy: {
      tracked_at: "asc" as const,
    },
  },
} satisfies Prisma.shipmentsInclude;

type CreateShipmentData = {
  trackingNumber: string;
  senderId: number;
  receiverId: number;
  originBranchId: number;
  destinationBranchId: number;
  rateId: number;
  handoverMethod: shipments_handover_method;
  totalWeight: number;
  totalPrice: number;
  paymentMethod: payments_payment_method;
  items: Array<{
    itemName: string;
    quantity: number;
    weight: number;
    photo?: string | null;
  }>;
};

export function findCustomerById(id: number) {
  return prisma.customers.findUnique({
    where: {
      id: BigInt(id),
    },
  });
}

export function findBranchById(id: number) {
  return prisma.branches.findUnique({
    where: {
      id: BigInt(id),
    },
  });
}

export function findRateById(id: number) {
  return prisma.rates.findUnique({
    where: {
      id: BigInt(id),
    },
  });
}

export function findCourierById(id: number) {
  return prisma.users.findFirst({
    where: {
      id: BigInt(id),
      role: users_role.courier,
      is_active: true,
    },
  });
}

export function createShipmentWithItemsAndPayment(data: CreateShipmentData) {
  return prisma.$transaction((tx) =>
    tx.shipments.create({
      data: {
        tracking_number: data.trackingNumber,
        sender_id: BigInt(data.senderId),
        receiver_id: BigInt(data.receiverId),
        origin_branch_id: BigInt(data.originBranchId),
        destination_branch_id: BigInt(data.destinationBranchId),
        rate_id: BigInt(data.rateId),
        handover_method: data.handoverMethod,
        total_weight: data.totalWeight,
        total_price: data.totalPrice,
        status: shipments_status.pending,
        shipment_date: new Date(),
        shipment_items: {
          create: data.items.map((item) => ({
            item_name: item.itemName,
            quantity: item.quantity,
            weight: item.weight,
            photo: item.photo ?? null,
          })),
        },
        payments: {
          create: {
            amount: data.totalPrice,
            payment_method: data.paymentMethod,
            payment_status: payments_payment_status.pending,
            payment_date: null,
            transaction_reference: null,
          },
        },
      },
      include: shipmentInclude,
    }),
  );
}

export function findShipmentById(id: number) {
  return prisma.shipments.findUnique({
    where: {
      id: BigInt(id),
    },
  });
}

export function findShipmentByTrackingNumber(trackingNumber: string) {
  return prisma.shipments.findUnique({
    where: {
      tracking_number: trackingNumber,
    },
    include: shipmentInclude,
  });
}

export function findShipmentWithRelations(id: number) {
  return prisma.shipments.findUnique({
    where: {
      id: BigInt(id),
    },
    include: shipmentInclude,
  });
}

export function findCustomerShipments(
  where: Prisma.shipmentsWhereInput,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.shipments.count({ where }),
    prisma.shipments.findMany({
      where,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
      include: {
        branches_shipments_origin_branch_idTobranches: true,
        branches_shipments_destination_branch_idTobranches: true,
        payments: true,
      },
    }),
  ]);
}

export function findAllShipments(
  where: Prisma.shipmentsWhereInput,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.shipments.count({ where }),
    prisma.shipments.findMany({
      where,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },
      include: {
        customers_shipments_sender_idTocustomers: true,
        customers_shipments_receiver_idTocustomers: true,
        branches_shipments_origin_branch_idTobranches: true,
        branches_shipments_destination_branch_idTobranches: true,
        users: true,
        payments: true,
      },
    }),
  ]);
}

export function findCourierShipments(
  courierId: number,
  where: Prisma.shipmentsWhereInput,
  skip: number,
  take: number,
) {
  return findAllShipments(
    {
      ...where,
      courier_id: BigInt(courierId),
    },
    skip,
    take,
  );
}

export function assignCourier(shipmentId: number, courierId: number) {
  return prisma.shipments.update({
    where: {
      id: BigInt(shipmentId),
    },
    data: {
      courier_id: BigInt(courierId),
    },
    include: shipmentInclude,
  });
}

export function updateShipmentStatus(
  shipmentId: number,
  status: shipments_status,
  tracking?: {
    status: shipment_trackings_status;
    location: string;
    description: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    if (tracking) {
      await tx.shipment_trackings.create({
        data: {
          shipment_id: BigInt(shipmentId),
          location: tracking.location,
          description: tracking.description,
          status: tracking.status,
          tracked_at: new Date(),
        },
      });
    }

    return tx.shipments.update({
      where: {
        id: BigInt(shipmentId),
      },
      data: {
        status,
        delivered_at:
          status === shipments_status.delivered ? new Date() : undefined,
      },
      include: shipmentInclude,
    });
  });
}

export function createShipmentTracking(
  shipmentId: number,
  status: shipment_trackings_status,
  location: string,
  description: string,
) {
  return prisma.shipment_trackings.create({
    data: {
      shipment_id: BigInt(shipmentId),
      location,
      description,
      status,
      tracked_at: new Date(),
    },
  });
}
