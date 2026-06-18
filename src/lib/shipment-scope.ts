import type { AuthUser } from "@/types/auth";

export type ShipmentScope =
  | Record<string, never>
  | {
      OR: Array<Record<string, number>>;
    }
  | {
      courier_id: number;
    };

export function applyShipmentScope(user: AuthUser): ShipmentScope {
  if (user.role === "admin" || user.role === "manager") {
    return {};
  }

  if (user.role === "customer") {
    return {
      OR: [{ sender_id: user.id }, { receiver_id: user.id }],
    };
  }

  if (user.role === "courier") {
    return {
      courier_id: user.id,
    };
  }

  if (user.role === "cashier" && user.branchId != null) {
    return {
      OR: [
        { origin_branch_id: user.branchId },
        { destination_branch_id: user.branchId },
      ],
    };
  }

  return {};
}
