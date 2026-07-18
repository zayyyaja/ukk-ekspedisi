import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  payments_payment_status,
  shipment_trackings_status,
  shipments_created_source,
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
      address: true,
      city: true,
      phone: true,
    },
  },
  customers_shipments_receiver_idTocustomers: {
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
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
      courier_code: true,
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
  receiver?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address: string;
    city: string;
  };
  originBranchId: number;
  destinationBranchId: number;
  rateId: number;
  handoverMethod: shipments_handover_method;
  totalWeight: number;
  totalPrice: number;
  paymentMethod: payments_payment_method;
  createdSource?: shipments_created_source;
  createdByUserId?: number | null;
  paymentExpiredAt?: Date | null;
  items: Array<{
    itemName: string;
    quantity: number;
    weight: number;
    itemType?: string | null;
    photo?: string | null;
  }>;
};

type CashierCustomerData = {
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
};

type CreateCashierShipmentData = Omit<CreateShipmentData, "senderId" | "receiverId" | "createdSource" | "createdByUserId"> & {
  sender: CashierCustomerData;
  receiver: CashierCustomerData;
  cashierId: number;
};

export function findCustomerById(id: number) {
  return prisma.customers.findUnique({
    where: {
      id: BigInt(id),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
    }
  });
}

export function findCustomerByEmail(email: string) {
  return prisma.customers.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
    }
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

export function findRateByCities(originCity: string, destinationCity: string) {
  return prisma.rates.findFirst({
    where: {
      origin_city: originCity,
      destination_city: destinationCity,
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
    select: {
      id: true,
      name: true,
      courier_code: true,
      branch_id: true,
    }
  });
}

export function findCourierByCode(courierCode: string) {
  return prisma.users.findFirst({
    where: {
      courier_code: courierCode,
      role: users_role.courier,
      is_active: true,
    },
    select: {
      id: true,
      name: true,
      courier_code: true,
      branch_id: true,
    }
  });
}

export function countCustomerPendingPaymentShipments(customerId: number) {
  return prisma.shipments.count({
    where: {
      sender_id: BigInt(customerId),
      payments: {
        payment_status: payments_payment_status.pending,
      },
    },
  });
}

export function countCustomerCreatedShipmentsSince(customerId: number, since: Date) {
  return prisma.shipments.count({
    where: {
      sender_id: BigInt(customerId),
      created_at: {
        gte: since,
      },
    },
  });
}

export function createShipmentWithItemsAndPayment(data: CreateShipmentData) {
  return prisma.$transaction(async (tx) => {
    const normalizedReceiverEmail = data.receiver?.email?.trim().toLowerCase() || null;
    const receiver = data.receiver
      ? normalizedReceiverEmail
        ? await tx.customers.upsert({
            where: { email: normalizedReceiverEmail },
            update: {
              name: data.receiver.name,
              phone: data.receiver.phone || "-",
              address: data.receiver.address,
              city: data.receiver.city,
            },
            create: {
              name: data.receiver.name,
              email: normalizedReceiverEmail,
              password: null,
              email_verified_at: null,
              address: data.receiver.address,
              city: data.receiver.city,
              phone: data.receiver.phone || "-",
              photo: null,
            },
          })
        : await tx.customers.create({
            data: {
              name: data.receiver.name,
              email: null,
              password: null,
              email_verified_at: null,
              address: data.receiver.address,
              city: data.receiver.city,
              phone: data.receiver.phone || "-",
              photo: null,
            },
          })
      : null;

    return tx.shipments.create({
      data: {
        tracking_number: data.trackingNumber,
        sender_id: BigInt(data.senderId),
        receiver_id: receiver?.id ?? BigInt(data.receiverId),
        origin_branch_id: BigInt(data.originBranchId),
        destination_branch_id: BigInt(data.destinationBranchId),
        rate_id: BigInt(data.rateId),
        handover_method: data.handoverMethod,
        total_weight: data.totalWeight,
        total_price: data.totalPrice,
        status: shipments_status.pending,
        created_source: data.createdSource ?? shipments_created_source.customer,
        created_by_user_id: data.createdByUserId ? BigInt(data.createdByUserId) : null,
        shipment_date: new Date(),
        shipment_items: {
          create: data.items.map((item) => ({
            item_name: item.itemType ? `${item.itemName} (${item.itemType})` : item.itemName,
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
            expired_at: data.paymentExpiredAt ?? null,
          },
        },
      },
      include: shipmentInclude,
    });
  });
}

export function createCashierShipmentWithCustomers(data: CreateCashierShipmentData) {
  return prisma.$transaction(async (tx) => {
    const normalizedEmail = data.sender.email?.trim().toLowerCase() || null;
    const sender = normalizedEmail
      ? await tx.customers.upsert({
          where: { email: normalizedEmail },
          update: {
            name: data.sender.name,
            phone: data.sender.phone,
            address: data.sender.address,
            city: data.sender.city,
          },
          create: {
            name: data.sender.name,
            email: normalizedEmail,
            password: null,
            email_verified_at: null,
            address: data.sender.address,
            city: data.sender.city,
            phone: data.sender.phone,
            photo: null,
          },
        })
      : await tx.customers.create({
          data: {
            name: data.sender.name,
            email: null,
            password: null,
            email_verified_at: null,
            address: data.sender.address,
            city: data.sender.city,
            phone: data.sender.phone,
            photo: null,
          },
        });

    const receiver = await tx.customers.create({
      data: {
        name: data.receiver.name,
        email: data.receiver.email?.trim().toLowerCase() || null,
        password: null,
        email_verified_at: null,
        address: data.receiver.address,
        city: data.receiver.city,
        phone: data.receiver.phone,
        photo: null,
      },
    });

    const originBranch = await tx.branches.findUniqueOrThrow({
      where: { id: BigInt(data.originBranchId) },
    });

    return tx.shipments.create({
      data: {
        tracking_number: data.trackingNumber,
        sender_id: sender.id,
        receiver_id: receiver.id,
        origin_branch_id: BigInt(data.originBranchId),
        destination_branch_id: BigInt(data.destinationBranchId),
        rate_id: BigInt(data.rateId),
        handover_method: data.handoverMethod,
        total_weight: data.totalWeight,
        total_price: data.totalPrice,
        status: shipments_status.picked_up,
        created_source: shipments_created_source.cashier,
        created_by_user_id: BigInt(data.cashierId),
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
            expired_at: data.paymentExpiredAt ?? null,
          },
        },
        shipment_trackings: {
          create: {
            location: originBranch.name,
            description: "Paket walk-in diterima kasir dan langsung dikonfirmasi siap kirim.",
            status: shipment_trackings_status.picked_up,
            tracked_at: new Date(),
          },
        },
      },
      include: shipmentInclude,
    });
  });
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
        customers_shipments_sender_idTocustomers: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            city: true,
            phone: true,
          },
        },
        customers_shipments_receiver_idTocustomers: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            city: true,
            phone: true,
          },
        },
        branches_shipments_origin_branch_idTobranches: true,
        branches_shipments_destination_branch_idTobranches: true,
        shipment_items: true,
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
        users: {
          select: {
            id: true,
            name: true,
            courier_code: true,
          },
        },
        payments: true,
      },
    }),
  ]);
}

