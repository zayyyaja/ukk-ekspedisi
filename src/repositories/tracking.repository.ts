import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function findTrackings(
  where: Prisma.shipment_trackingsWhereInput,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.shipment_trackings.count({ where }),
    prisma.shipment_trackings.findMany({
      where,
      skip,
      take,
      orderBy: { tracked_at: "desc" },
      include: {
        shipments: {
          select: {
            id: true,
            tracking_number: true,
            status: true,
            sender_id: true,
            receiver_id: true,
            origin_branch_id: true,
            destination_branch_id: true,
          },
        },
      },
    }),
  ]);
}

export function findTrackingById(id: number) {
  return prisma.shipment_trackings.findUnique({
    where: { id: BigInt(id) },
    include: {
      shipments: {
        include: {
          customers_shipments_sender_idTocustomers: {
            select: { id: true, name: true, email: true, city: true, phone: true },
          },
          customers_shipments_receiver_idTocustomers: {
            select: { id: true, name: true, email: true, city: true, phone: true },
          },
          branches_shipments_origin_branch_idTobranches: true,
          branches_shipments_destination_branch_idTobranches: true,
        },
      },
    },
  });
}
