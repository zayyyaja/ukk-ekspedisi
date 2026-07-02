import type { AuthUser } from "@/types/auth";

export type PaymentScope =
  | Record<string, never>
  | {
      forbidden: true;
    }
  | {
      shipments: {
        OR: Array<Record<string, number>>;
      };
    };

export function applyPaymentScope(user: AuthUser): PaymentScope {
  if (user.role === "admin" || user.role === "owner") {
    return {};
  }

  if (user.role === "manager") {
    return {
      forbidden: true,
    };
  }

  if (user.role === "courier") {
    return {
      forbidden: true,
    };
  }

  if (user.role === "customer") {
    return {
      shipments: {
        OR: [{ sender_id: user.id }, { receiver_id: user.id }],
      },
    };
  }

  if (user.role === "cashier" && user.branchId != null) {
    return {
      shipments: {
        OR: [
          { origin_branch_id: user.branchId },
          { destination_branch_id: user.branchId },
        ],
      },
    };
  }

  return {
    forbidden: true,
  };
}
