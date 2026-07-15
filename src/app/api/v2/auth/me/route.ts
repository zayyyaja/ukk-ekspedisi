import { handleApiError } from "@/lib/api-error";
import { getSessionUser } from "@/lib/session";
import { successResponse } from "@/lib/response";
import { getCurrentUser } from "@/services/auth.service";

export async function GET() {
  try {
    const session = await getSessionUser();
    const user = await getCurrentUser(session);

    return successResponse("Current user retrieved successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}
