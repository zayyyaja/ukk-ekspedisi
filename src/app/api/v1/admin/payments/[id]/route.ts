import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getPaymentDetail } from "@/services/payment.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("admin");
    const { id } = await context.params;
    const payment = await getPaymentDetail(currentUser, Number(id));

    return successResponse("Payment detail retrieved successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
