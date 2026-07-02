import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import { syncCustomerPaymentStatus } from "@/services/payment.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    rateLimit(request, { key: "customer-payment-sync", limit: 30, windowMs: 60_000 });
    const currentUser = await requireCustomer();
    const { id } = await context.params;
    const payment = await syncCustomerPaymentStatus(currentUser, Number(id));

    return successResponse("Payment status synchronized successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
