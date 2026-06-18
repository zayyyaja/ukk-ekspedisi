import { STAFF_ROLES } from "@/constants/roles";
import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/middleware/auth.middleware";
import type { AuthUser } from "@/types/auth";

export async function requireStaff(): Promise<AuthUser> {
  const currentUser = await requireAuth();

  if (!STAFF_ROLES.includes(currentUser.role as (typeof STAFF_ROLES)[number])) {
    throw new ForbiddenError();
  }

  return currentUser;
}
