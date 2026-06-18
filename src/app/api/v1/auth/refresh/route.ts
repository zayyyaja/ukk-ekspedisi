import { handleApiError } from "@/lib/api-error";
import { getRefreshTokenFromCookies, setAuthCookies } from "@/lib/cookies";
import { successResponse } from "@/lib/response";
import { refreshSession } from "@/services/auth.service";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    const { accessToken, refreshToken: newRefreshToken, user } =
      await refreshSession(refreshToken);

    await setAuthCookies(accessToken, newRefreshToken);

    return successResponse("Session refreshed successfully", { user });
  } catch (error) {
    return handleApiError(error);
  }
}
