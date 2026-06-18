import type { AuthUser } from "@/types/auth";

export type BranchScope = {
  branchId?: number;
};

export function applyBranchScope(user: AuthUser): BranchScope {
  if (user.role === "admin" || user.role === "manager" || user.role === "customer") {
    return {};
  }

  if (user.branchId == null) {
    return {};
  }

  return {
    branchId: user.branchId,
  };
}
