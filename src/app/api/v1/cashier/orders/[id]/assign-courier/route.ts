import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { assignCourierToShipment } from "@/services/shipment.service";
import { assignCourierSchema } from "@/validations/shipment.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("cashier");
    const { id } = await context.params;
    const body = await request.json();
    const input = validateRequest(assignCourierSchema, body);
    const shipment = await assignCourierToShipment(currentUser, Number(id), input.courierCode);

    return successResponse("Pickup courier assigned successfully", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
