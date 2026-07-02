export const IDENTITY_TYPES = {
  customer: "customer",
  staff: "staff",
} as const;

export const USER_ROLES = {
  admin: "admin",
  cashier: "cashier",
  courier: "courier",
  manager: "manager",
  owner: "owner",
} as const;

export const STAFF_ROLES = [
  USER_ROLES.admin,
  USER_ROLES.cashier,
  USER_ROLES.courier,
  USER_ROLES.manager,
  USER_ROLES.owner,
] as const;

export const CUSTOMER_ROLE = "customer";

export const ALL_ROLES = [
  CUSTOMER_ROLE,
  USER_ROLES.admin,
  USER_ROLES.cashier,
  USER_ROLES.courier,
  USER_ROLES.manager,
  USER_ROLES.owner,
] as const;

export const PERMISSIONS = {
  admin: [],
  cashier: [],
  courier: [],
  manager: [],
  owner: [],
  customer: [],
} as const satisfies Record<(typeof ALL_ROLES)[number], readonly string[]>;
