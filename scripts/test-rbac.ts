import {
  canManageUsers,
  canViewPayment,
  canViewShipment,
} from "../src/lib/policies";
import { applyBranchScope } from "../src/lib/branch-scope";
import { applyCustomerScope } from "../src/lib/customer-scope";
import { applyPaymentScope } from "../src/lib/payment-scope";
import { applyShipmentScope } from "../src/lib/shipment-scope";
import { isShipmentOwner } from "../src/lib/ownership";
import type { AuthUser } from "../src/types/auth";

const admin: AuthUser = {
  sub: "1",
  id: 1,
  type: "staff",
  role: "admin",
  branchId: null,
  email: "admin@ekspedisi.test",
  name: "Admin Global",
};

const cashier: AuthUser = {
  sub: "3",
  id: 3,
  type: "staff",
  role: "cashier",
  branchId: 2,
  email: "cashier.depok@ekspedisi.test",
  name: "Cashier Depok",
};

const courier: AuthUser = {
  sub: "4",
  id: 4,
  type: "staff",
  role: "courier",
  branchId: 2,
  email: "courier.depok@ekspedisi.test",
  name: "Courier Depok",
};

const manager: AuthUser = {
  sub: "2",
  id: 2,
  type: "staff",
  role: "manager",
  branchId: null,
  email: "manager@ekspedisi.test",
  name: "Manager Global",
};

const customer: AuthUser = {
  sub: "1",
  id: 1,
  type: "customer",
  role: "customer",
  branchId: null,
  email: "iqbal.depok@example.com",
  name: "Iqbal Depok",
};

function assertCase(name: string, actual: unknown, expected: unknown) {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);

  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);

  if (!passed) {
    console.log("  expected:", expected);
    console.log("  actual:  ", actual);
    process.exitCode = 1;
  }
}

assertCase("Admin can manage users", canManageUsers(admin), true);
assertCase("Cashier cannot manage users", canManageUsers(cashier), false);
assertCase("Courier cannot view payment", canViewPayment(courier), false);
assertCase("Manager can view payment", canViewPayment(manager), true);
assertCase("Customer can view shipment", canViewShipment(customer), true);
assertCase(
  "Customer can view own shipment",
  isShipmentOwner(customer, { sender_id: 1, receiver_id: 2 }),
  true,
);
assertCase(
  "Customer cannot view other shipment",
  isShipmentOwner(customer, { sender_id: 2, receiver_id: 3 }),
  false,
);
assertCase("Admin branch scope is global", applyBranchScope(admin), {});
assertCase("Cashier branch scope is branch based", applyBranchScope(cashier), {
  branchId: 2,
});
assertCase("Courier shipment scope is assignment based", applyShipmentScope(courier), {
  courier_id: 4,
});
assertCase("Customer scope is own profile", applyCustomerScope(customer), {
  id: 1,
});
assertCase("Courier payment scope is forbidden", applyPaymentScope(courier), {
  forbidden: true,
});
