import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse } from "@/lib/response";
import { handleMidtransWebhook } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { key: "midtrans-webhook", limit: 120, windowMs: 60_000 });
    const payload = await request.json();
    const payment = await handleMidtransWebhook(payload);

    return successResponse("Webhook processed successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
