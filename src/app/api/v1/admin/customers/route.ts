import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { getCustomers } from "@/services/customer.service";
import { customerFilterSchema } from "@/validations/customer.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin", "manager");
    const query = validateRequest(
      customerFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getCustomers(query);

    return successResponse("Customers retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
