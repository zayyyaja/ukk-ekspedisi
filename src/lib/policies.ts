import type { AuthUser } from "@/types/auth";

export function canViewShipment(user: AuthUser) {
  return ["admin", "cashier", "courier", "manager", "customer"].includes(
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
  return ["admin", "cashier", "manager", "customer"].includes(user.role);
}

export function canManageUsers(user: AuthUser) {
  return user.role === "admin";
}

export function canManageBranches(user: AuthUser) {
  return user.role === "admin";
}

export function canManageRates(user: AuthUser) {
  return user.role === "admin";
}

export function canManageVehicles(user: AuthUser) {
  return user.role === "admin";
}
