import type { USER_ROLES } from "@/constants/roles";

export type IdentityType = "customer" | "staff";

export type StaffRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type AuthRole = StaffRole | "customer";

export type TokenType = "access" | "refresh";

export type AuthUser = {
  sub: string;
  id: number;
  type: IdentityType;
  role: AuthRole;
  branchId?: number | null;
  email: string;
  name: string;
};
