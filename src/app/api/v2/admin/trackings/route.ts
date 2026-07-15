import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { getTrackings } from "@/services/tracking.service";
import { trackingFilterSchema } from "@/validations/tracking.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin");
    const query = validateRequest(
      trackingFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getTrackings(query);

    return successResponse("Trackings retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
