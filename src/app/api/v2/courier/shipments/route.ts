import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getCourierShipments } from "@/services/shipment.service";
import { validateRequest } from "@/lib/validation";
import { shipmentListQuerySchema } from "@/validations/shipment.validation";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("courier");
    const query = validateRequest(
      shipmentListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getCourierShipments(currentUser, query);

    return successResponse(
      "Assigned shipments retrieved successfully",
      result.data,
      result.meta,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
