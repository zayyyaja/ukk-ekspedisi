import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { handleMidtransWebhook } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    await handleMidtransWebhook(payload);
    
    // Midtrans webhook requires a 200 OK response
    return new Response("OK", { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
