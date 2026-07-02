import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { verifyCustomerEmail } from "@/services/auth.service";
import { verifyEmailSchema } from "@/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateRequest(verifyEmailSchema, body);

    await verifyCustomerEmail(input);

    return successResponse(
      "Email verified successfully. Your account has been created.",
      null,
    );
  } catch (error) {
    return handleApiError(error);
  }
}