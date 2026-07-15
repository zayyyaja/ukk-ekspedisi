import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireCustomer } from "@/middleware/customer.middleware";
import { createOnlinePayment } from "@/services/payment.service";
import { createOnlinePaymentSchema } from "@/validations/payment.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireCustomer();
    const { id } = await context.params;
    const body = await request.json();
    const input = validateRequest(createOnlinePaymentSchema, body);
    const payment = await createOnlinePayment(currentUser, Number(id), input);

    return successResponse("Online payment created successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
