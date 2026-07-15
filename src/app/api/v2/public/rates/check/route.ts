import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { getRates } from "@/services/rate.service";
import { rateFilterSchema } from "@/validations/rate.validation";

export async function GET(request: NextRequest) {
  try {
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
