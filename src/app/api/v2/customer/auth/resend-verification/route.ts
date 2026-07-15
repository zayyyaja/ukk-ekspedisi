import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { resendVerificationEmail } from "@/services/auth.service";
import { resendVerificationSchema } from "@/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateRequest(resendVerificationSchema, body);
    const result = await resendVerificationEmail(input);

    return successResponse(
      "Email verifikasi baru telah dikirim.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}