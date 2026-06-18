import { getAccessTokenFromCookies } from "@/lib/cookies";
import { UnauthorizedError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { findCustomerById, findStaffById } from "@/repositories/auth.repository";
import type { AuthUser } from "@/types/auth";

function toBigIntId(id: string) {
  try {
    return BigInt(id);
  } catch {
    throw new UnauthorizedError("Invalid session");
  }
}

function toNumberId(id: bigint) {
  return Number(id);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    throw new UnauthorizedError();
  }

  const payload = await verifyAccessToken(accessToken);

  if (payload.type === "customer") {
    const customer = await findCustomerById(toBigIntId(payload.sub));

    if (!customer || !customer.is_verified) {
      throw new UnauthorizedError();
    }

    return {
      sub: customer.id.toString(),
      id: toNumberId(customer.id),
      type: "customer",
      role: "customer",
      branchId: null,
      email: customer.email,
      name: customer.name,
    };
  }

  const staff = await findStaffById(toBigIntId(payload.sub));

  if (!staff || !staff.is_active || !staff.email_verified_at) {
    throw new UnauthorizedError();
  }

  return {
    sub: staff.id.toString(),
    id: toNumberId(staff.id),
    type: "staff",
    role: staff.role,
    branchId: staff.branch_id ? toNumberId(staff.branch_id) : null,
    email: staff.email,
    name: staff.name,
  };
}
