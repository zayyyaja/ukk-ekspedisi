import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse } from "@/lib/response";
import { getPublicTracking } from "@/services/shipment.service";

type RouteContext = {
  params: Promise<{
    trackingNumber: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    rateLimit(request, { key: "public-tracking", limit: 60, windowMs: 60_000 });
    const { trackingNumber } = await context.params;
    const tracking = await getPublicTracking(trackingNumber);

    return successResponse("Tracking retrieved successfully", tracking);
  } catch (error) {
    return handleApiError(error);
  }
}
