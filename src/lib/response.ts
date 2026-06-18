import { NextResponse } from "next/server";

import type {
  ApiErrorResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  ValidationErrors,
} from "@/types/api";

export function successResponse<T>(
  message = "Success",
  data: T | null = null,
  meta: ApiResponseMeta = null,
  status = 200,
) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status },
  );
}

export function errorResponse(
  message = "Error",
  errors: Record<string, unknown> = {},
  status = 400,
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

export function validationErrorResponse(
  errors: ValidationErrors,
  message = "Validation error",
) {
  return errorResponse(message, errors, 422);
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, {}, 401);
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, {}, 403);
}

export function notFoundResponse(message = "Not found") {
  return errorResponse(message, {}, 404);
}

export function serverErrorResponse(message = "Internal server error") {
  return errorResponse(message, {}, 500);
}
