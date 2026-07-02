import { cookies } from "next/headers";

export { SESSION_COOKIE_NAME } from "@/lib/session";
export { createAuthSession, destroySession, getSessionUser } from "@/lib/session";

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("session_id");
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
