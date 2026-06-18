import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/middleware/auth.middleware";
import type { AuthRole, AuthUser } from "@/types/auth";

export async function requireRole(...roles: AuthRole[]): Promise<AuthUser> {
  const currentUser = await requireAuth();

  if (!roles.includes(currentUser.role)) {
    throw new ForbiddenError();
  }

  return currentUser;
}
