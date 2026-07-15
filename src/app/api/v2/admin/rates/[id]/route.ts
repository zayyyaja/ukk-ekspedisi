import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import {
  deleteRateData,
  getRateDetail,
  updateRateData,
} from "@/services/rate.service";
import { updateRateSchema } from "@/validations/rate.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const rate = await getRateDetail(Number(id));

    return successResponse("Rate detail retrieved successfully", rate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(updateRateSchema, await request.json());
    const rate = await updateRateData(Number(id), input);

    return successResponse("Rate updated successfully", rate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const rate = await deleteRateData(Number(id));

    return successResponse("Rate deleted successfully", rate);
  } catch (error) {
    return handleApiError(error);
  }
}
