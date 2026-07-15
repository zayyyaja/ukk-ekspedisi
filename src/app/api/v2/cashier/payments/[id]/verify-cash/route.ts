import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { verifyCashPayment } from "@/services/payment.service";
import { verifyCashPaymentSchema } from "@/validations/payment.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("cashier");
    const { id } = await context.params;
    const body = await request.json();
    const input = validateRequest(verifyCashPaymentSchema, body);
    const payment = await verifyCashPayment(currentUser, Number(id), input);

    return successResponse("Cash payment verified successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
