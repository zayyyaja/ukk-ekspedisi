import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import {
  deleteVehicleData,
  getVehicleDetail,
  updateVehicleData,
} from "@/services/vehicle.service";
import { updateVehicleSchema } from "@/validations/vehicle.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const vehicle = await getVehicleDetail(Number(id));

    return successResponse("Vehicle detail retrieved successfully", vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(updateVehicleSchema, await request.json());
    const vehicle = await updateVehicleData(Number(id), input);

    return successResponse("Vehicle updated successfully", vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const vehicle = await deleteVehicleData(Number(id));

    return successResponse("Vehicle deleted successfully", vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}
