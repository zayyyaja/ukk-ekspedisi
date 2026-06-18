export const IDENTITY_TYPES = {
  customer: "customer",
  staff: "staff",
} as const;

export const USER_ROLES = {
  admin: "admin",
  cashier: "cashier",
  courier: "courier",
  manager: "manager",
} as const;

export const STAFF_ROLES = [
  USER_ROLES.admin,
  USER_ROLES.cashier,
  USER_ROLES.courier,
  USER_ROLES.manager,
] as const;

export const CUSTOMER_ROLE = "customer";

export const ALL_ROLES = [
  CUSTOMER_ROLE,
  USER_ROLES.admin,
  USER_ROLES.cashier,
  USER_ROLES.courier,
  USER_ROLES.manager,
] as const;

export const PERMISSIONS = {
  admin: [],
  cashier: [],
  courier: [],
  manager: [],
  customer: [],
} as const satisfies Record<(typeof ALL_ROLES)[number], readonly string[]>;