export function findCourierShipments(
  courierId: number,
  branchId: number | null | undefined,
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

export function assignCourier(
  shipmentId: number,
  options: {
    mode: "pickup" | "delivery";
    location: string;
    courier: {
      id: number;
      name: string;
      courier_code: string | null;
    };
  },
) {
  const { courier, mode, location } = options;
  const courierLabel = courier.courier_code
    ? `${courier.name} (${courier.courier_code})`
    : courier.name;
  const description =
    mode === "pickup"
      ? `Kurir ${courierLabel} ditugaskan menjemput paket. Handled by: Kurir ${courier.name}`
      : `Kurir ${courierLabel} ditugaskan mengantar paket ke penerima. Handled by: Kurir ${courier.name}`;

  return prisma.$transaction(async (tx) => {
    await tx.shipment_trackings.create({
      data: {
        shipment_id: BigInt(shipmentId),
        location,
        description,
        status:
          mode === "pickup"
            ? shipment_trackings_status.picked_up
            : shipment_trackings_status.arrived_at_branch,
        tracked_at: new Date(),
      },
    });

    return tx.shipments.update({
      where: {
        id: BigInt(shipmentId),
      },
      data: {
        courier_id: BigInt(courier.id),
      },
      include: shipmentInclude,
    });
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
  photo?: string
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
        ...(photo && { photo }),
        ...((status === shipments_status.in_transit ||
          status === shipments_status.arrived_at_branch) && {
          courier_id: null,
        }),
      },
      include: shipmentInclude,
    });
  });
}

export function cancelCustomerShipment(shipmentId: number) {
  return prisma.$transaction(async (tx) => {
    await tx.shipment_trackings.create({
      data: {
        shipment_id: BigInt(shipmentId),
        location: "Customer",
        description: "Pesanan dibatalkan oleh customer sebelum pembayaran berhasil.",
        status: shipment_trackings_status.cancelled,
        tracked_at: new Date(),
      },
    });

    return tx.shipments.update({
      where: { id: BigInt(shipmentId) },
      data: { status: shipments_status.cancelled },
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
