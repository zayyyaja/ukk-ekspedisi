import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { assignCourierToVehicle } from "@/services/vehicle.service";
import { assignCourierVehicleSchema } from "@/validations/vehicle.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(assignCourierVehicleSchema, await request.json());
    const vehicle = await assignCourierToVehicle(Number(id), input);

    return successResponse("Vehicle courier assigned successfully", vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}
