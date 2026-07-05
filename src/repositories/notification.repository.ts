import { prisma } from "@/lib/prisma";

export function createCustomerNotification(data: {
  customerId: number;
  shipmentId: number;
  title: string;
  message: string;
}) {
  return prisma.customer_notifications.create({
    data: {
      customer_id: BigInt(data.customerId),
      shipment_id: BigInt(data.shipmentId),
      title: data.title,
      message: data.message,
    },
  });
}

export function findCustomerNotifications(
  customerId: number,
  skip: number,
  take: number,
) {
  return prisma.customer_notifications.findMany({
    where: {
      customer_id: BigInt(customerId),
    },
    include: {
      shipments: {
        select: {
          id: true,
          tracking_number: true,
          status: true,
          shipment_date: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take,
  });
}

export function countCustomerNotifications(customerId: number) {
  return prisma.customer_notifications.count({
    where: {
      customer_id: BigInt(customerId),
    },
  });
}

export function countUnreadCustomerNotifications(customerId: number) {
  return prisma.customer_notifications.count({
    where: {
      customer_id: BigInt(customerId),
      is_read: false,
    },
  });
}

export function findCustomerNotificationById(id: number, customerId: number) {
  return prisma.customer_notifications.findFirst({
    where: {
      id: BigInt(id),
      customer_id: BigInt(customerId),
    },
    include: {
      shipments: {
        select: {
          id: true,
          tracking_number: true,
          status: true,
          shipment_date: true,
        },
      },
    },
  });
}

export function markCustomerNotificationAsRead(id: number, customerId: number) {
  return prisma.customer_notifications.updateMany({
    where: {
      id: BigInt(id),
      customer_id: BigInt(customerId),
      is_read: false,
    },
    data: {
      is_read: true,
    },
  });
}
