import { handleApiError } from "@/lib/api-error";
import { getAccessTokenFromCookies } from "@/lib/cookies";
import { successResponse } from "@/lib/response";
import { getCurrentUser } from "@/services/auth.service";

export async function GET() {
  try {
    const accessToken = await getAccessTokenFromCookies();
    const user = await getCurrentUser(accessToken);

    return successResponse("Current user retrieved successfully", { user });
  } catch (error) {
    return handleApiError(error);
  }
}
