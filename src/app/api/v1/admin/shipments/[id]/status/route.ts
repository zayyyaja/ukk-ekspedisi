import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { updateShipmentStatus } from "@/services/shipment.service";
import { validateRequest } from "@/lib/validation";
import { updateShipmentStatusSchema } from "@/validations/shipment.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("admin");
    const { id } = await context.params;
    const body = await request.json();
    const input = validateRequest(updateShipmentStatusSchema, body);
    const shipment = await updateShipmentStatus(currentUser, Number(id), input);

    return successResponse("Shipment status updated successfully", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
