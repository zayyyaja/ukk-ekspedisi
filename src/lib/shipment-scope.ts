import type { Prisma } from "@prisma/client";

import type { AuthUser } from "@/types/auth";

export type ShipmentScope = Prisma.shipmentsWhereInput;

const ORIGIN_BRANCH_STATUSES = ["pending", "picked_up", "in_transit", "cancelled"] as const;
const DESTINATION_BRANCH_STATUSES = ["in_transit", "arrived_at_branch", "out_for_delivery", "delivered"] as const;

export function branchOperationalScope(branchId: number): ShipmentScope {
  return {
    OR: [
      {
        origin_branch_id: BigInt(branchId),
        status: { in: [...ORIGIN_BRANCH_STATUSES] },
      },
      {
        destination_branch_id: BigInt(branchId),
        status: { in: [...DESTINATION_BRANCH_STATUSES] },
      },
    ],
  };
}

export function isShipmentVisibleToBranch(
  branchId: number,
  shipment: { origin_branch_id: bigint; destination_branch_id: bigint; status: string },
) {
  const id = BigInt(branchId);
  const isOrigin = shipment.origin_branch_id === id;
  const isDest = shipment.destination_branch_id === id;

  if (isOrigin && ORIGIN_BRANCH_STATUSES.includes(shipment.status as any)) {
    return true;
  }

  if (isDest && DESTINATION_BRANCH_STATUSES.includes(shipment.status as any)) {
    return true;
  }

  return false;
}

export function applyShipmentScope(user: AuthUser): ShipmentScope {
  if (user.role === "manager") {
    return {};
  }

  if (user.role === "customer") {
    return {
      OR: [{ sender_id: BigInt(user.id) }, { receiver_id: BigInt(user.id) }],
    };
  }

  if (user.role === "courier") {
    return {
      courier_id: BigInt(user.id),
    };
  }

  if ((user.role === "admin" || user.role === "cashier") && user.branchId != null) {
    return branchOperationalScope(user.branchId);
  }

  return {};
}
