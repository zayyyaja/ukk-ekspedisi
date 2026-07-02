import type { AuthUser } from "@/types/auth";

export function canViewShipment(user: AuthUser) {
  return ["admin", "cashier", "courier", "manager", "owner", "customer"].includes(
    user.role,
  );
}

export function canUpdateShipment(user: AuthUser) {
  return ["admin", "cashier", "courier"].includes(user.role);
}

export function canDeleteShipment(user: AuthUser) {
  return user.role === "admin";
}

export function canViewPayment(user: AuthUser) {
  return ["admin", "cashier", "manager", "owner", "customer"].includes(user.role);
}

export function canManageUsers(user: AuthUser) {
  return ["admin", "manager"].includes(user.role);
}

export function canManageBranches(user: AuthUser) {
  return ["admin", "manager"].includes(user.role);
}

export function canManageRates(user: AuthUser) {
  return user.role === "admin";
}

export function canManageVehicles(user: AuthUser) {
  return user.role === "admin";
}
