import type { AuthUser } from "@/types/auth";

export type CustomerScope =
  | Record<string, never>
  | {
      id: number;
    };

export function applyCustomerScope(user: AuthUser): CustomerScope {
  if (user.role === "customer") {
    return {
      id: user.id,
    };
  }

  return {};
}
