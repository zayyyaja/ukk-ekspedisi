import { handleApiError } from "@/lib/api-error";
import { destroySession } from "@/lib/session";
import { successResponse } from "@/lib/response";

export async function POST() {
  try {
    await destroySession();

    return successResponse("Logout successful");
  } catch (error) {
    return handleApiError(error);
  }
}
