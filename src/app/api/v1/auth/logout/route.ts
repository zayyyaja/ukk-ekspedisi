import { handleApiError } from "@/lib/api-error";
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "@/lib/cookies";
import { successResponse } from "@/lib/response";
import { logout } from "@/services/auth.service";

export async function POST() {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      getAccessTokenFromCookies(),
      getRefreshTokenFromCookies(),
    ]);

    await logout(accessToken, refreshToken);
    await clearAuthCookies();

    return successResponse("Logout successful");
  } catch (error) {
    return handleApiError(error);
  }
}
