import { cookies } from "next/headers";

const ACCESS_TOKEN_NAME = "access_token";
const REFRESH_TOKEN_NAME = "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_NAME, accessToken, {
    ...authCookieOptions,
    maxAge: 60 * 15,
  });

  cookieStore.set(REFRESH_TOKEN_NAME, refreshToken, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_NAME);
  cookieStore.delete(REFRESH_TOKEN_NAME);
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_NAME)?.value ?? null;
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_NAME)?.value ?? null;
}
