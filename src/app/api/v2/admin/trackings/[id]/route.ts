import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getTrackingDetail } from "@/services/tracking.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const tracking = await getTrackingDetail(Number(id));

    return successResponse("Tracking detail retrieved successfully", tracking);
  } catch (error) {
    return handleApiError(error);
  }
}
