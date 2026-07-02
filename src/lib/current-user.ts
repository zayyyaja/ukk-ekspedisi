import { getSessionUser } from "@/lib/session";
import { getCurrentUser as getCurrentUserFromSession } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUser(): Promise<AuthUser> {
  const session = await getSessionUser();

  return getCurrentUserFromSession(session);
}
