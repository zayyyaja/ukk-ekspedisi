import { ZodError } from "zod";

import { AppError } from "@/lib/errors";
import { errorResponse, serverErrorResponse } from "@/lib/response";
import { formatZodError } from "@/lib/validation";
import type { ValidationErrors } from "@/types/api";

function withFallbackErrors(
  errors: ValidationErrors,
  fallbackMessage: string,
): ValidationErrors {
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  return { root: [fallbackMessage] };
}

export function handleApiError(error: unknown) {
  if (
    error instanceof ZodError ||
    (typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues?: unknown }).issues))
  ) {
    const errors = withFallbackErrors(
      formatZodError(error as ZodError),
      "Validasi gagal. Periksa kembali data yang dikirim.",
    );

    console.error("[API Validation Error]", errors);

    return errorResponse("Validation failed", errors, 422);
  }

  if (error instanceof AppError) {
    const errors = withFallbackErrors(
      (error.errors ?? {}) as ValidationErrors,
      error.message,
    );

    console.error("[API Error]", error.message, errors);

    return errorResponse(error.message, errors, error.statusCode);
  }

  console.error("[API Unhandled Error]", error);

  const message = error instanceof Error ? error.message : "Internal server error";

  return errorResponse(message, { root: [message] }, 500);
}
