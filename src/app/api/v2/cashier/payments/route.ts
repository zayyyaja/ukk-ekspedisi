import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { getCashierPayments } from "@/services/payment.service";
import { paymentFilterSchema } from "@/validations/payment.validation";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const query = validateRequest(
      paymentFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getCashierPayments(currentUser, query);

    return successResponse("Payments retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
