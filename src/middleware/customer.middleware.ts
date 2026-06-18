import { ForbiddenError } from "@/lib/errors";
import { requireAuth } from "@/middleware/auth.middleware";
import type { AuthUser } from "@/types/auth";

export async function requireCustomer(): Promise<AuthUser> {
  const currentUser = await requireAuth();

  if (currentUser.role !== "customer") {
    throw new ForbiddenError();
  }

  return currentUser;
}
