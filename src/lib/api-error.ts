import { ZodError } from "zod";

import { AppError } from "@/lib/errors";
import { errorResponse, serverErrorResponse } from "@/lib/response";
import { formatZodError } from "@/lib/validation";

export function handleApiError(error: unknown) {
  if (
    error instanceof ZodError ||
    (typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues?: unknown }).issues))
  ) {
    return errorResponse("Validation error", formatZodError(error as ZodError), 422);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, error.errors, error.statusCode);
  }

  console.error(error);

  return serverErrorResponse();
}
