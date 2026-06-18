import type { AuthUser } from "@/types/auth";

type ShipmentOwnershipTarget = {
  sender_id: number | bigint;
  receiver_id: number | bigint;
};

type CustomerOwnershipTarget = {
  id: number | bigint;
};

function sameId(left: number | bigint, right: number | bigint) {
  return BigInt(left) === BigInt(right);
}

export function isShipmentOwner(
  user: AuthUser,
  shipment: ShipmentOwnershipTarget,
) {
  if (user.role !== "customer") {
    return false;
  }

  return (
    sameId(user.id, shipment.sender_id) ||
    sameId(user.id, shipment.receiver_id)
  );
}

export function isCustomerOwner(
  user: AuthUser,
  customer: CustomerOwnershipTarget,
) {
  return user.role === "customer" && sameId(user.id, customer.id);
}
