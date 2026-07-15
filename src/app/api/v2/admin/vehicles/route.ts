import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { createVehicleData, getVehicles } from "@/services/vehicle.service";
import {
  createVehicleSchema,
  vehicleFilterSchema,
} from "@/validations/vehicle.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin");
    const query = validateRequest(
      vehicleFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getVehicles(query);

    return successResponse("Vehicles retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const input = validateRequest(createVehicleSchema, await request.json());
    const vehicle = await createVehicleData(input);

    return successResponse("Vehicle created successfully", vehicle, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
