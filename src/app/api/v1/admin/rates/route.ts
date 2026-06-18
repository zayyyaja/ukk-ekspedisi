import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { createRateData, getRates } from "@/services/rate.service";
import { createRateSchema, rateFilterSchema } from "@/validations/rate.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin", "manager");
    const query = validateRequest(
      rateFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getRates(query);

    return successResponse("Rates retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const input = validateRequest(createRateSchema, await request.json());
    const rate = await createRateData(input);

    return successResponse("Rate created successfully", rate, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
