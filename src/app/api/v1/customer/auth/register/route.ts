import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { registerCustomer } from "@/services/auth.service";
import { customerRegisterSchema } from "@/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { key: "customer-register", limit: 5, windowMs: 60_000 });
    const body = await request.json();
    const input = validateRequest(customerRegisterSchema, body);
    const result = await registerCustomer(input);

    return successResponse(
      "Registration successful. Please verify your email.",
      result,
      null,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
