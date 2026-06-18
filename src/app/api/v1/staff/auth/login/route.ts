import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { setAuthCookies } from "@/lib/cookies";
import { rateLimit } from "@/lib/rate-limit";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { loginStaff } from "@/services/auth.service";
import { staffLoginSchema } from "@/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    rateLimit(request, { key: "staff-login", limit: 10, windowMs: 60_000 });
    const body = await request.json();
    const input = validateRequest(staffLoginSchema, body);
    const { accessToken, refreshToken, user } = await loginStaff(input);

    await setAuthCookies(accessToken, refreshToken);

    return successResponse("Login successful", { user });
  } catch (error) {
    return handleApiError(error);
  }
}
