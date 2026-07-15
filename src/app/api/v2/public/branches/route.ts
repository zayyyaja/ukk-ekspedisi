import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { getBranches } from "@/services/branch.service";
import { branchFilterSchema } from "@/validations/branch.validation";

export async function GET(request: NextRequest) {
  try {
    const query = validateRequest(
      branchFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getBranches(query);

    return successResponse("Branches retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
