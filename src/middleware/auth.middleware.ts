import { getCurrentUser } from "@/lib/current-user";
import type { AuthUser } from "@/types/auth";

export async function requireAuth(): Promise<AuthUser> {
  return getCurrentUser();
}
